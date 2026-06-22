import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { Prisma } from 'generated/prisma';

export class CreateUserRequest {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongP@ssw0rd!', description: 'Strong password' })
    @IsStrongPassword()
    @MaxLength(72)
    password: string;

    @ApiPropertyOptional({ example: 'Alice', description: 'User display name' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;
}

export type UserSafe = Prisma.UserGetPayload<{
    select: {
        id: true;
        email: true;
        name: true;
        createdAt: true;
        updatedAt: true;
    };
}>;
