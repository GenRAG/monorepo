import { IsEmail, IsNumber } from 'class-validator';

export class VerifyTokenRequest {
    @IsEmail()
    email: string;

    @IsNumber()
    token: number;
}
