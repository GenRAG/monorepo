import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PlanTier } from 'generated/prisma';
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
    users: [{ userId: 'user-1', workspaceId: 'workspace-1' }],
} as WorkspaceWithUsers;

const mockWorkspaceRepository = {
    findOne: jest.fn() as any,
    findAll: jest.fn() as any,
    create: jest.fn() as any,
    exists: jest.fn() as any,
    updateName: jest.fn() as any,
};

const env: Record<string, string | undefined> = {};
const mockConfigService = { get: (key: string) => env[key] };
const user = { id: 'user-1', email: 'beta@acme.fr' };

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
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<WorkspaceService>(WorkspaceService);
        jest.clearAllMocks();
        delete env.NODE_ENV;
        delete env.DISCOVERY_EMAILS;
    });

    describe('create', () => {
        it('should create a workspace and assign creator as ADMIN', async () => {
            mockWorkspaceRepository.create.mockImplementation(() => Promise.resolve(fakeWorkspace));

            const result = await service.create({ name: 'Mon Workspace', description: 'Test description' }, user);

            expect(result.name).toBe('Mon Workspace');
            expect(result.users[0].userId).toBe('user-1');
            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith({
                name: 'Mon Workspace',
                description: 'Test description',
                userId: 'user-1',
                plan: PlanTier.FREE,
            });
        });

        it('should pass description to repository', async () => {
            mockWorkspaceRepository.create.mockImplementation(() => Promise.resolve(fakeWorkspace));

            await service.create({ name: 'Test', description: 'My description' }, user);

            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ description: 'My description' }),
            );
        });

        it.each([
            ['outside production, every new workspace gets Découverte', undefined, undefined, PlanTier.FREE],
            ['in production, an invited email gets Découverte', 'production', 'x@y.fr, Beta@Acme.fr', PlanTier.FREE],
            ['in production, anyone else gets no plan until they subscribe', 'production', 'x@y.fr', PlanTier.NONE],
        ])('%s', async (_case, nodeEnv, discoveryEmails, plan) => {
            env.NODE_ENV = nodeEnv;
            env.DISCOVERY_EMAILS = discoveryEmails;
            mockWorkspaceRepository.create.mockImplementation(() => Promise.resolve(fakeWorkspace));

            await service.create({ name: 'Test' }, user);

            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith(expect.objectContaining({ plan }));
        });
    });

    describe('create (one workspace per user)', () => {
        it('should throw ConflictException when the user already has a workspace', async () => {
            mockWorkspaceRepository.create.mockImplementation(() => Promise.resolve(null));

            await expect(service.create({ name: 'Second' }, user)).rejects.toThrow(ConflictException);
        });

        it('should trim the name', async () => {
            mockWorkspaceRepository.create.mockImplementation(() => Promise.resolve(fakeWorkspace));

            await service.create({ name: '  Acme  ' }, user);

            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Acme' }));
        });

        it('should reject a blank name', async () => {
            await expect(service.create({ name: '   ' }, user)).rejects.toThrow(BadRequestException);
            expect(mockWorkspaceRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('rename', () => {
        it('should rename the workspace with a trimmed name', async () => {
            mockWorkspaceRepository.updateName.mockImplementation(() =>
                Promise.resolve({ ...fakeWorkspace, name: 'Acme' }),
            );

            const result = await service.rename('workspace-1', { name: ' Acme ' });

            expect(result.name).toBe('Acme');
            expect(mockWorkspaceRepository.updateName).toHaveBeenCalledWith('workspace-1', 'Acme');
        });

        it('should reject a blank name', async () => {
            await expect(service.rename('workspace-1', { name: '  ' })).rejects.toThrow(BadRequestException);
            expect(mockWorkspaceRepository.updateName).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException on P2025', async () => {
            const prismaError = new Error('Record not found') as Error & { code: string };
            prismaError.code = 'P2025';
            mockWorkspaceRepository.updateName.mockImplementation(() => Promise.reject(prismaError));

            await expect(service.rename('unknown-id', { name: 'Acme' })).rejects.toThrow(NotFoundException);
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
