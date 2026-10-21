import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/user.repository';
import { DatasetService } from 'src/dataset/dataset.service';
import { BillingService } from 'src/billing/billing.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
    findAccountFlags: jest.fn() as any,
    create: jest.fn() as any,
    update: jest.fn() as any,
    delete: jest.fn() as any,
    findSoleWorkspaceFiles: jest.fn() as any,
};

const mockDatasetService = {
    queueWorkspaceCleanup: jest.fn() as any,
};

const mockBillingService = {
    deleteCustomers: jest.fn() as any,
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
                { provide: DatasetService, useValue: mockDatasetService },
                { provide: BillingService, useValue: mockBillingService },
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
        it('should only update the name: the email cannot be changed in place', async () => {
            mockUserRepository.update.mockResolvedValue({ ...fakeUserSafe, name: 'Alice' });

            await service.updateProfile('user-1', { name: 'Alice', email: 'victim@example.com' } as never);

            expect(mockUserRepository.update).toHaveBeenCalledWith({ id: 'user-1' }, { name: 'Alice' });
        });
    });

    describe('getMe', () => {
        it('should add the account flags to the current user', async () => {
            mockUserRepository.findAccountFlags.mockResolvedValue({ hasPassword: false, isEmailVerified: true });

            await expect(service.getMe(fakeUserSafe)).resolves.toEqual({
                ...fakeUserSafe,
                hasPassword: false,
                isEmailVerified: true,
            });
        });

        it('should answer 404 when the user disappeared since the token check', async () => {
            mockUserRepository.findAccountFlags.mockResolvedValue(null);

            await expect(service.getMe(fakeUserSafe)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('changePassword', () => {
        it('should answer 400 pointing to the reset flow for an account without password', async () => {
            mockUserRepository.findOneWithCredentials.mockResolvedValue({ ...fakeUserWithCredentials, password: null });

            const result = service.changePassword('user-1', 'anything', 'Password123!');
            await expect(result).rejects.toBeInstanceOf(BadRequestException);
            await expect(result).rejects.toThrow('Mot de passe oublié');
            expect(mockUserRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        const workspaces = [{ workspaceId: 'workspace-1', storageKeys: ['datasets/d1/1-a.pdf'] }];

        it('should queue the cleanup of the workspaces deleted with the account, then delete it', async () => {
            mockUserRepository.findSoleWorkspaceFiles.mockResolvedValue(workspaces);
            mockDatasetService.queueWorkspaceCleanup.mockResolvedValue([]);
            mockUserRepository.delete.mockResolvedValue(fakeUserSafe);

            const result = await service.delete('user-1');

            expect(result).toEqual(fakeUserSafe);
            expect(mockUserRepository.findSoleWorkspaceFiles).toHaveBeenCalledWith('user-1');
            expect(mockDatasetService.queueWorkspaceCleanup).toHaveBeenCalledWith(workspaces);
            expect(mockUserRepository.delete).toHaveBeenCalledWith('user-1');
            expect(mockBillingService.deleteCustomers).toHaveBeenCalledWith(['workspace-1']);
        });

        it('should keep the account when its Stripe customer cannot be deleted, so nobody pays for a deleted account', async () => {
            mockUserRepository.findSoleWorkspaceFiles.mockResolvedValue(workspaces);
            mockBillingService.deleteCustomers.mockRejectedValueOnce(new Error('stripe down'));

            await expect(service.delete('user-1')).rejects.toThrow('stripe down');
            expect(mockDatasetService.queueWorkspaceCleanup).not.toHaveBeenCalled();
            expect(mockUserRepository.delete).not.toHaveBeenCalled();
        });

        it('should drop the queued cleanup when the delete fails, so a surviving account keeps its files', async () => {
            const job = { remove: (jest.fn() as any).mockResolvedValue(undefined) };
            mockUserRepository.findSoleWorkspaceFiles.mockResolvedValue(workspaces);
            mockDatasetService.queueWorkspaceCleanup.mockResolvedValue([job]);
            mockUserRepository.delete.mockRejectedValue(new Error('db down'));

            await expect(service.delete('user-1')).rejects.toThrow('db down');
            expect(job.remove).toHaveBeenCalled();
        });

        it('should report the delete failure even when removing the queued job fails too', async () => {
            const job = { remove: (jest.fn() as any).mockRejectedValue(new Error('job locked')) };
            mockUserRepository.findSoleWorkspaceFiles.mockResolvedValue(workspaces);
            mockDatasetService.queueWorkspaceCleanup.mockResolvedValue([job]);
            mockUserRepository.delete.mockRejectedValue(new Error('db down'));

            await expect(service.delete('user-1')).rejects.toThrow('db down');
        });

        it('should not delete the account when the cleanup cannot be queued', async () => {
            mockUserRepository.findSoleWorkspaceFiles.mockResolvedValue(workspaces);
            mockDatasetService.queueWorkspaceCleanup.mockRejectedValue(new Error('redis down'));

            await expect(service.delete('user-1')).rejects.toThrow('redis down');
            expect(mockUserRepository.delete).not.toHaveBeenCalled();
        });
    });
});
