import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DatasetService, DATASET_CLEANUP_QUEUE, DATASET_CLEANUP_JOB } from 'src/dataset/dataset.service';
import { DatasetRepository } from 'src/dataset/dataset.repository';
import { AgentRepository } from 'src/agent/agent.repository';

const fakeDataset = {
    id: 'dataset-1',
    name: 'Juridique',
    description: null,
    workspaceId: 'workspace-1',
};

const mockDatasetRepository = {
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    exists: jest.fn() as any,
    create: jest.fn() as any,
    update: jest.fn() as any,
    delete: jest.fn() as any,
    findDocumentsForCleanup: jest.fn() as any,
    countAgentsInWorkspace: jest.fn() as any,
    addAgentToDataset: jest.fn() as any,
    removeAgentFromDataset: jest.fn() as any,
    setAgents: jest.fn() as any,
    findDatasetIdsByAgent: jest.fn() as any,
    getDailyAdditions: jest.fn() as any,
    getWorkspaceDailyAdditions: jest.fn() as any,
    getDocumentBreakdowns: jest.fn() as any,
};

const mockAgentRepository = {
    findOne: jest.fn() as any,
};

const mockQueue = {
    add: jest.fn() as any,
};

/** Simulates the workspace scoping done in the repositories. */
const scopeTo = (workspaceId: string, value: unknown) => (_id: string, ws: string) =>
    Promise.resolve(ws === workspaceId ? value : null);

