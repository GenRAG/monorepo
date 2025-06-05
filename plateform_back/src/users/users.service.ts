import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRequest } from 'src/users/dto/create-user.request';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async createUser(request: CreateUserRequest): Promise<User> {
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
}
