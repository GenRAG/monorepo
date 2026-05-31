import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentRepository } from '../deployment.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentStatus } from 'generated/prisma';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockPrismaService: any = {
    agentVersion: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
    },
    agent: {
        update: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: any) => any) => callback(mockPrismaService)),
};

describe('DeploymentRepository', () => {
    let repository: DeploymentRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DeploymentRepository, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        repository = module.get<DeploymentRepository>(DeploymentRepository);
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all deployments ordered by version desc', async () => {
            const deployments = [
                { id: 'v-3', version: 3, agentId: 'agent-1', toStatus: AgentStatus.PRODUCTION },
                { id: 'v-2', version: 2, agentId: 'agent-1', toStatus: AgentStatus.DEVELOPMENT },
                { id: 'v-1', version: 1, agentId: 'agent-1', toStatus: AgentStatus.DEVELOPMENT },
            ];
            mockPrismaService.agentVersion.findMany.mockResolvedValue(deployments);

            const result = await repository.findAll('agent-1');

            expect(mockPrismaService.agentVersion.findMany).toHaveBeenCalledWith({
                where: { agentId: 'agent-1' },
                orderBy: { version: 'desc' },
            });
            expect(result).toEqual(deployments);
        });

        it('should return empty array when no deployments', async () => {
            mockPrismaService.agentVersion.findMany.mockResolvedValue([]);

            const result = await repository.findAll('agent-1');

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should find deployment by id and agentId with user details', async () => {
            const deployment = {
                id: 'v-1',
                version: 1,
                agentId: 'agent-1',
                toStatus: AgentStatus.PRODUCTION,
                createdByUser: { id: 'user-1', name: 'Alice' },
            };
            mockPrismaService.agentVersion.findFirst.mockResolvedValue(deployment);

            const result = await repository.findOne('v-1', 'agent-1');

            expect(mockPrismaService.agentVersion.findFirst).toHaveBeenCalledWith({
                where: { id: 'v-1', agentId: 'agent-1' },
                include: {
                    createdByUser: {
                        select: { id: true, name: true },
                    },
                },
            });
            expect(result).toEqual(deployment);
        });

        it('should return null when deployment not found', async () => {
            mockPrismaService.agentVersion.findFirst.mockResolvedValue(null);

            const result = await repository.findOne('missing', 'agent-1');

            expect(result).toBeNull();
        });
    });

    describe('findLatest', () => {
        it('should find latest deployment by version desc', async () => {
            const latest = { id: 'v-5', version: 5, agentId: 'agent-1', toStatus: AgentStatus.PRODUCTION };
            mockPrismaService.agentVersion.findFirst.mockResolvedValue(latest);

            const result = await repository.findLatest('agent-1');

            expect(mockPrismaService.agentVersion.findFirst).toHaveBeenCalledWith({
                where: { agentId: 'agent-1' },
                orderBy: { version: 'desc' },
            });
            expect(result).toEqual(latest);
        });

        it('should return null when no deployments exist', async () => {
            mockPrismaService.agentVersion.findFirst.mockResolvedValue(null);

            const result = await repository.findLatest('agent-1');

            expect(result).toBeNull();
        });
    });

    describe('createWithAgentUpdate', () => {
        it('should create deployment and update agent in transaction', async () => {
            const created = {
                id: 'v-2',
                version: 2,
                agentId: 'agent-1',
                fromStatus: AgentStatus.DEVELOPMENT,
                toStatus: AgentStatus.PRODUCTION,
                name: 'Deploy v2',
                changelog: 'Added new features',
                workflowVersion: 5,
                createdBy: 'user-1',
            };

            mockPrismaService.agentVersion.findFirst.mockResolvedValue({ version: 1 });
            mockPrismaService.agentVersion.create.mockResolvedValue(created);

            const result = await repository.createWithAgentUpdate({
                agentId: 'agent-1',
                fromStatus: AgentStatus.DEVELOPMENT,
                toStatus: AgentStatus.PRODUCTION,
                name: 'Deploy v2',
                changelog: 'Added new features',
                workflowVersion: 5,
                userId: 'user-1',
            });

            expect(mockPrismaService.$transaction).toHaveBeenCalled();
            expect(mockPrismaService.agent.update).toHaveBeenCalledWith({
                where: { id: 'agent-1' },
                data: { updatedBy: 'user-1', status: AgentStatus.PRODUCTION },
            });
            expect(mockPrismaService.agentVersion.create).toHaveBeenCalledWith({
                data: {
                    agentId: 'agent-1',
                    version: 2,
                    name: 'Deploy v2',
                    changelog: 'Added new features',
                    fromStatus: AgentStatus.DEVELOPMENT,
                    toStatus: AgentStatus.PRODUCTION,
                    workflowVersion: 5,
                    createdBy: 'user-1',
                },
            });
            expect(result).toEqual(created);
        });

        it('should create deployment with version 1 when no prior versions', async () => {
            const created = {
                id: 'v-1',
                version: 1,
                agentId: 'agent-1',
                fromStatus: AgentStatus.DEVELOPMENT,
                toStatus: AgentStatus.PRODUCTION,
                name: 'Deploy v1',
            };

            mockPrismaService.agentVersion.findFirst.mockResolvedValue(null);
            mockPrismaService.agentVersion.create.mockResolvedValue(created);

            const result = await repository.createWithAgentUpdate({
                agentId: 'agent-1',
                fromStatus: AgentStatus.DEVELOPMENT,
                toStatus: AgentStatus.PRODUCTION,
                name: 'Deploy v1',
                userId: 'user-1',
            });

            expect(mockPrismaService.agentVersion.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ version: 1, name: 'Deploy v1' }),
            });
            expect(result).toEqual(created);
        });

        it('should use default name when not provided', async () => {
            mockPrismaService.agentVersion.findFirst.mockResolvedValue(null);
            mockPrismaService.agentVersion.create.mockResolvedValue({ version: 1 });

            await repository.createWithAgentUpdate({
                agentId: 'agent-1',
                fromStatus: AgentStatus.DEVELOPMENT,
                toStatus: AgentStatus.PRODUCTION,
                userId: 'user-1',
            });

            expect(mockPrismaService.agentVersion.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ name: 'Deployment' }),
            });
        });
    });
});
