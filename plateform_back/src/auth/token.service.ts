import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { User } from 'generated/prisma';
import ms from 'ms';
import { BrevoService } from 'src/auth/brevo.service';
import { VerifyTokenRequest } from 'src/users/dto/verify-token.request';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TokenService {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly brevoService: BrevoService,
    ) {}

    async generateAndSendVerificationToken(email: string): Promise<void> {
        const now = Date.now();

        const tokenResendIntervalMs = ms(
            this.configService.getOrThrow<string>(
                'TOKEN_RESEND_INTERVAL',
            ) as ms.StringValue,
        );

        const user = await this.usersService.findOneWithCredentials({ email });
        if (!user) {
            throw new BadRequestException('User not found.');
        }

        if (
            user.emailVerificationLastSentAt &&
            now - user.emailVerificationLastSentAt.getTime() <
                tokenResendIntervalMs
        ) {
            const remaining = Math.ceil(
                (tokenResendIntervalMs -
                    (now - user.emailVerificationLastSentAt.getTime())) /
                    1000,
            );
            throw new BadRequestException(
                `Please wait ${remaining}s before requesting a new code.`,
            );
        }

        const emailVerificationToken = randomInt(100000, 1000000);

        await this.usersService.update({
            where: { email: user.email },
            data: {
                emailVerificationToken,
                emailVerificationLastSentAt: new Date(),
            },
        });

        if (this.configService.get('SEND_EMAILS') === 'true') {
            await this.brevoService.sendConfirmationEmail(
                user.email,
                emailVerificationToken,
            );
        }
    }

    async verifyEmailToken(
        emailVerificationToken: VerifyTokenRequest,
    ): Promise<User> {
        const { email, token } = emailVerificationToken;
        const user = await this.usersService.findOneWithCredentials({ email });

        if (!user) {
            throw new UnauthorizedException('User not found.');
        }

        if (user.emailVerificationToken !== token) {
            throw new UnauthorizedException('Invalid verification token.');
        }

        if (user.emailVerificationLastSentAt) {
            const tokenAgeMs =
                Date.now() - user.emailVerificationLastSentAt.getTime();
            const tokenValidityMs = ms(
                this.configService.getOrThrow<string>(
                    'TOKEN_VALIDITY',
                ) as ms.StringValue,
            );
            if (tokenAgeMs > tokenValidityMs) {
                throw new UnauthorizedException(
                    'Email verification token has expired.',
                );
            }
        }

        await this.usersService.update({
            where: { email },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationLastSentAt: null,
            },
        });

        return user;
    }

    async generateAndSendPasswordResetToken(user: User): Promise<void> {
        const now = Date.now();

        const tokenResendIntervalMs = ms(
            this.configService.getOrThrow<string>(
                'TOKEN_RESEND_INTERVAL',
            ) as ms.StringValue,
        );

        if (
            user.passwordResetLastSentAt &&
            now - user.passwordResetLastSentAt.getTime() < tokenResendIntervalMs
        ) {
            const remaining = Math.ceil(
                (tokenResendIntervalMs -
                    (now - user.passwordResetLastSentAt.getTime())) /
                    1000,
            );
            throw new BadRequestException(
                `Please wait ${remaining}s before requesting a new code.`,
            );
        }

        const passwordResetToken = randomInt(100000, 1000000);

        await this.usersService.update({
            where: { email: user.email },
            data: {
                passwordResetToken,
                passwordResetLastSentAt: new Date(),
            },
        });

        if (this.configService.get('SEND_EMAILS') === 'true') {
            await this.brevoService.sendPasswordResetEmail(
                user.email,
                passwordResetToken,
            );
        }
    }
}
