import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/user.repository';

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
    findOne: jest.fn(),
    findOneWithCredentials: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
            mockUserRepository.findOneWithCredentials.mockResolvedValue(
                fakeUserWithCredentials,
            );

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

    describe('delete', () => {
        it('should delete user and return UserSafe', async () => {
            mockUserRepository.delete.mockResolvedValue(fakeUserSafe);

            const result = await service.delete('user-1');

            expect(result).toEqual(fakeUserSafe);
            expect(mockUserRepository.delete).toHaveBeenCalledWith('user-1');
        });
    });
});
