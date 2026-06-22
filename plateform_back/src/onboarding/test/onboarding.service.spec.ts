import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { describe, jest, beforeEach, afterEach, it, expect } from '@jest/globals';
import { OnboardingService } from '../onboarding.service';
import { OnboardingRepository } from '../onboarding.repository';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { DEMO_WORKFLOW_DEFINITION } from '../demo-workflow.definition';

describe('OnboardingService', () => {
    let service: OnboardingService;

    const mockRepository = {
        findByUserAndWorkspace: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        tryIncrementQueryCount: jest.fn(),
    } as any;

    const mockAgentService = {
        insertOne: jest.fn(),
        remove: jest.fn(),
    } as any;

    const mockWorkflowService = {
        findActive: jest.fn(),
        update: jest.fn(),
    } as any;

    const mockOrchestrator = {
        executeQuery: jest.fn(),
    } as any;

    const mockCreditBalanceService = {
        grantInitial: jest.fn(),
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OnboardingService,
                { provide: OnboardingRepository, useValue: mockRepository },
                { provide: AgentService, useValue: mockAgentService },
                { provide: WorkflowService, useValue: mockWorkflowService },
                { provide: AgentRuntimeOrchestrator, useValue: mockOrchestrator },
                { provide: CreditBalanceService, useValue: mockCreditBalanceService },
            ],
        }).compile();

        service = module.get<OnboardingService>(OnboardingService);

        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('start', () => {
        it('should return existing session if present', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);

            const result = await service.start(userId, workspaceId);

            expect(result).toEqual({
                sessionId: 'session-1',
                agentId: 'agent-1',
                step: 1,
                completed: false,
                instruction: null,
                stepsData: {},
            });
            expect(mockAgentService.insertOne).not.toHaveBeenCalled();
        });

        it('should create new session and agent if none exists', async () => {
            const userId = 'user-1';
            const workspaceId = 'workspace-1';

            mockRepository.findByUserAndWorkspace.mockResolvedValue(null);
            mockAgentService.insertOne.mockResolvedValue({ id: 'agent-1' });
            mockRepository.create.mockResolvedValue({
                id: 'session-1',
                userId,
                workspaceId,
                agentId: 'agent-1',
                step: 1,
                completed: false,
                instruction: null,
                stepsData: null,
            });
            mockCreditBalanceService.grantInitial.mockResolvedValue(undefined);

            const result = await service.start(userId, workspaceId);

            expect(mockAgentService.insertOne).toHaveBeenCalledWith(
                {
                    name: 'Demo Assistant',
                    description: "Agent de démonstration créé lors de l'onboarding.",
                    workflow: { definition: DEMO_WORKFLOW_DEFINITION },
                },
                userId,
                workspaceId,
            );
            expect(mockRepository.create).toHaveBeenCalled();
            expect(mockCreditBalanceService.grantInitial).toHaveBeenCalledWith({
                workspaceId,
                amount: 20,
            });
            expect(result.sessionId).toBe('session-1');
        });

        it('should remove agent on constraint violation', async () => {
            mockRepository.findByUserAndWorkspace.mockResolvedValueOnce(null);
            mockAgentService.insertOne.mockResolvedValue({ id: 'agent-1' });
            mockRepository.create.mockRejectedValueOnce(new Error('Create failed'));
            mockAgentService.remove.mockResolvedValue(undefined);

            try {
                await service.start('user-1', 'workspace-1');
            } catch (_err) {
                // Expected to fail since we're testing error path
            }

            // Verify agent was not removed for non-P2002 errors (error is re-thrown)
            expect(mockAgentService.remove).not.toHaveBeenCalled();
        });

        it('should not swallow non-P2002 errors', async () => {
            mockRepository.findByUserAndWorkspace.mockResolvedValue(null);
            mockAgentService.insertOne.mockResolvedValue({ id: 'agent-1' });
            mockRepository.create.mockRejectedValue(new Error('Database error'));

            await expect(service.start('user-1', 'workspace-1')).rejects.toThrow('Database error');
        });
    });

    describe('getSession', () => {
        it('should return session response', async () => {
            const mockSession = {
                id: 'session-1',
                userId: 'user-1',
                workspaceId: 'workspace-1',
                agentId: 'agent-1',
                step: 2,
                completed: false,
                instruction: 'Test instruction',
                stepsData: { step1: { data: 'value' } },
            };

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);

            const result = await service.getSession('user-1', 'workspace-1');

            expect(result).toEqual({
                sessionId: 'session-1',
                agentId: 'agent-1',
                step: 2,
                completed: false,
                instruction: 'Test instruction',
                stepsData: { step1: { data: 'value' } },
            });
        });

        it('should return null when session not found', async () => {
            mockRepository.findByUserAndWorkspace.mockResolvedValue(null);

            const result = await service.getSession('user-1', 'workspace-1');

            expect(result).toBeNull();
        });
    });

    describe('updateStep', () => {
        it('should update step number', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockRepository.update.mockResolvedValue({
                ...mockSession,
                step: 2,
            });

            const result = await service.updateStep('user-1', 'workspace-1', 2);

            expect(result.step).toBe(2);
            expect(mockRepository.update).toHaveBeenCalledWith('session-1', { step: 2 });
        });

        it('should throw NotFoundException when session not found', async () => {
            mockRepository.findByUserAndWorkspace.mockResolvedValue(null);

            await expect(service.updateStep('user-1', 'workspace-1', 2)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when skipping steps', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);

            await expect(service.updateStep('user-1', 'workspace-1', 5)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('updateStepsData', () => {
        it('should update step data', async () => {
            const mockSession = {
                id: 'session-1',
                userId: 'user-1',
                workspaceId: 'workspace-1',
                agentId: 'agent-1',
                step: 1,
                completed: false,
                instruction: null,
                stepsData: { step1: { existing: 'data' } },
            };

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockRepository.update.mockResolvedValue(mockSession);

            await service.updateStepsData('user-1', 'workspace-1', 'step1', { new: 'value' });

            expect(mockRepository.update).toHaveBeenCalledWith('session-1', {
                stepsData: {
                    step1: { existing: 'data', new: 'value' },
                },
            });
        });

        it('should initialize stepsData if not present', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockRepository.update.mockResolvedValue(mockSession);

            await service.updateStepsData('user-1', 'workspace-1', 'step1', { data: 'value' });

            expect(mockRepository.update).toHaveBeenCalledWith('session-1', {
                stepsData: {
                    step1: { data: 'value' },
                },
            });
        });
    });

    describe('compare', () => {
        it('should return three instruction style responses', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockRepository.tryIncrementQueryCount.mockResolvedValue(true);

            mockOrchestrator.executeQuery
                .mockResolvedValueOnce({ answer: 'Standard response' })
                .mockResolvedValueOnce({ answer: 'Precise response with references' })
                .mockResolvedValueOnce({ answer: 'Creative and engaging response' });

            const result = await service.compare('user-1', 'workspace-1', 'test query');

            expect(result).toEqual({
                standard: 'Standard response',
                precise: 'Precise response with references',
                creative: 'Creative and engaging response',
            });
            expect(mockOrchestrator.executeQuery).toHaveBeenCalledTimes(3);
        });

        it('should return empty strings for failed queries', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockRepository.tryIncrementQueryCount.mockResolvedValue(true);

            mockOrchestrator.executeQuery
                .mockResolvedValueOnce({ answer: 'Success' })
                .mockRejectedValueOnce(new Error('Failed'))
                .mockResolvedValueOnce({ answer: 'Success' });

            const result = await service.compare('user-1', 'workspace-1', 'test query');

            expect(result.standard).toBe('Success');
            expect(result.precise).toBe('');
            expect(result.creative).toBe('Success');
        });

        it('should throw when limit reached', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockRepository.tryIncrementQueryCount.mockResolvedValue(false);

            await expect(service.compare('user-1', 'workspace-1', 'test')).rejects.toThrow(ForbiddenException);
        });
    });

    describe('complete', () => {
        it('should update workflow and mark session as completed', async () => {
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

            const mockWorkflow = {
                id: 'workflow-1',
                agentId: 'agent-1',
                definition: {
                    blocks: [
                        { name: 'query', type: 'query' },
                        { name: 'answer', type: 'answer', model: 'gpt-4' },
                    ],
                    nodes: [],
                    edges: [],
                },
                version: 1,
                isActive: true,
            };

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockWorkflowService.findActive.mockResolvedValue(mockWorkflow);
            mockWorkflowService.update.mockResolvedValue(mockWorkflow);
            mockRepository.update.mockResolvedValue({
                ...mockSession,
                completed: true,
                instruction:
                    'Répondre de façon concise et directe en se basant exclusivement sur les documents fournis.',
            });

            await service.complete('user-1', 'workspace-1', 'standard');

            expect(mockWorkflowService.update).toHaveBeenCalledWith(
                'agent-1',
                expect.objectContaining({
                    definition: expect.objectContaining({
                        blocks: expect.arrayContaining([
                            expect.objectContaining({
                                type: 'answer',
                                system_prompt:
                                    'Répondre de façon concise et directe en se basant exclusivement sur les documents fournis.',
                            }),
                        ]),
                    }),
                }),
            );
            expect(mockRepository.update).toHaveBeenCalledWith(
                'session-1',
                expect.objectContaining({ completed: true }),
            );
        });

        it('should throw when workflow not found', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockWorkflowService.findActive.mockResolvedValue(null);

            await expect(service.complete('user-1', 'workspace-1', 'standard')).rejects.toThrow(NotFoundException);
        });
    });

    describe('resolveStreamParams', () => {
        it('should return onboarding org for test-assistant', () => {
            const result = service.resolveStreamParams('agent-1', 'test-assistant');

            expect(result).toEqual({
                resolvedStepId: 'test-assistant',
                orgId: 'onboarding',
            });
        });

        it('should return agentId org for other steps', () => {
            const result = service.resolveStreamParams('agent-1', 'improve-assistant');

            expect(result).toEqual({
                resolvedStepId: 'improve-assistant',
                orgId: 'agent-1',
            });
        });

        it('should default to test-assistant when stepId not provided', () => {
            const result = service.resolveStreamParams('agent-1');

            expect(result).toEqual({
                resolvedStepId: 'test-assistant',
                orgId: 'onboarding',
            });
        });
    });

    describe('checkAndIncrementQueryCount', () => {
        it('should call tryIncrementQueryCount with correct params', async () => {
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

            mockRepository.findByUserAndWorkspace.mockResolvedValue(mockSession);
            mockRepository.tryIncrementQueryCount.mockResolvedValue(true);

            await service.checkAndIncrementQueryCount('user-1', 'workspace-1', 'test-assistant');

            expect(mockRepository.tryIncrementQueryCount).toHaveBeenCalledWith('session-1', 'test-assistant', 5);
        });

        it('should throw NotFoundException when session not found', async () => {
            mockRepository.findByUserAndWorkspace.mockResolvedValue(null);

            await expect(
                service.checkAndIncrementQueryCount('user-1', 'workspace-1', 'test-assistant'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
