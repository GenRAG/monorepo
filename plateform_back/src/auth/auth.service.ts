import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
import { NewPasswordRequest, VerifyTokenRequest } from 'src/auth/dto/verify-token.request';
import { JwtBlacklistService } from 'src/auth/jwt-blacklist.service';
import { LoginAttemptService } from 'src/auth/login-attempt.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly isProduction: boolean;

    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
        private readonly jwtService: JwtService,
        private readonly jwtBlacklist: JwtBlacklistService,
        private readonly loginAttempt: LoginAttemptService,
    ) {
        this.isProduction = this.configService.get('NODE_ENV') === 'production';
    }

    login(user: User, response: Response): { success: true } {
        const expires = new Date();
        const tokenValidityMs = ms(this.configService.getOrThrow<string>('JWT_EXPIRATION') as ms.StringValue);

        if (typeof tokenValidityMs !== 'number') {
            throw new Error('Invalid JWT_EXPIRATION format');
        }

        expires.setMilliseconds(expires.getMilliseconds() + tokenValidityMs);

        const tokenPayload: TokenPayload = { userId: user.id, jti: randomUUID() };
        const token = this.jwtService.sign(tokenPayload);

        response.cookie('Authentication', token, {
            secure: this.isProduction,
            httpOnly: true,
            expires,
            sameSite: this.isProduction ? 'none' : 'lax',
        });

        return { success: true };
    }

    async logout(token: string): Promise<void> {
        try {
            const payload = this.jwtService.decode(token);
            if (!payload?.jti) return;

            const tokenValidityMs = ms(this.configService.getOrThrow<string>('JWT_EXPIRATION') as ms.StringValue);
            const remainingMs = payload.exp ? payload.exp * 1000 - Date.now() : tokenValidityMs;
            const ttlSeconds = Math.max(1, Math.ceil(Math.min(remainingMs, tokenValidityMs) / 1000));

            await this.jwtBlacklist.blacklist(payload.jti, ttlSeconds);
        } catch {
            // best-effort: if decode fails the token was invalid anyway
        }
    }

    async register(registerBody: CreateUserRequest): Promise<void> {
        const email = registerBody.email.toLowerCase().trim();

        const existingUser = await this.usersService.findOne({ email });
        if (existingUser) {
            throw new ConflictException('An account with this email already exists.');
        }

        const createdUser = await this.usersService.create({
            ...registerBody,
            email,
            isEmailVerified: false,
        });

        if (this.isProduction) {
            await this.tokenService.generateAndSendVerificationToken(createdUser.email);
        }
    }

    async verifyUser(email: string, password: string) {
        const normalizedEmail = email.toLowerCase().trim();

        if (await this.loginAttempt.isBlocked(normalizedEmail)) {
            throw new UnauthorizedException('Too many failed attempts. Try again later.');
        }

        const user = await this.usersService.findOneWithCredentials({ email: normalizedEmail });

        if (!user || !user.password || typeof user.password !== 'string') {
            await this.loginAttempt.recordFailure(normalizedEmail);
            throw new UnauthorizedException('Credentials are not valid.');
        }

        const authenticated = await bcryptjs.compare(password, user.password);
        if (!authenticated) {
            await this.loginAttempt.recordFailure(normalizedEmail);
            throw new UnauthorizedException('Credentials are not valid.');
        }

        await this.loginAttempt.reset(normalizedEmail);

        if (this.isProduction && !user.isEmailVerified) {
            throw new UnauthorizedException('Account not verified');
        }

        if (user.passwordResetToken) {
            await this.usersService.update({
                where: { email: normalizedEmail },
                data: {
                    passwordResetToken: null,
                    passwordResetLastSentAt: null,
                },
            });
        }

        return user;
    }

    async initiatePasswordReset(email: string): Promise<void> {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await this.usersService.findOneWithCredentials({ email: normalizedEmail });

        if (!user) {
            this.logger.debug(`Password reset requested for unknown email: ${normalizedEmail}`);
            return;
        }

        await this.tokenService.generateAndSendPasswordResetToken(user);
    }

    async verifyEmailAndLogin(body: VerifyTokenRequest, response: Response) {
        const user = await this.tokenService.verifyEmailToken(body);
        return this.login(user, response);
    }

    resendVerificationToken(email: string): Promise<void> {
        return this.tokenService.generateAndSendVerificationToken(email);
    }

    async verifyPasswordResetToken(verifyTokenBody: NewPasswordRequest): Promise<void> {
        const { code, password } = verifyTokenBody;
        const email = verifyTokenBody.email.toLowerCase().trim();

        if (await this.loginAttempt.isBlocked(email)) {
            throw new UnauthorizedException('Too many failed attempts. Try again later.');
        }

        const user = await this.usersService.findOneWithCredentials({ email });

        if (!user || !user.passwordResetToken || !user.passwordResetLastSentAt) {
            await this.loginAttempt.recordFailure(email);
            throw new UnauthorizedException('Invalid credentials.');
        }

        const hashedIncoming = this.tokenService.hashOtpCode(code);
        if (user.passwordResetToken !== hashedIncoming) {
            await this.loginAttempt.recordFailure(email);
            throw new UnauthorizedException('Invalid credentials.');
        }

        const tokenAgeMs = Date.now() - user.passwordResetLastSentAt.getTime();
        const tokenValidityMs = ms(this.configService.getOrThrow<string>('TOKEN_VALIDITY') as ms.StringValue);

        if (typeof tokenValidityMs !== 'number') {
            throw new Error('Invalid TOKEN_VALIDITY format');
        }

        if (tokenAgeMs > tokenValidityMs) {
            await this.loginAttempt.recordFailure(email);
            throw new UnauthorizedException('Password reset token has expired.');
        }

        await this.loginAttempt.reset(email);

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
