import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/auth/token.service';
import { BrevoService } from 'src/auth/brevo.service';
import { LoginAttemptService } from 'src/auth/login-attempt.service';
import { UsersService } from 'src/users/users.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const NOW = Date.now();

const fakeUser = {
    id: 'user-1',
    email: 'test@genrag.com',
    name: 'Test',
    password: '$2b$10$hashed',
    isEmailVerified: false,
    emailVerificationToken: 'stored-hash',
    emailVerificationLastSentAt: new Date(NOW - 5000),
    passwordResetToken: 'stored-reset-hash',
    passwordResetLastSentAt: new Date(NOW - 5000),
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockUsersService = {
    findOneWithCredentials: jest.fn() as any,
    update: jest.fn() as any,
};

const mockConfigService = {
    get: jest.fn((key: string) => ({ SEND_EMAILS: 'false' })[key]),
    getOrThrow: jest.fn((key: string) => {
        const cfg: Record<string, string> = {
            JWT_SECRET: 'test-secret',
            TOKEN_VALIDITY: '15m',
            TOKEN_RESEND_INTERVAL: '1m',
        };
        if (!(key in cfg)) throw new Error(`Missing config: ${key}`);
        return cfg[key];
    }),
};

const mockBrevoService = {
    sendConfirmationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
};

const mockLoginAttempt = {
    isBlocked: jest.fn() as any,
    recordFailure: jest.fn() as any,
    reset: jest.fn() as any,
};

describe('TokenService', () => {
    let service: TokenService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: BrevoService, useValue: mockBrevoService },
                { provide: LoginAttemptService, useValue: mockLoginAttempt },
            ],
        }).compile();

        service = module.get<TokenService>(TokenService);
        jest.clearAllMocks();
        mockLoginAttempt.isBlocked.mockImplementation(() => Promise.resolve(false));
        mockUsersService.update.mockImplementation(() => Promise.resolve({}));
        mockConfigService.get.mockImplementation((key: string) => ({ SEND_EMAILS: 'false' })[key]);
    });

    describe('hashOtpCode', () => {
        it('should return a hex string', () => {
            const result = service.hashOtpCode(123456);
            expect(result).toMatch(/^[a-f0-9]{64}$/);
        });

        it('should produce the same hash for the same input', () => {
            expect(service.hashOtpCode(123456)).toBe(service.hashOtpCode(123456));
        });

        it('should produce different hashes for different inputs', () => {
            expect(service.hashOtpCode(123456)).not.toBe(service.hashOtpCode(654321));
        });
    });

    describe('generateAndSendVerificationToken', () => {
        it('should throw BadRequestException if user not found', async () => {
            mockUsersService.findOneWithCredentials.mockImplementation(() => Promise.resolve(null));

            await expect(service.generateAndSendVerificationToken('unknown@test.com')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if within resend interval', async () => {
            mockUsersService.findOneWithCredentials.mockImplementation(() =>
                Promise.resolve({
                    ...fakeUser,
                    emailVerificationLastSentAt: new Date(NOW - 10 * 1000),
                }),
            );

            await expect(service.generateAndSendVerificationToken(fakeUser.email)).rejects.toThrow(BadRequestException);
        });

        it('should store a hashed code (not plaintext) in DB', async () => {
            mockUsersService.findOneWithCredentials.mockImplementation(() =>
                Promise.resolve({
                    ...fakeUser,
                    emailVerificationLastSentAt: null,
                }),
            );

            await service.generateAndSendVerificationToken(fakeUser.email);

            const savedToken = mockUsersService.update.mock.calls[0][0].data.emailVerificationToken;
            expect(savedToken).toMatch(/^[a-f0-9]{64}$/);
        });

        it('should send email when SEND_EMAILS=true', async () => {
            mockConfigService.get.mockImplementation((key: string) => ({ SEND_EMAILS: 'true' })[key]);
            mockUsersService.findOneWithCredentials.mockImplementation(() =>
                Promise.resolve({
                    ...fakeUser,
                    emailVerificationLastSentAt: null,
                }),
            );

            await service.generateAndSendVerificationToken(fakeUser.email);

            expect(mockBrevoService.sendConfirmationEmail).toHaveBeenCalledWith(fakeUser.email, expect.any(Number));
        });

        it('should not send email when SEND_EMAILS=false', async () => {
            mockUsersService.findOneWithCredentials.mockImplementation(() =>
                Promise.resolve({
                    ...fakeUser,
                    emailVerificationLastSentAt: null,
                }),
            );

            await service.generateAndSendVerificationToken(fakeUser.email);

            expect(mockBrevoService.sendConfirmationEmail).not.toHaveBeenCalled();
        });
    });

    describe('verifyEmailToken', () => {
        it('should throw if email is blocked', async () => {
            mockLoginAttempt.isBlocked.mockImplementation(() => Promise.resolve(true));

            await expect(service.verifyEmailToken({ email: fakeUser.email, code: 123456 })).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockUsersService.findOneWithCredentials).not.toHaveBeenCalled();
        });

        it('should record failure and throw if user not found', async () => {
            mockUsersService.findOneWithCredentials.mockImplementation(() => Promise.resolve(null));

            await expect(service.verifyEmailToken({ email: fakeUser.email, code: 123456 })).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockLoginAttempt.recordFailure).toHaveBeenCalled();
        });

        it('should record failure and throw if token is expired', async () => {
            mockUsersService.findOneWithCredentials.mockImplementation(() =>
                Promise.resolve({
                    ...fakeUser,
                    emailVerificationLastSentAt: new Date(NOW - 20 * 60 * 1000),
                }),
            );

            await expect(service.verifyEmailToken({ email: fakeUser.email, code: 123456 })).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockLoginAttempt.recordFailure).toHaveBeenCalled();
        });

        it('should record failure and throw if code is wrong', async () => {
            mockUsersService.findOneWithCredentials.mockImplementation(() => Promise.resolve(fakeUser));

            await expect(service.verifyEmailToken({ email: fakeUser.email, code: 999999 })).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockLoginAttempt.recordFailure).toHaveBeenCalled();
        });

        it('should mark email as verified and reset counter on success', async () => {
            const hash = service.hashOtpCode(123456);
            mockUsersService.findOneWithCredentials
                .mockImplementationOnce(() => Promise.resolve({ ...fakeUser, emailVerificationToken: hash }))
                .mockImplementationOnce(() =>
                    Promise.resolve({ ...fakeUser, isEmailVerified: true, emailVerificationToken: null }),
                );

            const result = await service.verifyEmailToken({ email: fakeUser.email, code: 123456 });

            expect(mockLoginAttempt.reset).toHaveBeenCalledWith(fakeUser.email);
            expect(mockUsersService.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ isEmailVerified: true, emailVerificationToken: null }),
                }),
            );
            expect(result.isEmailVerified).toBe(true);
        });
    });

    describe('generateAndSendPasswordResetToken', () => {
        it('should throw if within resend interval', async () => {
            await expect(
                service.generateAndSendPasswordResetToken({
                    ...fakeUser,
                    passwordResetLastSentAt: new Date(NOW - 10 * 1000),
                } as any),
            ).rejects.toThrow(BadRequestException);
        });

        it('should store a hashed token in DB', async () => {
            await service.generateAndSendPasswordResetToken({
                ...fakeUser,
                passwordResetLastSentAt: null,
            } as any);

            const saved = mockUsersService.update.mock.calls[0][0].data.passwordResetToken;
            expect(saved).toMatch(/^[a-f0-9]{64}$/);
        });
    });
});
