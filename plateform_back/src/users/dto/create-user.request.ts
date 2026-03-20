import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsStrongPassword } from 'class-validator';
import { Prisma } from 'generated/prisma';

export class CreateUserRequest {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'StrongP@ssw0rd!',
        description: 'Strong password',
    })
    @IsStrongPassword()
    password: string;

    @ApiPropertyOptional({
        example: 'Alice',
        description: 'User display name',
    })
    @IsOptional()
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
