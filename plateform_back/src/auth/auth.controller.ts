import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'generated/prisma';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserRequest } from 'src/users/dto/create-user.request';
import { VerifyTokenRequest } from 'src/users/dto/verify-token.request';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

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
    checkVerificationToken(
        @Body() verifyTokenBody: VerifyTokenRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.verifyEmailToken(verifyTokenBody, response);
    }
}
