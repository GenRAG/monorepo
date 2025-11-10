import { IsEmail, IsNumber, IsStrongPassword } from 'class-validator';

export class VerifyTokenRequest {
    @IsEmail()
    email: string;

    @IsNumber()
    token: number;
}

export class ResendVerifyTokenRequest {
    @IsEmail()
    email: string;
}

export class ResetPasswordRequest extends ResendVerifyTokenRequest {}

export class NewPasswordRequest extends VerifyTokenRequest {
    @IsStrongPassword()
    password: string;
}
