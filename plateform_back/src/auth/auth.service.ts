import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from 'generated/prisma';
import { Response } from 'express';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { CreateUserRequest } from 'src/users/dto/create-user.request';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    login(user: User, response: Response): { tokenPayload: TokenPayload } {
        const expires = new Date();
        const jwtExpiration =
            this.configService.getOrThrow<string>('JWT_EXPIRATION');
        const expirationMs = ms(jwtExpiration as ms.StringValue);

        if (typeof expirationMs !== 'number') {
            throw new Error('Invalid JWT_EXPIRATION format');
        }
        expires.setMilliseconds(expires.getMilliseconds() + expirationMs);

        const tokenPayload: TokenPayload = { userId: user.id };

        const token = this.jwtService.sign(tokenPayload);

        response.cookie('Authentication', token, {
            secure: true,
            httpOnly: true,
            expires: expires,
        });

        return { tokenPayload };
    }

    async register(
        registerBody: CreateUserRequest,
        response: Response,
    ): Promise<{ tokenPayload: TokenPayload }> {
        const { email } = registerBody;

        const existingUser = await this.usersService.getUser({ email });
        if (existingUser) {
            throw new UnauthorizedException(
                'User with this email already exists.',
            );
        }

        const createdUser = await this.usersService.createUser({
            ...registerBody,
        });

        if (!createdUser) {
            throw new UnauthorizedException(
                'User registration failed. Please try again.',
            );
        }

        return this.login(createdUser, response);
    }

    async verifyUser(email: string, password: string) {
        try {
            const user = await this.usersService.getUser({ email });

            if (!user || !user.password || typeof user.password !== 'string') {
                throw new UnauthorizedException('Credentials are not valid.');
            }

            const authenticated = await bcrypt.compare(password, user.password);

            if (!authenticated) {
                throw new UnauthorizedException();
            }

            return user;
        } catch (error) {
            throw new UnauthorizedException(
                'Credentials are not valid.',
                error,
            );
        }
    }
}
