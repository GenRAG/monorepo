import { Body, Controller, Post, Req, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'generated/prisma';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserRequest } from 'src/users/dto/create-user.request';
import { NewPasswordRequest, ResendVerifyTokenRequest, VerifyTokenRequest } from 'src/auth/dto/verify-token.request';
import { LoginRequest } from 'src/auth/dto/login.request';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(ThrottlerGuard, LocalAuthGuard)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('login')
    login(
        @Body() _loginRequest: LoginRequest,
        @CurrentUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.login(user, response);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('register')
    register(@Body() registerBody: CreateUserRequest) {
        return this.authService.register(registerBody);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('verification-token')
    checkVerificationToken(@Body() body: VerifyTokenRequest, @Res({ passthrough: true }) response: Response) {
        return this.authService.verifyEmailAndLogin(body, response);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('resend-verification-token')
    resendVerificationToken(@Body() body: ResendVerifyTokenRequest) {
        return this.authService.resendVerificationToken(body.email);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('reset-password')
    resetPassword(@Body() body: ResendVerifyTokenRequest) {
        return this.authService.initiatePasswordReset(body.email);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('verify-password-reset-token')
    verifyPasswordResetToken(@Body() body: NewPasswordRequest) {
        return this.authService.verifyPasswordResetToken(body);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post('google')
    googleLogin(@Body('credential') credential: string, @Res({ passthrough: true }) response: Response) {
        if (!credential) throw new BadRequestException('Missing Google credential');
        return this.authService.loginWithGoogle(credential, response);
    }

    @Post('logout')
    async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const token: string | undefined = request.cookies['Authentication'];
        if (token) {
            await this.authService.logout(token);
        }
        response.clearCookie('Authentication', { httpOnly: true, path: '/' });
        return { success: true };
    }
}
