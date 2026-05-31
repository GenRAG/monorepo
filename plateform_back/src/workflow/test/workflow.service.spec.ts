import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowRepository } from 'src/workflow/workflow.repository';
import { WorkflowService } from 'src/workflow/workflow.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const fakeWorkflow = {
    id: 'workflow-1',
    agentId: 'agent-1',
    version: 1,
    isActive: true,
    definition: { blocks: [{ name: 'query', type: 'query' }] },
    createdAt: new Date(),
    updatedAt: new Date(),
};

const fakeWorkflowV2 = { ...fakeWorkflow, id: 'workflow-2', version: 2 };

const mockWorkflowRepository = {
    findActive: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    findByVersion: jest.fn() as any,
    activate: jest.fn() as any,
    update: jest.fn() as any,
    transaction: jest.fn() as any,
};

describe('WorkflowService', () => {
    let service: WorkflowService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WorkflowService, { provide: WorkflowRepository, useValue: mockWorkflowRepository }],
        }).compile();

        service = module.get<WorkflowService>(WorkflowService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create first version (v1) when no workflow exists', async () => {
            mockWorkflowRepository.transaction.mockImplementation((fn: any) => {
                const fakeTx = {
                    workflow: {
                        updateMany: (jest.fn() as any).mockResolvedValue({ count: 0 }),
                        findFirst: (jest.fn() as any).mockResolvedValue(null),
                        create: (jest.fn() as any).mockResolvedValue({ ...fakeWorkflow, version: 1 }),
                    },
                };
                return fn(fakeTx);
            });

            const result = await service.create('agent-1', { definition: { blocks: [] } });

            expect(result.version).toBe(1);
        });

        it('should increment version when workflow already exists', async () => {
            mockWorkflowRepository.transaction.mockImplementation((fn: any) => {
                const fakeTx = {
                    workflow: {
                        updateMany: (jest.fn() as any).mockResolvedValue({ count: 1 }),
                        findFirst: (jest.fn() as any).mockResolvedValue(fakeWorkflow),
                        create: (jest.fn() as any).mockResolvedValue({ ...fakeWorkflow, id: 'workflow-2', version: 2 }),
                    },
                };
                return fn(fakeTx);
            });

            const result = await service.create('agent-1', { definition: { blocks: [] } });

            expect(result.version).toBe(2);
        });
    });

    describe('findActive', () => {
        it('should return the active workflow', async () => {
            mockWorkflowRepository.findActive.mockResolvedValue(fakeWorkflowV2);

            const result = await service.findActive('agent-1');

            expect(result.version).toBe(2);
            expect(mockWorkflowRepository.findActive).toHaveBeenCalledWith('agent-1');
        });

        it('should throw NotFoundException when no active workflow', async () => {
            mockWorkflowRepository.findActive.mockResolvedValue(null);

            await expect(service.findActive('agent-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('activate', () => {
        it('should activate the specified workflow', async () => {
            const activated = { ...fakeWorkflow, id: 'workflow-2', isActive: true };
            mockWorkflowRepository.activate.mockResolvedValue(activated);

            const result = await service.activate('workflow-2', 'agent-1');

            expect(result.id).toBe('workflow-2');
            expect(mockWorkflowRepository.activate).toHaveBeenCalledWith('workflow-2', 'agent-1');
        });

        it('should throw NotFoundException when workflow not found', async () => {
            mockWorkflowRepository.activate.mockRejectedValue(new Error('Not found'));

            await expect(service.activate('unknown-id', 'agent-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all versions ordered by desc', async () => {
            mockWorkflowRepository.findAll.mockResolvedValue([fakeWorkflowV2, fakeWorkflow]);

            const result = await service.findAll('agent-1');

            expect(result).toHaveLength(2);
            expect(result[0].version).toBeGreaterThan(result[1].version);
        });

        it('should return empty array when no workflows', async () => {
            mockWorkflowRepository.findAll.mockResolvedValue([]);

            expect(await service.findAll('agent-1')).toHaveLength(0);
        });
    });

    describe('update', () => {
        it('should update the active workflow without changing version', async () => {
            const updatedDefinition = { blocks: [{ name: 'answer', type: 'answer' }] };
            mockWorkflowRepository.findActive.mockResolvedValue(fakeWorkflow);
            mockWorkflowRepository.update.mockResolvedValue({ ...fakeWorkflow, definition: updatedDefinition });

            const result = await service.update('agent-1', { definition: updatedDefinition });

            expect(result.definition).toEqual(updatedDefinition);
            expect(result.version).toBe(fakeWorkflow.version);
            expect(mockWorkflowRepository.update).toHaveBeenCalledWith(fakeWorkflow.id, {
                definition: updatedDefinition,
            });
        });

        it('should throw NotFoundException when no active workflow', async () => {
            mockWorkflowRepository.findActive.mockResolvedValue(null);

            await expect(service.update('agent-1', { definition: {} })).rejects.toThrow(NotFoundException);
            expect(mockWorkflowRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('findByVersion', () => {
        it('should return workflow by version', async () => {
            mockWorkflowRepository.findByVersion.mockResolvedValue(fakeWorkflow);

            const result = await service.findByVersion('agent-1', 1);

            expect(result.version).toBe(1);
            expect(mockWorkflowRepository.findByVersion).toHaveBeenCalledWith('agent-1', 1);
        });

        it('should throw NotFoundException when version not found', async () => {
            mockWorkflowRepository.findByVersion.mockResolvedValue(null);

            await expect(service.findByVersion('agent-1', 99)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findOne', () => {
        it('should return workflow when found', async () => {
            mockWorkflowRepository.findOne.mockResolvedValue(fakeWorkflow);

            const result = await service.findOne('workflow-1', 'agent-1');

            expect(result).toEqual(fakeWorkflow);
            expect(mockWorkflowRepository.findOne).toHaveBeenCalledWith('workflow-1', 'agent-1');
        });

        it('should throw NotFoundException when workflow not found', async () => {
            mockWorkflowRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('unknown-id', 'agent-1')).rejects.toThrow(NotFoundException);
        });
    });
});
