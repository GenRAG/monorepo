import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardingRepository } from '../onboarding.repository';
import { describe, jest, beforeEach, afterEach, it, expect } from '@jest/globals';

describe('OnboardingRepository', () => {
    let repository: OnboardingRepository;

    const mockPrismaService = {
        onboardingSession: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn(),
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [OnboardingRepository, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        repository = module.get<OnboardingRepository>(OnboardingRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findByUserAndWorkspace', () => {
        it('should find onboarding session by user and workspace', async () => {
            const userId = 'user-1';
            const workspaceId = 'workspace-1';
            const mockSession = {
                id: 'session-1',
                userId,
                workspaceId,
                agentId: 'agent-1',
                step: 1,
                completed: false,
                instruction: null,
                stepsData: null,
            };

            mockPrismaService.onboardingSession.findUnique.mockResolvedValue(mockSession);

            const result = await repository.findByUserAndWorkspace(userId, workspaceId);

            expect(result).toEqual(mockSession);
            expect(mockPrismaService.onboardingSession.findUnique).toHaveBeenCalledWith({
                where: { userId_workspaceId: { userId, workspaceId } },
            });
        });

        it('should return null when session does not exist', async () => {
            mockPrismaService.onboardingSession.findUnique.mockResolvedValue(null);

            const result = await repository.findByUserAndWorkspace('user-1', 'workspace-1');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create onboarding session', async () => {
            const createData: Prisma.OnboardingSessionCreateInput = {
                user: { connect: { id: 'user-1' } },
                workspace: { connect: { id: 'workspace-1' } },
                agent: { connect: { id: 'agent-1' } },
            };
            const mockSession = {
                id: 'session-1',
                userId: 'user-1',
                workspaceId: 'workspace-1',
                agentId: 'agent-1',
                step: 1,
                completed: false,
                instruction: null,
                stepsData: null,
            };

            mockPrismaService.onboardingSession.create.mockResolvedValue(mockSession);

            const result = await repository.create(createData);

            expect(result).toEqual(mockSession);
            expect(mockPrismaService.onboardingSession.create).toHaveBeenCalledWith({ data: createData });
        });
    });

    describe('update', () => {
        it('should update onboarding session', async () => {
            const sessionId = 'session-1';
            const updateData: Prisma.OnboardingSessionUpdateInput = { step: 2 };
            const mockSession = {
                id: sessionId,
                userId: 'user-1',
                workspaceId: 'workspace-1',
                agentId: 'agent-1',
                step: 2,
                completed: false,
                instruction: null,
                stepsData: null,
            };

            mockPrismaService.onboardingSession.update.mockResolvedValue(mockSession);

            const result = await repository.update(sessionId, updateData);

            expect(result).toEqual(mockSession);
            expect(mockPrismaService.onboardingSession.update).toHaveBeenCalledWith({
                where: { id: sessionId },
                data: updateData,
            });
        });
    });

    describe('tryIncrementQueryCount', () => {
        it('should increment query count when under limit', async () => {
            const sessionId = 'session-1';
            const stepId = 'test-assistant';
            const max = 5;
            const mockTx = {
                onboardingSession: {
                    findUnique: jest.fn(),
                    update: jest.fn(),
                },
            } as any;

            const sessionData = {
                id: sessionId,
                userId: 'user-1',
                workspaceId: 'workspace-1',
                agentId: 'agent-1',
                step: 1,
                completed: false,
                instruction: null,
                stepsData: { 'test-assistant': { queryCount: 3 } },
            };

            mockTx.onboardingSession.findUnique.mockResolvedValue(sessionData);
            mockTx.onboardingSession.update.mockResolvedValue({
                ...sessionData,
                stepsData: { 'test-assistant': { queryCount: 4 } },
            });

            mockPrismaService.$transaction.mockImplementation((cb: any) => Promise.resolve(cb(mockTx)));

            const result = await repository.tryIncrementQueryCount(sessionId, stepId, max);

            expect(result).toBe(true);
            expect(mockTx.onboardingSession.update).toHaveBeenCalledWith({
                where: { id: sessionId },
                data: {
                    stepsData: {
                        'test-assistant': { queryCount: 4 },
                    },
                },
            });
        });

        it('should not increment when limit reached', async () => {
            const sessionId = 'session-1';
            const stepId = 'test-assistant';
            const max = 5;
            const mockTx = {
                onboardingSession: {
                    findUnique: jest.fn(),
                    update: jest.fn(),
                },
            } as any;

            const sessionData = {
                id: sessionId,
                userId: 'user-1',
                workspaceId: 'workspace-1',
                agentId: 'agent-1',
                step: 1,
                completed: false,
                instruction: null,
                stepsData: { 'test-assistant': { queryCount: 5 } },
            };

            mockTx.onboardingSession.findUnique.mockResolvedValue(sessionData);
            mockPrismaService.$transaction.mockImplementation((cb: any) => Promise.resolve(cb(mockTx)));

            const result = await repository.tryIncrementQueryCount(sessionId, stepId, max);

            expect(result).toBe(false);
            expect(mockTx.onboardingSession.update).not.toHaveBeenCalled();
        });

        it('should initialize query count if not present', async () => {
            const sessionId = 'session-1';
            const stepId = 'improve-assistant';
            const max = 5;
            const mockTx = {
                onboardingSession: {
                    findUnique: jest.fn(),
                    update: jest.fn(),
                },
            } as any;

            const sessionData = {
                id: sessionId,
                userId: 'user-1',
                workspaceId: 'workspace-1',
                agentId: 'agent-1',
                step: 1,
                completed: false,
                instruction: null,
                stepsData: {},
            };

            mockTx.onboardingSession.findUnique.mockResolvedValue(sessionData);
            mockTx.onboardingSession.update.mockResolvedValue({
                ...sessionData,
                stepsData: { 'improve-assistant': { queryCount: 1 } },
            });

            mockPrismaService.$transaction.mockImplementation((cb: any) => Promise.resolve(cb(mockTx)));

            const result = await repository.tryIncrementQueryCount(sessionId, stepId, max);

            expect(result).toBe(true);
            expect(mockTx.onboardingSession.update).toHaveBeenCalled();
        });
    });
});
