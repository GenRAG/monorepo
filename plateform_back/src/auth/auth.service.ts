import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcryptjs from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from 'generated/prisma';
import { Response } from 'express';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { CreateUserRequest } from 'src/users/dto/create-user.request';
import { TokenService } from 'src/auth/token.service';
import { NewPasswordRequest } from 'src/users/dto/verify-token.request';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
        private readonly jwtService: JwtService,
    ) {}

    login(user: User, response: Response): { tokenPayload: TokenPayload } {
        const expires = new Date();
        const tokenValidityMs = ms(
            this.configService.getOrThrow<string>(
                'JWT_EXPIRATION',
            ) as ms.StringValue,
        );

        if (typeof tokenValidityMs !== 'number') {
            throw new Error('Invalid JWT_EXPIRATION format');
        }

        expires.setMilliseconds(expires.getMilliseconds() + tokenValidityMs);

        const tokenPayload: TokenPayload = { userId: user.id };

        const token = this.jwtService.sign(tokenPayload);

        response.cookie('Authentication', token, {
            secure: true,
            httpOnly: true,
            expires: expires,
        });

        return { tokenPayload };
    }

    async register(registerBody: CreateUserRequest): Promise<void> {
        const { email } = registerBody;

        const existingUser = await this.usersService.findOne({ email });
        if (existingUser) {
            throw new UnauthorizedException(
                'User with this email already exists.',
            );
        }

        const createdUser = await this.usersService.create({
            ...registerBody,
            isEmailVerified: false,
        });

        if (this.configService.get('SEND_EMAILS') === 'true') {
            await this.tokenService.generateAndSendVerificationToken(
                createdUser.email,
            );
        }
    }

    async verifyUser(email: string, password: string) {
        const user = await this.usersService.findOneWithCredentials({ email });

        if (!user || !user.password || typeof user.password !== 'string') {
            throw new UnauthorizedException('Credentials are not valid.');
        }

        const authenticated = await bcryptjs.compare(password, user.password);
        if (!authenticated) {
            throw new UnauthorizedException('Credentials are not valid.');
        }

        if (
            this.configService.get('SEND_EMAILS') === 'true' &&
            !user.isEmailVerified
        ) {
            throw new UnauthorizedException('Account not verified');
        }

        if (user.passwordResetToken) {
            await this.usersService.update({
                where: { email },
                data: {
                    passwordResetToken: null,
                    passwordResetLastSentAt: null,
                },
            });
        }

        return user;
    }

    async initiatePasswordReset(email: string): Promise<void> {
        const user = await this.usersService.findOneWithCredentials({ email });
        if (!user) {
            throw new UnauthorizedException(
                'No user found with the provided email.',
            );
        }

        await this.tokenService.generateAndSendPasswordResetToken(user);
    }

    async verifyPasswordResetToken(
        verifyTokenBody: NewPasswordRequest,
    ): Promise<void> {
        const { email, token, password } = verifyTokenBody;
        const user = await this.usersService.findOneWithCredentials({ email });

        if (!user || user.passwordResetToken !== token) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        if (user.passwordResetLastSentAt) {
            const tokenAgeMs =
                Date.now() - user.passwordResetLastSentAt.getTime();
            const tokenValidityMs = ms(
                this.configService.getOrThrow<string>(
                    'TOKEN_VALIDITY',
                ) as ms.StringValue,
            );

            if (typeof tokenValidityMs !== 'number') {
                throw new Error('Invalid TOKEN_VALIDITY format');
            }

            if (tokenAgeMs > tokenValidityMs) {
                throw new UnauthorizedException(
                    'Password reset token has expired.',
                );
            }
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        await this.usersService.update({
            where: { email },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetLastSentAt: null,
            },
        });
    }
}
