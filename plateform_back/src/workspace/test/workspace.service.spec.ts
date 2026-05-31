import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from 'generated/prisma';
import { WorkspaceRepository, WorkspaceWithUsers } from 'src/workspace/workspace.repository';
import { WorkspaceStatsService } from 'src/workspace/workspace-stats.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const fakeWorkspace = {
    id: 'workspace-1',
    name: 'Mon Workspace',
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [{ userId: 'user-1', workspaceId: 'workspace-1', role: UserRole.ADMIN }],
} as WorkspaceWithUsers;

const mockWorkspaceRepository = {
    findOne: jest.fn() as any,
    findAll: jest.fn() as any,
    create: jest.fn() as any,
    delete: jest.fn() as any,
    exists: jest.fn() as any,
};

const mockWorkspaceStatsService = {
    getStats: jest.fn() as any,
};

describe('WorkspaceService', () => {
    let service: WorkspaceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkspaceService,
                { provide: WorkspaceRepository, useValue: mockWorkspaceRepository },
                { provide: WorkspaceStatsService, useValue: mockWorkspaceStatsService },
            ],
        }).compile();

        service = module.get<WorkspaceService>(WorkspaceService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a workspace and assign creator as ADMIN', async () => {
            mockWorkspaceRepository.create.mockImplementation(() => Promise.resolve(fakeWorkspace));

            const result = await service.create({ name: 'Mon Workspace', description: 'Test description' }, 'user-1');

            expect(result.name).toBe('Mon Workspace');
            expect(result.users[0].role).toBe(UserRole.ADMIN);
            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith({
                name: 'Mon Workspace',
                description: 'Test description',
                userId: 'user-1',
            });
        });

        it('should pass description to repository', async () => {
            mockWorkspaceRepository.create.mockImplementation(() => Promise.resolve(fakeWorkspace));

            await service.create({ name: 'Test', description: 'My description' }, 'user-1');

            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ description: 'My description' }),
            );
        });

        it('should not pass plan to repository (fixed to FREE server-side)', async () => {
            mockWorkspaceRepository.create.mockImplementation(() => Promise.resolve(fakeWorkspace));

            await service.create({ name: 'Test' }, 'user-1');

            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith(
                expect.not.objectContaining({ plan: expect.anything() }),
            );
        });
    });

    describe('findAll', () => {
        it('should return all workspaces for a user', async () => {
            mockWorkspaceRepository.findAll.mockImplementation(() => Promise.resolve([fakeWorkspace]));

            const result = await service.findAll('user-1');

            expect(result).toHaveLength(1);
            expect(mockWorkspaceRepository.findAll).toHaveBeenCalledWith('user-1');
        });

        it('should return empty array when user has no workspaces', async () => {
            mockWorkspaceRepository.findAll.mockImplementation(() => Promise.resolve([]));

            expect(await service.findAll('user-1')).toHaveLength(0);
        });
    });

    describe('findOne', () => {
        it('should return workspace when found', async () => {
            mockWorkspaceRepository.findOne.mockImplementation(() => Promise.resolve(fakeWorkspace));

            const result = await service.findOne('workspace-1');

            expect(result).toEqual(fakeWorkspace);
            expect(mockWorkspaceRepository.findOne).toHaveBeenCalledWith('workspace-1');
        });

        it('should throw NotFoundException when workspace not found', async () => {
            mockWorkspaceRepository.findOne.mockImplementation(() => Promise.resolve(null));

            await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete workspace', async () => {
            mockWorkspaceRepository.delete.mockImplementation(() => Promise.resolve(fakeWorkspace));

            await service.delete('workspace-1');

            expect(mockWorkspaceRepository.delete).toHaveBeenCalledWith('workspace-1');
        });

        it('should throw NotFoundException on P2025', async () => {
            const prismaError = new Error('Record not found') as Error & { code: string };
            prismaError.code = 'P2025';
            mockWorkspaceRepository.delete.mockImplementation(() => Promise.reject(prismaError));

            await expect(service.delete('unknown-id')).rejects.toThrow(NotFoundException);
        });

        it('should rethrow unknown errors', async () => {
            const err = new Error('DB connection lost');
            mockWorkspaceRepository.delete.mockImplementation(() => Promise.reject(err));

            await expect(service.delete('workspace-1')).rejects.toThrow('DB connection lost');
        });
    });

    describe('getStats', () => {
        it('should throw NotFoundException if workspace not found', async () => {
            mockWorkspaceRepository.exists.mockImplementation(() => Promise.resolve(false));

            await expect(service.getStats('unknown-id')).rejects.toThrow(NotFoundException);
            expect(mockWorkspaceStatsService.getStats).not.toHaveBeenCalled();
        });

        it('should delegate to WorkspaceStatsService', async () => {
            const fakeStats = { agents: {}, documents: {}, conversations: {} };
            mockWorkspaceRepository.exists.mockImplementation(() => Promise.resolve(true));
            mockWorkspaceStatsService.getStats.mockImplementation(() => Promise.resolve(fakeStats));

            const result = await service.getStats('workspace-1');

            expect(mockWorkspaceStatsService.getStats).toHaveBeenCalledWith('workspace-1');
            expect(result).toEqual(fakeStats);
        });
    });
});
