import { IsEmail, IsOptional, IsStrongPassword } from 'class-validator';
import { Prisma } from 'generated/prisma';

export class CreateUserRequest {
    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;

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
