import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { CreateUserRequest, UserSafe } from 'src/users/dto/create-user.request';
import { UpdateProfileRequest } from 'src/users/dto/update-profile.request';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from 'src/users/user.repository';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}

    async create(
        request: CreateUserRequest & {
            emailVerificationToken?: string;
            emailVerificationLastSentAt?: Date;
            isEmailVerified?: boolean;
        },
    ): Promise<UserSafe> {
        return this.userRepository.create({
            ...request,
            password: await bcrypt.hash(request.password, 10),
        });
    }

    async createGoogleUser(data: { email: string; name: string }): Promise<UserSafe> {
        return this.userRepository.create({
            email: data.email,
            name: data.name,
            password: null,
            isEmailVerified: true,
        });
    }

    async findOneWithCredentials(filter: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.userRepository.findOneWithCredentials(filter);
    }

    async findOne(filter: Prisma.UserWhereUniqueInput): Promise<UserSafe | null> {
        return this.userRepository.findOne(filter);
    }

    async update(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<UserSafe> {
        const { where, data } = params;

        return this.userRepository.update(where, data);
    }

    async updateProfile(userId: string, profile: UpdateProfileRequest): Promise<UserSafe> {
        // Emails are stored lowercased and trimmed everywhere else (register, login, reset), and looked up
        // that way: storing "Alice@X.com" here would make the account impossible to log into.
        const data = profile.email !== undefined ? { ...profile, email: profile.email.toLowerCase().trim() } : profile;

        try {
            return await this.userRepository.update({ id: userId }, data);
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException('An account with this email already exists.');
            }
            throw e;
        }
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOneWithCredentials({ id: userId });
        if (!user) throw new NotFoundException('User not found');

        if (!user.password) throw new UnauthorizedException('Mot de passe actuel incorrect');

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) throw new UnauthorizedException('Mot de passe actuel incorrect');

        await this.userRepository.update({ id: userId }, { password: await bcrypt.hash(newPassword, 10) });
    }

    async delete(id: string): Promise<UserSafe> {
        return this.userRepository.delete(id);
    }
}
