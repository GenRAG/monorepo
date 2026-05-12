import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsStrongPassword } from 'class-validator';

export class VerifyTokenRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email associated with the token',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 123456,
        description: '6-digit verification code',
    })
    @IsNumber()
    token: number;
}

export class ResendVerifyTokenRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email address to resend token',
    })
    @IsEmail()
    email: string;
}

export class ResetPasswordRequest extends ResendVerifyTokenRequest {}

export class NewPasswordRequest extends VerifyTokenRequest {
    @ApiProperty({
        example: 'N3wStrongP@ssword!',
        description: 'New strong password',
    })
    @IsStrongPassword()
    password: string;
}
