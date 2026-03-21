import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Login email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'StrongP@ssw0rd!',
        description: 'User password',
    })
    @IsString()
    password: string;
}
