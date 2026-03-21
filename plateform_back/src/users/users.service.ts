import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { CreateUserRequest, UserSafe } from 'src/users/dto/create-user.request';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from 'src/users/user.repository';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}

    async create(
        request: CreateUserRequest & {
            emailVerificationToken?: number;
            emailVerificationLastSentAt?: Date;
            isEmailVerified?: boolean;
        },
    ): Promise<UserSafe> {
        const user = await this.userRepository.create({
            ...request,
            password: await bcrypt.hash(request.password, 10),
        });

        if (!user) {
            throw new Error('Failed to create user');
        }

        return user;
    }

    async findOneWithCredentials(
        filter: Prisma.UserWhereUniqueInput,
    ): Promise<User | null> {
        return this.userRepository.findOneWithCredentials(filter);
    }

    async findOne(
        filter: Prisma.UserWhereUniqueInput,
    ): Promise<UserSafe | null> {
        return this.userRepository.findOne(filter);
    }

    async getUsers(): Promise<UserSafe[]> {
        return this.userRepository.findAll();
    }

    async update(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<UserSafe> {
        const { where, data } = params;

        return this.userRepository.update(where, data);
    }

    async delete(id: string): Promise<UserSafe> {
        return this.userRepository.delete(id);
    }
}
