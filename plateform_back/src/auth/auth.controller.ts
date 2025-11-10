import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'generated/prisma';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserRequest } from 'src/users/dto/create-user.request';
import {
    NewPasswordRequest,
    ResendVerifyTokenRequest,
    VerifyTokenRequest,
} from 'src/users/dto/verify-token.request';
import { TokenService } from 'src/auth/token.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly tokenService: TokenService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(
        @CurrentUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.login(user, response);
    }

    @Post('register')
    register(@Body() registerBody: CreateUserRequest) {
        return this.authService.register(registerBody);
    }

    @Post('verification-token')
    async checkVerificationToken(
        @Body() verifyTokenBody: VerifyTokenRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        const user = await this.tokenService.verifyEmailToken(verifyTokenBody);
        return this.login(user, response);
    }

    @Post('resend-verification-token')
    resendVerificationToken(@Body() verifyTokenBody: ResendVerifyTokenRequest) {
        return this.tokenService.generateAndSendVerificationToken(
            verifyTokenBody.email,
        );
    }

    @Post('reset-password')
    resetPassword(@Body() resetPasswordBody: ResendVerifyTokenRequest) {
        console.log(
            'Received reset password request for email:',
            resetPasswordBody.email,
        );
        return this.authService.initiatePasswordReset(resetPasswordBody.email);
    }

    @Post('verify-password-reset-token')
    verifyPasswordResetToken(@Body() verifyTokenBody: NewPasswordRequest) {
        return this.authService.verifyPasswordResetToken(verifyTokenBody);
    }
}
