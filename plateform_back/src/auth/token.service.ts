import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt } from 'crypto';
import { User } from 'generated/prisma';
import ms from 'ms';
import { ResendService } from 'src/auth/resend.service';
import { LoginAttemptService } from 'src/auth/login-attempt.service';
import { VerifyTokenRequest } from 'src/auth/dto/verify-token.request';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TokenService {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly resendService: ResendService,
        private readonly loginAttempt: LoginAttemptService,
    ) {}

    hashOtpCode(code: number): string {
        return createHmac('sha256', this.configService.getOrThrow<string>('JWT_SECRET'))
            .update(code.toString())
            .digest('hex');
    }

    async generateAndSendVerificationToken(email: string): Promise<void> {
        const normalizedEmail = email.toLowerCase().trim();
        const now = Date.now();

        const tokenResendIntervalMs = ms(
            this.configService.getOrThrow<string>('TOKEN_RESEND_INTERVAL') as ms.StringValue,
        );

        const user = await this.usersService.findOneWithCredentials({ email: normalizedEmail });
        if (!user) {
            throw new BadRequestException('Invalid request.');
        }

        if (
            user.emailVerificationLastSentAt &&
            now - user.emailVerificationLastSentAt.getTime() < tokenResendIntervalMs
        ) {
            const remaining = Math.ceil(
                (tokenResendIntervalMs - (now - user.emailVerificationLastSentAt.getTime())) / 1000,
            );
            throw new BadRequestException(`Veuillez attendre ${remaining}s avant de demander un nouveau code.`);
        }

        const plainToken = randomInt(100000, 1000000);
        const hashedToken = this.hashOtpCode(plainToken);

        await this.usersService.update({
            where: { email: normalizedEmail },
            data: {
                emailVerificationToken: hashedToken,
                emailVerificationLastSentAt: new Date(),
            },
        });

        if (this.configService.get('SEND_EMAILS') === 'true') {
            await this.resendService.sendConfirmationEmail(normalizedEmail, plainToken);
        }
    }

    async verifyEmailToken(emailVerificationToken: VerifyTokenRequest): Promise<User> {
        const email = emailVerificationToken.email.toLowerCase().trim();
        const { token: code } = emailVerificationToken;

        if (await this.loginAttempt.isBlocked(email)) {
            throw new UnauthorizedException('Too many failed attempts. Try again later.');
        }

        const user = await this.usersService.findOneWithCredentials({ email });

        if (!user || !user.emailVerificationToken || !user.emailVerificationLastSentAt) {
            await this.loginAttempt.recordFailure(email);
            throw new UnauthorizedException('Invalid verification token.');
        }

        const tokenAgeMs = Date.now() - user.emailVerificationLastSentAt.getTime();
        const tokenValidityMs = ms(this.configService.getOrThrow<string>('TOKEN_VALIDITY') as ms.StringValue);
        if (tokenAgeMs > tokenValidityMs) {
            await this.loginAttempt.recordFailure(email);
            throw new UnauthorizedException('Email verification token has expired.');
        }

        const hashedIncoming = this.hashOtpCode(code);
        if (user.emailVerificationToken !== hashedIncoming) {
            await this.loginAttempt.recordFailure(email);
            throw new UnauthorizedException('Invalid verification token.');
        }

        await this.loginAttempt.reset(email);
        await this.usersService.update({
            where: { email },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationLastSentAt: null,
            },
        });

        const fresh = await this.usersService.findOneWithCredentials({ email });
        return fresh!;
    }

    async generateAndSendPasswordResetToken(user: User): Promise<void> {
        const now = Date.now();

        const tokenResendIntervalMs = ms(
            this.configService.getOrThrow<string>('TOKEN_RESEND_INTERVAL') as ms.StringValue,
        );

        if (user.passwordResetLastSentAt && now - user.passwordResetLastSentAt.getTime() < tokenResendIntervalMs) {
            const remaining = Math.ceil(
                (tokenResendIntervalMs - (now - user.passwordResetLastSentAt.getTime())) / 1000,
            );
            throw new BadRequestException(`Please wait ${remaining}s before requesting a new code.`);
        }

        const plainToken = randomInt(100000, 1000000);
        const hashedToken = this.hashOtpCode(plainToken);

        await this.usersService.update({
            where: { email: user.email },
            data: {
                passwordResetToken: hashedToken,
                passwordResetLastSentAt: new Date(),
            },
        });

        if (this.configService.get('SEND_EMAILS') === 'true') {
            await this.resendService.sendPasswordResetEmail(user.email, plainToken);
        }
    }
}
