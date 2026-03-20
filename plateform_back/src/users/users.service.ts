import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRequest, UserSafe } from 'src/users/dto/create-user.request';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    private readonly userSafeSelect = {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
    } satisfies Prisma.UserSelect;

    async create(
        request: CreateUserRequest & {
            emailVerificationToken?: number;
            emailVerificationLastSentAt?: Date;
            isEmailVerified?: boolean;
        },
    ): Promise<UserSafe> {
        return this.prismaService.user.create({
            data: {
                ...request,
                password: await bcrypt.hash(request.password, 10),
            },
            select: this.userSafeSelect,
        });
    }

    async findOneWithCredentials(
        filter: Prisma.UserWhereUniqueInput,
    ): Promise<User | null> {
        return this.prismaService.user.findUnique({
            where: filter,
        });
    }

    async findOne(
        filter: Prisma.UserWhereUniqueInput,
    ): Promise<UserSafe | null> {
        return this.prismaService.user.findUnique({
            where: filter,
            select: this.userSafeSelect,
        });
    }

    async getUsers(): Promise<UserSafe[]> {
        return this.prismaService.user.findMany({
            select: this.userSafeSelect,
        });
    }

    async update(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<UserSafe> {
        const { where, data } = params;
        return this.prismaService.user.update({
            data,
            where,
            select: this.userSafeSelect,
        });
    }

    async delete(id: string): Promise<UserSafe> {
        return this.prismaService.user.delete({
            where: { id },
            select: this.userSafeSelect,
        });
    }
}