describe('DatasetService', () => {
    let service: DatasetService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DatasetService,
                { provide: DatasetRepository, useValue: mockDatasetRepository },
                { provide: AgentRepository, useValue: mockAgentRepository },
                {
                    provide: getQueueToken(DATASET_CLEANUP_QUEUE),
                    useValue: mockQueue,
                },
            ],
        }).compile();

        service = module.get<DatasetService>(DatasetService);
        jest.clearAllMocks();
        mockDatasetRepository.exists.mockImplementation(scopeTo('workspace-1', { id: 'dataset-1' }));
        mockAgentRepository.findOne.mockImplementation(scopeTo('workspace-1', { id: 'agent-1' }));
    });

    describe('create', () => {
        it('should create the dataset in the given workspace', async () => {
            mockDatasetRepository.create.mockResolvedValue(fakeDataset);

            const result = await service.create('workspace-1', {
                name: '  Juridique ',
                description: 'Droit',
            });

            expect(mockDatasetRepository.create).toHaveBeenCalledWith('workspace-1', {
                name: 'Juridique',
                description: 'Droit',
            });
            expect(result).toBe(fakeDataset);
        });
    });

    describe('findAll', () => {
        it('should only query the datasets of the workspace, with 30 days of activity', async () => {
            mockDatasetRepository.findAll.mockResolvedValue([fakeDataset]);
            mockDatasetRepository.getWorkspaceDailyAdditions.mockResolvedValue([]);

            const result = await service.findAll('workspace-1');

            expect(mockDatasetRepository.findAll).toHaveBeenCalledWith('workspace-1');
            expect(mockDatasetRepository.getWorkspaceDailyAdditions).toHaveBeenCalledWith(
                'workspace-1',
                expect.any(Date),
            );
            expect(result).toEqual([{ ...fakeDataset, activity: new Array(30).fill(0) }]);
        });

        it("should put each day's additions in the right dataset and slot", async () => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const todayKey = today.toISOString().slice(0, 10);
            mockDatasetRepository.findAll.mockResolvedValue([fakeDataset, { ...fakeDataset, id: 'dataset-2' }]);
            mockDatasetRepository.getWorkspaceDailyAdditions.mockResolvedValue([
                { datasetId: 'dataset-2', day: new Date(todayKey), count: 4 },
            ]);

            const [first, second] = await service.findAll('workspace-1');

            expect(first.activity?.every((count) => count === 0)).toBe(true);
            expect(second.activity?.[29]).toBe(4);
        });
    });

    describe('findOne', () => {
        it('should return the dataset of the workspace', async () => {
            mockDatasetRepository.findOne.mockImplementation(scopeTo('workspace-1', fakeDataset));

            await expect(service.findOne('dataset-1', 'workspace-1')).resolves.toBe(fakeDataset);
        });

        it('should throw NotFoundException when the dataset is missing or in another workspace', async () => {
            mockDatasetRepository.findOne.mockImplementation(scopeTo('workspace-1', fakeDataset));

            await expect(service.findOne('dataset-1', 'workspace-2')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should throw NotFoundException for a dataset of another workspace', async () => {
            await expect(service.update('dataset-1', 'workspace-2', { name: 'x' })).rejects.toThrow(NotFoundException);
            expect(mockDatasetRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should throw NotFoundException for a dataset of another workspace', async () => {
            await expect(service.delete('dataset-1', 'workspace-2')).rejects.toThrow(NotFoundException);
            expect(mockDatasetRepository.delete).not.toHaveBeenCalled();
        });

        it('should delete the dataset and enqueue the cleanup of its files and vectors', async () => {
            const documents = [{ name: 'a.pdf', storageKey: 'datasets/dataset-1/1-a.pdf' }];
            mockDatasetRepository.findDocumentsForCleanup.mockResolvedValue(documents);

            await service.delete('dataset-1', 'workspace-1');

            expect(mockDatasetRepository.delete).toHaveBeenCalledWith('dataset-1');
            expect(mockQueue.add).toHaveBeenCalledWith(
                DATASET_CLEANUP_JOB,
                { datasetId: 'dataset-1', documents },
                expect.any(Object),
            );
        });

        it('should not enqueue a cleanup for an empty dataset', async () => {
            mockDatasetRepository.findDocumentsForCleanup.mockResolvedValue([]);

            await service.delete('dataset-1', 'workspace-1');

            expect(mockQueue.add).not.toHaveBeenCalled();
        });
    });

    describe('attachToAgent / detachFromAgent', () => {
        it('should attach a dataset to an agent of the same workspace', async () => {
            await service.attachToAgent('dataset-1', 'agent-1', 'workspace-1');

            expect(mockDatasetRepository.addAgentToDataset).toHaveBeenCalledWith('dataset-1', 'agent-1');
        });

        it('should detach a dataset from an agent of the same workspace', async () => {
            await service.detachFromAgent('dataset-1', 'agent-1', 'workspace-1');

            expect(mockDatasetRepository.removeAgentFromDataset).toHaveBeenCalledWith('dataset-1', 'agent-1');
        });

        it('should refuse an agent of another workspace', async () => {
            mockAgentRepository.findOne.mockResolvedValue(null);

            await expect(service.attachToAgent('dataset-1', 'agent-x', 'workspace-1')).rejects.toThrow(
                NotFoundException,
            );
            expect(mockDatasetRepository.addAgentToDataset).not.toHaveBeenCalled();
        });

        it('should refuse a dataset of another workspace', async () => {
            mockDatasetRepository.exists.mockResolvedValue(null);

            await expect(service.attachToAgent('dataset-x', 'agent-1', 'workspace-1')).rejects.toThrow(
                NotFoundException,
            );
            expect(mockDatasetRepository.addAgentToDataset).not.toHaveBeenCalled();
        });
    });

    describe('setAgents', () => {
        it('should replace the agents of the dataset', async () => {
            mockDatasetRepository.countAgentsInWorkspace.mockResolvedValue(2);

            await service.setAgents('dataset-1', ['agent-1', 'agent-2', 'agent-1'], 'workspace-1');

            expect(mockDatasetRepository.countAgentsInWorkspace).toHaveBeenCalledWith(
                ['agent-1', 'agent-2'],
                'workspace-1',
            );
            expect(mockDatasetRepository.setAgents).toHaveBeenCalledWith('dataset-1', ['agent-1', 'agent-2']);
        });

        it('should detach every agent with an empty list', async () => {
            await service.setAgents('dataset-1', [], 'workspace-1');

            expect(mockDatasetRepository.countAgentsInWorkspace).not.toHaveBeenCalled();
            expect(mockDatasetRepository.setAgents).toHaveBeenCalledWith('dataset-1', []);
        });

        it('should apply nothing when one agent belongs to another workspace', async () => {
            mockDatasetRepository.countAgentsInWorkspace.mockResolvedValue(1);

            await expect(service.setAgents('dataset-1', ['agent-1', 'foreign'], 'workspace-1')).rejects.toThrow(
                BadRequestException,
            );
            expect(mockDatasetRepository.setAgents).not.toHaveBeenCalled();
        });
    });

    describe('resolveOrgIdsForAgent', () => {
        beforeEach(() => {
            // The repository only returns datasets attached to the agent AND in the agent's workspace.
            mockDatasetRepository.findDatasetIdsByAgent.mockResolvedValue(['d1', 'd2']);
        });

        it('should return every attached dataset when no dataset is selected', async () => {
            await expect(service.resolveOrgIdsForAgent('agent-1')).resolves.toEqual(['d1', 'd2']);
            await expect(service.resolveOrgIdsForAgent('agent-1', [])).resolves.toEqual(['d1', 'd2']);
        });

        it('should ignore datasets that are not attached, deleted or from another workspace', async () => {
            const result = await service.resolveOrgIdsForAgent('agent-1', ['d2', 'deleted', 'foreign', 'd2']);

            expect(result).toEqual(['d2']);
        });

        it('should return an empty list when the agent has no dataset', async () => {
            mockDatasetRepository.findDatasetIdsByAgent.mockResolvedValue([]);

            await expect(service.resolveOrgIdsForAgent('agent-1', ['d1'])).resolves.toEqual([]);
        });
    });

    describe('getAnalytics', () => {
        const breakdowns = {
            sizeByMimeType: [
                { mimeType: 'application/pdf', count: 2, size: 300 },
                { mimeType: 'text/plain', count: 1, size: 100 },
            ],
            countBySource: { UPLOAD: 3, GOOGLE_DRIVE: 0, SHAREPOINT: 0, NOTION: 0 },
            statusCounts: { UPLOADED: 0, PROCESSING: 1, INDEXED: 2, FAILED: 0 },
        };

        it('should throw NotFoundException for a dataset of another workspace', async () => {
            await expect(service.getAnalytics('dataset-1', 'workspace-2', 7)).rejects.toThrow(NotFoundException);
            expect(mockDatasetRepository.getDailyAdditions).not.toHaveBeenCalled();
        });

        it('should return one point per day of the period, with the totals and quota', async () => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const todayKey = today.toISOString().slice(0, 10);
            mockDatasetRepository.getDailyAdditions.mockResolvedValue([
                { day: new Date(todayKey), count: 3, size: 400 },
            ]);
            mockDatasetRepository.getDocumentBreakdowns.mockResolvedValue(breakdowns);

            const result = await service.getAnalytics('dataset-1', 'workspace-1', 7);

            expect(result.additions).toHaveLength(7);
            expect(result.additions[6]).toEqual({ date: todayKey, count: 3, size: 400 });
            expect(result.additions.slice(0, 6).every((point) => point.count === 0)).toBe(true);
            expect(result.totalDocuments).toBe(3);
            expect(result.totalSize).toBe(400);
            expect(result.quotaBytes).toBe(100 * 1024 * 1024);
            expect(result.countBySource.UPLOAD).toBe(3);
        });
    });
});
