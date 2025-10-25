import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRequest } from 'src/users/dto/create-user.request';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async createUser(
        request: CreateUserRequest & {
            emailVerificationToken?: number;
        },
    ): Promise<User> {
        return this.prismaService.user.create({
            data: {
                ...request,
                password: await bcrypt.hash(request.password, 10),
            },
        });
    }

    async getUser(filter: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prismaService.user.findUnique({
            where: filter,
        });
    }

    async getUsers(): Promise<User[]> {
        return this.prismaService.user.findMany();
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;
        return this.prismaService.user.update({
            data,
            where,
        });
    }

    async deleteUser(id: string): Promise<User> {
        return this.prismaService.user.delete({
            where: { id },
        });
    }
}
