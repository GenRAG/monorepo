import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserSafe } from 'src/users/dto/create-user.request';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    private readonly safeSelect = {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
    } satisfies Prisma.UserSelect;

    findOne(filter: Prisma.UserWhereUniqueInput): Promise<UserSafe | null> {
        return this.prisma.user.findUnique({
            where: filter,
            select: this.safeSelect,
        });
    }

    findOneWithCredentials(
        filter: Prisma.UserWhereUniqueInput,
    ): Promise<User | null> {
        return this.prisma.user.findUnique({ where: filter });
    }

    findAll(): Promise<UserSafe[]> {
        return this.prisma.user.findMany({ select: this.safeSelect });
    }

    create(data: Prisma.UserCreateInput): Promise<UserSafe> {
        return this.prisma.user.create({
            data,
            select: this.safeSelect,
        });
    }

    update(
        where: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput,
    ): Promise<UserSafe> {
        return this.prisma.user.update({
            where,
            data,
            select: this.safeSelect,
        });
    }

    delete(id: string): Promise<UserSafe> {
        return this.prisma.user.delete({
            where: { id },
            select: this.safeSelect,
        });
    }
}
