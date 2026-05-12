import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from 'generated/prisma';
import {
    WorkspaceRepository,
    WorkspaceWithUsers,
} from 'src/workspace/workspace.repository';
import { WorkspaceService } from 'src/workspace/workspace.service';

const fakeWorkspace = {
    id: 'workspace-1',
    name: 'Mon Workspace',
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [
        {
            userId: 'user-1',
            workspaceId: 'workspace-1',
            role: UserRole.ADMIN,
        },
    ],
} as WorkspaceWithUsers;

const fakeWorkspaceWithoutUsers = {
    id: 'workspace-2',
    name: 'Other Workspace',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
};

const mockWorkspaceRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
};

describe('WorkspaceService', () => {
    let service: WorkspaceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkspaceService,
                {
                    provide: WorkspaceRepository,
                    useValue: mockWorkspaceRepository,
                },
            ],
        }).compile();

        service = module.get<WorkspaceService>(WorkspaceService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a workspace and assign creator as ADMIN', async () => {
            mockWorkspaceRepository.create.mockResolvedValue(fakeWorkspace);

            const result = await service.create(
                { name: 'Mon Workspace', description: 'Test description' },
                'user-1',
            );

            expect(result.name).toBe('Mon Workspace');
            expect(result.users[0].role).toBe(UserRole.ADMIN);
            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith({
                name: 'Mon Workspace',
                description: 'Test description',
                userId: 'user-1',
            });
        });

        it('should pass description to repository', async () => {
            mockWorkspaceRepository.create.mockResolvedValue(fakeWorkspace);

            await service.create(
                { name: 'Test', description: 'My description' },
                'user-1',
            );

            expect(mockWorkspaceRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ description: 'My description' }),
            );
        });
    });

    describe('findAll', () => {
        it('should return all workspaces for a user', async () => {
            mockWorkspaceRepository.findAll.mockResolvedValue([fakeWorkspace]);

            const result = await service.findAll('user-1');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('workspace-1');
            expect(mockWorkspaceRepository.findAll).toHaveBeenCalledWith(
                'user-1',
            );
        });

        it('should return empty array when user has no workspaces', async () => {
            mockWorkspaceRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll('user-1');

            expect(result).toHaveLength(0);
        });

        it('should not return workspaces of other users', async () => {
            mockWorkspaceRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll('other-user');

            expect(result).toHaveLength(0);
            expect(mockWorkspaceRepository.findAll).toHaveBeenCalledWith(
                'other-user',
            );
        });
    });

    describe('findOne', () => {
        it('should return workspace when found', async () => {
            mockWorkspaceRepository.findOne.mockResolvedValue(fakeWorkspace);

            const result = await service.findOne('workspace-1');

            expect(result).toEqual(fakeWorkspace);
            expect(mockWorkspaceRepository.findOne).toHaveBeenCalledWith(
                'workspace-1',
            );
        });

        it('should throw NotFoundException when workspace not found', async () => {
            mockWorkspaceRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('unknown-id')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should include users in the response', async () => {
            mockWorkspaceRepository.findOne.mockResolvedValue(fakeWorkspace);

            const result = await service.findOne('workspace-1');

            expect(result).toHaveProperty('users');
            expect(result.users).toHaveLength(1);
        });

        it('should return workspace without users', async () => {
            mockWorkspaceRepository.findOne.mockResolvedValue(
                fakeWorkspaceWithoutUsers,
            );

            const result = await service.findOne('workspace-2');

            expect(result).toEqual(fakeWorkspaceWithoutUsers);
            expect(result.users).toHaveLength(0);
        });
    });

    describe('delete', () => {
        it('should delete workspace when found', async () => {
            mockWorkspaceRepository.findOne.mockResolvedValue(fakeWorkspace);
            mockWorkspaceRepository.delete.mockResolvedValue(undefined);

            await service.delete('workspace-1');

            expect(mockWorkspaceRepository.delete).toHaveBeenCalledWith(
                'workspace-1',
            );
        });

        it('should throw NotFoundException when workspace not found', async () => {
            mockWorkspaceRepository.findOne.mockResolvedValue(null);

            await expect(service.delete('unknown-id')).rejects.toThrow(
                NotFoundException,
            );

            expect(mockWorkspaceRepository.delete).not.toHaveBeenCalled();
        });

        it('should first check existence before deleting', async () => {
            mockWorkspaceRepository.findOne.mockResolvedValue(fakeWorkspace);
            mockWorkspaceRepository.delete.mockResolvedValue(undefined);

            await service.delete('workspace-1');

            const findOneOrder =
                mockWorkspaceRepository.findOne.mock.invocationCallOrder[0];
            const deleteOrder =
                mockWorkspaceRepository.delete.mock.invocationCallOrder[0];

            expect(findOneOrder).toBeLessThan(deleteOrder);
        });
    });
});
