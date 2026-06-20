import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileRequest {
    @ApiPropertyOptional({ example: 'Alice' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ example: 'alice@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;
}
