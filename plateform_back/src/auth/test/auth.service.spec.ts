import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { JwtBlacklistService } from 'src/auth/jwt-blacklist.service';
import { LoginAttemptService } from 'src/auth/login-attempt.service';
import { TokenService } from 'src/auth/token.service';
import { UsersService } from 'src/users/users.service';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

jest.mock('bcryptjs', () => ({ compare: jest.fn(), hash: jest.fn() }));
import bcryptjs from 'bcryptjs';

const mockGetTokenInfo = jest.fn() as jest.MockedFunction<(accessToken: string) => Promise<Record<string, unknown>>>;
jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({ getTokenInfo: mockGetTokenInfo })),
}));

const mockedBcryptCompare = bcryptjs.compare as jest.MockedFunction<typeof bcryptjs.compare>;
const mockedBcryptHash = bcryptjs.hash as jest.MockedFunction<typeof bcryptjs.hash>;

const fakeUser: any = {
    id: 'user-1',
    email: 'test@genrag.com',
    name: 'Test',
    password: '$2b$10$hashed',
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationLastSentAt: null,
    passwordResetToken: 'hashed-reset-token',
    passwordResetLastSentAt: new Date(Date.now() - 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockUsersService = {
    findOne: jest.fn() as jest.MockedFunction<(filter: Record<string, unknown>) => Promise<unknown>>,
    findOneWithCredentials: jest.fn() as jest.MockedFunction<(filter: Record<string, unknown>) => Promise<unknown>>,
    create: jest.fn() as jest.MockedFunction<(request: Record<string, unknown>) => Promise<unknown>>,
    update: jest.fn() as jest.MockedFunction<
        (params: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<unknown>
    >,
    createGoogleUser: jest.fn() as jest.MockedFunction<(data: Record<string, unknown>) => Promise<unknown>>,
};

const mockConfigService = {
    get: jest.fn((key: string) => ({ NODE_ENV: 'development', JWT_EXPIRATION: '7d' })[key]),
    getOrThrow: jest.fn((key: string) => {
        const cfg: Record<string, string> = {
            JWT_SECRET: 'test-secret',
            JWT_EXPIRATION: '7d',
            TOKEN_VALIDITY: '15m',
            GOOGLE_CLIENT_ID: 'genrag-client-id.apps.googleusercontent.com',
        };
        if (!(key in cfg)) throw new Error(`Missing config: ${key}`);
        return cfg[key];
    }),
};

const mockTokenService = {
    verifyEmailToken: jest.fn() as jest.MockedFunction<(body: Record<string, unknown>) => Promise<unknown>>,
    generateAndSendVerificationToken: jest.fn() as jest.MockedFunction<(email: string) => Promise<void>>,
    hashOtpCode: jest.fn() as jest.MockedFunction<(code: number) => string>,
};

mockTokenService.hashOtpCode.mockReturnValue('hashed-code');

const mockJwtService = {
    sign: jest.fn() as jest.MockedFunction<(payload: Record<string, unknown>) => string>,
    decode: jest.fn() as jest.MockedFunction<(token: string) => unknown>,
    verify: jest.fn() as jest.MockedFunction<(token: string) => unknown>,
};

mockJwtService.sign.mockReturnValue('signed.jwt.token');

const mockJwtBlacklist = {
    blacklist: jest.fn(),
    isBlacklisted: jest.fn(),
};

const mockLoginAttempt = {
    isBlocked: jest.fn() as jest.MockedFunction<(email: string) => Promise<boolean>>,
    recordFailure: jest.fn() as jest.MockedFunction<(email: string) => Promise<void>>,
    reset: jest.fn() as jest.MockedFunction<(email: string) => Promise<void>>,
};

mockLoginAttempt.isBlocked.mockResolvedValue(false);

describe('AuthService', () => {
    let service: AuthService;
    let response: Response;
    let cookieMock: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: TokenService, useValue: mockTokenService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: JwtBlacklistService, useValue: mockJwtBlacklist },
                { provide: LoginAttemptService, useValue: mockLoginAttempt },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        cookieMock = jest.fn();
        response = { cookie: cookieMock } as unknown as Response;
        jest.clearAllMocks();
        mockLoginAttempt.isBlocked.mockResolvedValue(false);
        mockConfigService.get.mockImplementation(
            (key: string) => ({ NODE_ENV: 'development', JWT_EXPIRATION: '7d' })[key],
        );
    });

    describe('login', () => {
        it('should sign a JWT with userId and jti', () => {
            service.login(fakeUser, response);

            expect(mockJwtService.sign).toHaveBeenCalledWith(
                expect.objectContaining({ userId: fakeUser.id, jti: expect.any(String) }),
            );
        });

        it('should set the Authentication cookie', () => {
            service.login(fakeUser, response);

            expect(cookieMock).toHaveBeenCalledWith(
                'Authentication',
                'signed.jwt.token',
                expect.objectContaining({ httpOnly: true }),
            );
        });

        it('should return { success: true }', () => {
            const result = service.login(fakeUser, response);

            expect(result).toEqual({ success: true });
        });
    });

    describe('logout', () => {
        let clearCookieMock: jest.Mock;
        let logoutResponse: Response;

        beforeEach(() => {
            clearCookieMock = jest.fn();
            logoutResponse = { clearCookie: clearCookieMock } as unknown as Response;
        });

        it('should clear the cookie with the attributes it was set with in production (SameSite=None; Secure)', async () => {
            const prodConfig = {
                ...mockConfigService,
                get: jest.fn((key: string) => ({ NODE_ENV: 'production', JWT_EXPIRATION: '7d' })[key]),
            };
            const prodService = new AuthService(
                mockUsersService as unknown as UsersService,
                prodConfig as unknown as ConfigService,
                mockTokenService as unknown as TokenService,
                mockJwtService as unknown as JwtService,
                mockJwtBlacklist as unknown as JwtBlacklistService,
                mockLoginAttempt as unknown as LoginAttemptService,
            );
            prodService.login(fakeUser, response);
            const setOptions = cookieMock.mock.calls[0][2] as Record<string, unknown>;

            await prodService.logout(undefined, logoutResponse);

            const { expires: _expires, ...setWithoutExpiry } = setOptions;
            expect(clearCookieMock).toHaveBeenCalledWith('Authentication', setWithoutExpiry);
            expect(setWithoutExpiry).toMatchObject({ secure: true, sameSite: 'none', httpOnly: true });
        });

        it('should blacklist the jti of a valid token with its remaining TTL', async () => {
            const futureExp = Math.floor(Date.now() / 1000) + 3600;
            mockJwtService.verify.mockReturnValue({ jti: 'test-jti', exp: futureExp });

            await service.logout('some.jwt.token', logoutResponse);

            expect(mockJwtBlacklist.blacklist).toHaveBeenCalledWith('test-jti', expect.any(Number));
            expect(clearCookieMock).toHaveBeenCalled();
        });

        it('should not blacklist anything for a token whose signature does not verify', async () => {
            mockJwtService.verify.mockImplementation(() => {
                throw new Error('invalid signature');
            });

            await expect(service.logout('forged.jwt.token', logoutResponse)).resolves.toBeUndefined();
            expect(mockJwtBlacklist.blacklist).not.toHaveBeenCalled();
            expect(clearCookieMock).toHaveBeenCalled();
        });

        it('should fail when the blacklist cannot be written: the session would silently stay valid', async () => {
            mockJwtService.verify.mockReturnValue({ jti: 'test-jti', exp: Math.floor(Date.now() / 1000) + 3600 });
            mockJwtBlacklist.blacklist.mockRejectedValueOnce(new Error('Redis down') as never);

            await expect(service.logout('some.jwt.token', logoutResponse)).rejects.toThrow('Redis down');
            expect(clearCookieMock).toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should throw ConflictException if email already exists', async () => {
            mockUsersService.findOne.mockResolvedValue(fakeUser);

            await expect(service.register({ email: 'Test@GenRAG.com', password: 'Pass123!' })).rejects.toThrow(
                ConflictException,
            );
        });

        it('should normalize email to lowercase before checking', async () => {
            mockUsersService.findOne.mockResolvedValue(null);
            mockUsersService.create.mockResolvedValue(fakeUser);

            await service.register({ email: 'TEST@GENRAG.COM', password: 'Pass123!' });

            expect(mockUsersService.findOne).toHaveBeenCalledWith({ email: 'test@genrag.com' });
        });

        it('should not send verification token in development', async () => {
            mockUsersService.findOne.mockResolvedValue(null);
            mockUsersService.create.mockResolvedValue(fakeUser);

            await service.register({ email: 'new@genrag.com', password: 'Pass123!' });

            expect(mockTokenService.generateAndSendVerificationToken).not.toHaveBeenCalled();
        });
    });

    describe('verifyUser', () => {
        it('should throw UnauthorizedException if email is blocked', async () => {
            mockLoginAttempt.isBlocked.mockResolvedValue(true);

            await expect(service.verifyUser('test@genrag.com', 'Pass123!')).rejects.toThrow(UnauthorizedException);
            expect(mockUsersService.findOneWithCredentials).not.toHaveBeenCalled();
        });

        it('should record failure and throw if user not found', async () => {
            mockUsersService.findOneWithCredentials.mockResolvedValue(null);

            await expect(service.verifyUser('unknown@genrag.com', 'Pass123!')).rejects.toThrow(UnauthorizedException);
            expect(mockLoginAttempt.recordFailure).toHaveBeenCalledWith('unknown@genrag.com');
        });

        it('should record failure and throw if password is wrong', async () => {
            mockUsersService.findOneWithCredentials.mockResolvedValue(fakeUser);
            mockedBcryptCompare.mockImplementation(() => Promise.resolve(false));

            await expect(service.verifyUser('test@genrag.com', 'WrongPass!')).rejects.toThrow(UnauthorizedException);
            expect(mockLoginAttempt.recordFailure).toHaveBeenCalledWith('test@genrag.com');
        });

        it('should reset counter and return user on success', async () => {
            mockUsersService.findOneWithCredentials.mockResolvedValue(fakeUser);
            mockedBcryptCompare.mockImplementation(() => Promise.resolve(true));

            const result = await service.verifyUser('test@genrag.com', 'Pass123!');

            expect(mockLoginAttempt.reset).toHaveBeenCalledWith('test@genrag.com');
            expect(result).toEqual(fakeUser);
        });

        it('should normalize email before lookup', async () => {
            mockUsersService.findOneWithCredentials.mockResolvedValue(null);

            await expect(service.verifyUser('  TEST@GENRAG.COM  ', 'Pass123!')).rejects.toThrow();
            expect(mockUsersService.findOneWithCredentials).toHaveBeenCalledWith({ email: 'test@genrag.com' });
        });
    });

    describe('verifyEmailAndLogin', () => {
        it('should call verifyEmailToken then login', async () => {
            mockTokenService.verifyEmailToken.mockResolvedValue(fakeUser);

            const result = await service.verifyEmailAndLogin({ email: fakeUser.email, token: 123456 }, response);

            expect(mockTokenService.verifyEmailToken).toHaveBeenCalled();
            expect(mockJwtService.sign).toHaveBeenCalled();
            expect(result).toEqual({ success: true });
        });
    });

    describe('resendVerificationToken', () => {
        it('should delegate to tokenService', async () => {
            mockTokenService.generateAndSendVerificationToken.mockResolvedValue(undefined);

            await service.resendVerificationToken('test@genrag.com');

            expect(mockTokenService.generateAndSendVerificationToken).toHaveBeenCalledWith('test@genrag.com');
        });
    });

    describe('verifyPasswordResetToken', () => {
        const validBody = { email: 'test@genrag.com', token: 123456, password: 'NewPass123!' };

        it('should throw if email is blocked', async () => {
            mockLoginAttempt.isBlocked.mockResolvedValue(true);

            await expect(service.verifyPasswordResetToken(validBody)).rejects.toThrow(UnauthorizedException);
        });

        it('should record failure and throw if user not found', async () => {
            mockUsersService.findOneWithCredentials.mockResolvedValue(null);

            await expect(service.verifyPasswordResetToken(validBody)).rejects.toThrow(UnauthorizedException);
            expect(mockLoginAttempt.recordFailure).toHaveBeenCalled();
        });

        it('should record failure and throw if code is wrong', async () => {
            mockUsersService.findOneWithCredentials.mockResolvedValue(fakeUser);
            mockTokenService.hashOtpCode.mockReturnValue('different-hash');

            await expect(service.verifyPasswordResetToken(validBody)).rejects.toThrow(UnauthorizedException);
            expect(mockLoginAttempt.recordFailure).toHaveBeenCalled();
        });

        it('should record failure and throw if token is expired', async () => {
            mockUsersService.findOneWithCredentials.mockResolvedValue({
                ...fakeUser,
                passwordResetLastSentAt: new Date(Date.now() - 20 * 60 * 1000),
            });
            mockTokenService.hashOtpCode.mockReturnValue('hashed-reset-token');

            await expect(service.verifyPasswordResetToken(validBody)).rejects.toThrow(UnauthorizedException);
            expect(mockLoginAttempt.recordFailure).toHaveBeenCalled();
        });

        it('should update password and reset counter on success', async () => {
            mockUsersService.findOneWithCredentials.mockResolvedValue(fakeUser);
            mockTokenService.hashOtpCode.mockReturnValue('hashed-reset-token');
            mockedBcryptHash.mockImplementation(() => Promise.resolve('new-hashed-password'));
            mockUsersService.update.mockResolvedValue(fakeUser);

            await service.verifyPasswordResetToken(validBody);

            expect(mockLoginAttempt.reset).toHaveBeenCalledWith('test@genrag.com');
            expect(mockUsersService.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ password: 'new-hashed-password', passwordResetToken: null }),
                }),
            );
        });
    });

    describe('loginWithGoogle', () => {
        const validTokenInfo = {
            aud: 'genrag-client-id.apps.googleusercontent.com',
            email: 'Alice@Example.com',
            email_verified: 'true',
        };

        it('should log in an existing user when the token was issued to the GenRAG client', async () => {
            mockGetTokenInfo.mockResolvedValue(validTokenInfo);
            mockUsersService.findOneWithCredentials.mockResolvedValue(fakeUser);

            const result = await service.loginWithGoogle('access-token', response);

            expect(result).toEqual({ success: true });
            expect(mockUsersService.findOneWithCredentials).toHaveBeenCalledWith({ email: 'alice@example.com' });
            expect(cookieMock).toHaveBeenCalled();
        });

        it('should reject a token issued to another Google OAuth client (audience mismatch)', async () => {
            mockGetTokenInfo.mockResolvedValue({ ...validTokenInfo, aud: 'attacker-app.apps.googleusercontent.com' });

            await expect(service.loginWithGoogle('access-token', response)).rejects.toThrow(UnauthorizedException);
            expect(mockUsersService.findOneWithCredentials).not.toHaveBeenCalled();
            expect(cookieMock).not.toHaveBeenCalled();
        });

        it('should reject a Google account whose email is not verified', async () => {
            mockGetTokenInfo.mockResolvedValue({ ...validTokenInfo, email_verified: 'false' });

            await expect(service.loginWithGoogle('access-token', response)).rejects.toThrow(UnauthorizedException);
            expect(mockUsersService.findOneWithCredentials).not.toHaveBeenCalled();
        });

        it('should reject an invalid token', async () => {
            mockGetTokenInfo.mockRejectedValue(new Error('invalid_token'));

            await expect(service.loginWithGoogle('access-token', response)).rejects.toThrow(UnauthorizedException);
        });
    });
});

