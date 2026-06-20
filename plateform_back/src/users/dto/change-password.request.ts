import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, MaxLength } from 'class-validator';

export class ChangePasswordRequest {
    @ApiProperty()
    @IsString()
    currentPassword: string;

    @ApiProperty()
    @IsStrongPassword()
    @MaxLength(72)
    newPassword: string;
}
