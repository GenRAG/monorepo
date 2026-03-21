import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowRepository } from 'src/workflow/workflow.repository';
import { WorkflowService } from 'src/workflow/workflow.service';

const fakeWorkflow = {
    id: 'workflow-1',
    agentId: 'agent-1',
    name: null,
    version: 1,
    definition: {
        blocks: [{ name: 'query', type: 'query' }],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
};

const fakeWorkflowV2 = { ...fakeWorkflow, id: 'workflow-2', version: 2 };

const mockWorkflowRepository = {
    findActive: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn(),
};

describe('WorkflowService', () => {
    let service: WorkflowService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkflowService,
                {
                    provide: WorkflowRepository,
                    useValue: mockWorkflowRepository,
                },
            ],
        }).compile();

        service = module.get<WorkflowService>(WorkflowService);

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create first version (v1) when no workflow exists', async () => {
            mockWorkflowRepository.transaction.mockImplementation((fn: any) => {
                const fakeTx = {
                    workflow: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockResolvedValue({
                            ...fakeWorkflow,
                            version: 1,
                        }),
                    },
                };
                return fn(fakeTx);
            });

            const result = await service.create('agent-1', {
                definition: { blocks: [] },
            });

            expect(result.version).toBe(1);
        });

        it('should increment version when workflow already exists', async () => {
            mockWorkflowRepository.transaction.mockImplementation((fn: any) => {
                const fakeTx = {
                    workflow: {
                        findFirst: jest.fn().mockResolvedValue(fakeWorkflow), // version 1 existante
                        create: jest.fn().mockResolvedValue({
                            ...fakeWorkflow,
                            id: 'workflow-2',
                            version: 2,
                        }),
                    },
                };
                return fn(fakeTx);
            });

            const result = await service.create('agent-1', {
                definition: { blocks: [] },
            });

            expect(result.version).toBe(2);
        });
    });

    describe('findActive', () => {
        it('should return latest workflow version', async () => {
            mockWorkflowRepository.findActive.mockResolvedValue(fakeWorkflowV2);

            const result = await service.findActive('agent-1');

            expect(result.version).toBe(2);
            expect(mockWorkflowRepository.findActive).toHaveBeenCalledWith(
                'agent-1',
            );
        });

        it('should throw NotFoundException when no workflow exists', async () => {
            mockWorkflowRepository.findActive.mockResolvedValue(null);

            await expect(service.findActive('agent-1')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findAll', () => {
        it('should return all versions ordered by desc', async () => {
            mockWorkflowRepository.findAll.mockResolvedValue([
                fakeWorkflowV2,
                fakeWorkflow,
            ]);

            const result = await service.findAll('agent-1');

            expect(result).toHaveLength(2);
            expect(result[0].version).toBeGreaterThan(result[1].version);
        });

        it('should return empty array when no workflows', async () => {
            mockWorkflowRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll('agent-1');

            expect(result).toHaveLength(0);
        });
    });

    describe('update', () => {
        it('should update the active workflow without changing version', async () => {
            const updatedDefinition = {
                blocks: [{ name: 'answer', type: 'answer' }],
            };
            const updatedWorkflow = {
                ...fakeWorkflow,
                definition: updatedDefinition,
            };

            mockWorkflowRepository.findActive.mockResolvedValue(fakeWorkflow);
            mockWorkflowRepository.update.mockResolvedValue(updatedWorkflow);

            const result = await service.update('agent-1', {
                definition: updatedDefinition,
            });

            expect(result.definition).toEqual(updatedDefinition);
            expect(result.version).toBe(fakeWorkflow.version);
            expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
                fakeWorkflow.id,
                { definition: updatedDefinition },
            );
        });

        it('should throw NotFoundException when no active workflow', async () => {
            mockWorkflowRepository.findActive.mockResolvedValue(null);

            await expect(
                service.update('agent-1', { definition: {} }),
            ).rejects.toThrow(NotFoundException);

            expect(mockWorkflowRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return workflow when found', async () => {
            mockWorkflowRepository.findOne.mockResolvedValue(fakeWorkflow);

            const result = await service.findOne('workflow-1', 'agent-1');

            expect(result).toEqual(fakeWorkflow);
            expect(mockWorkflowRepository.findOne).toHaveBeenCalledWith(
                'workflow-1',
                'agent-1',
            );
        });

        it('should throw NotFoundException when workflow not found', async () => {
            mockWorkflowRepository.findOne.mockResolvedValue(null);

            await expect(
                service.findOne('unknown-id', 'agent-1'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when workflow belongs to different agent', async () => {
            mockWorkflowRepository.findOne.mockResolvedValue(null);

            await expect(
                service.findOne('workflow-1', 'other-agent'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
