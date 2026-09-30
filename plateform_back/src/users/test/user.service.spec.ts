import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/user.repository';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';

const fakeUserSafe = {
    id: 'user-1',
    email: 'test@genrag.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const fakeUserWithCredentials = {
    ...fakeUserSafe,
    password: '$2b$10$hashedpassword',
    isEmailVerified: false,
    emailVerificationToken: null,
    emailVerificationLastSentAt: null,
    passwordResetToken: null,
    passwordResetLastSentAt: null,
};

const mockUserRepository = {
    findOne: jest.fn() as any,
    findOneWithCredentials: jest.fn() as any,
    create: jest.fn() as any,
    update: jest.fn() as any,
    delete: jest.fn() as any,
};

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should hash password before saving', async () => {
            mockUserRepository.create.mockResolvedValue(fakeUserSafe);

            await service.create({
                email: 'test@genrag.com',
                password: 'Password123!',
            });

            const callArgs = mockUserRepository.create.mock.calls[0][0];

            expect(callArgs.password).not.toBe('Password123!');
            expect(callArgs.password).toMatch(/^\$2[ab]\$\d+\$/);
        });

        it('should return UserSafe without password', async () => {
            mockUserRepository.create.mockResolvedValue(fakeUserSafe);

            const result = await service.create({
                email: 'test@genrag.com',
                password: 'Password123!',
            });

            expect(result).not.toHaveProperty('password');
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
        });
    });

    describe('findOne', () => {
        it('should return UserSafe when found', async () => {
            mockUserRepository.findOne.mockResolvedValue(fakeUserSafe);

            const result = await service.findOne({ email: 'test@genrag.com' });

            expect(result).toEqual(fakeUserSafe);
            expect(result).not.toHaveProperty('password');
        });

        it('should return null when user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.findOne({ email: 'unknown@test.com' });

            expect(result).toBeNull();
        });
    });

    describe('findOneWithCredentials', () => {
        it('should return full user with password', async () => {
            mockUserRepository.findOneWithCredentials.mockResolvedValue(fakeUserWithCredentials);

            const result = await service.findOneWithCredentials({
                email: 'test@genrag.com',
            });

            expect(result).toHaveProperty('password');
            expect(result?.email).toBe('test@genrag.com');
        });

        it('should return null when user not found', async () => {
            mockUserRepository.findOneWithCredentials.mockResolvedValue(null);

            const result = await service.findOneWithCredentials({
                email: 'unknown@test.com',
            });

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update user and return UserSafe', async () => {
            const updatedUser = { ...fakeUserSafe, name: 'Updated Name' };
            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await service.update({
                where: { email: 'test@genrag.com' },
                data: { name: 'Updated Name' },
            });

            expect(result.name).toBe('Updated Name');
            expect(result).not.toHaveProperty('password');
        });
    });

    describe('updateProfile', () => {
        it('should store the email lowercased and trimmed, like register and login expect it', async () => {
            mockUserRepository.update.mockResolvedValue({ ...fakeUserSafe, email: 'alice@example.com' });

            await service.updateProfile('user-1', { email: '  Alice@Example.COM ' });

            expect(mockUserRepository.update).toHaveBeenCalledWith({ id: 'user-1' }, { email: 'alice@example.com' });
        });

        it('should leave a name-only update untouched', async () => {
            mockUserRepository.update.mockResolvedValue({ ...fakeUserSafe, name: 'Alice' });

            await service.updateProfile('user-1', { name: 'Alice' });

            expect(mockUserRepository.update).toHaveBeenCalledWith({ id: 'user-1' }, { name: 'Alice' });
        });

        it('should answer 409 instead of 500 when the email already belongs to another account', async () => {
            mockUserRepository.update.mockRejectedValue(
                new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
                    code: 'P2002',
                    clientVersion: '6.9.0',
                }),
            );

            await expect(service.updateProfile('user-1', { email: 'taken@example.com' })).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('delete', () => {
        it('should delete user and return UserSafe', async () => {
            mockUserRepository.delete.mockResolvedValue(fakeUserSafe);

            const result = await service.delete('user-1');

            expect(result).toEqual(fakeUserSafe);
            expect(mockUserRepository.delete).toHaveBeenCalledWith('user-1');
        });
    });
});