describe('AuthService — production mode', () => {
    let service: AuthService;

    beforeEach(async () => {
        const prodConfigService = {
            get: jest.fn((key: string) => ({ NODE_ENV: 'production', JWT_EXPIRATION: '7d' })[key]),
            getOrThrow: jest.fn((key: string) => {
                const cfg: Record<string, string> = {
                    JWT_SECRET: 'test-secret',
                    JWT_EXPIRATION: '7d',
                    TOKEN_VALIDITY: '15m',
                };
                if (!(key in cfg)) throw new Error(`Missing config: ${key}`);
                return cfg[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: ConfigService, useValue: prodConfigService },
                { provide: TokenService, useValue: mockTokenService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: JwtBlacklistService, useValue: mockJwtBlacklist },
                { provide: LoginAttemptService, useValue: mockLoginAttempt },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
        mockLoginAttempt.isBlocked.mockResolvedValue(false);
    });

    it('should send verification token after register', async () => {
        mockUsersService.findOne.mockResolvedValue(null);
        mockUsersService.create.mockResolvedValue(fakeUser);
        mockTokenService.generateAndSendVerificationToken.mockResolvedValue(undefined);

        await service.register({ email: 'new@genrag.com', password: 'Pass123!' });

        expect(mockTokenService.generateAndSendVerificationToken).toHaveBeenCalledWith(fakeUser.email);
    });

    it('should throw if email is not verified on login', async () => {
        mockUsersService.findOneWithCredentials.mockResolvedValue({ ...fakeUser, isEmailVerified: false });
        mockedBcryptCompare.mockImplementation(() => Promise.resolve(true));

        await expect(service.verifyUser('test@genrag.com', 'Pass123!')).rejects.toThrow(UnauthorizedException);
    });
});
