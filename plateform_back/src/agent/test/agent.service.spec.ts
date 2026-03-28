import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentStatus } from 'generated/prisma';
import { AgentRepository } from 'src/agent/agent.repository';
import { AgentService } from 'src/agent/agent.service';

const fakeAgent = {
    id: 'agent-1',
    name: 'Support Agent',
    description: 'AI support',
    status: AgentStatus.DEVELOPMENT,
    workspaceId: 'workspace-1',
    createdBy: 'user-1',
    updatedBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockAgentRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('AgentService', () => {
    let service: AgentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentService,
                {
                    provide: AgentRepository,
                    useValue: mockAgentRepository,
                },
            ],
        }).compile();

        service = module.get<AgentService>(AgentService);

        jest.clearAllMocks();
    });

    describe('insertOne', () => {
        it('should create an agent with DEVELOPMENT status', async () => {
            mockAgentRepository.create.mockResolvedValue(fakeAgent);

            const result = await service.insertOne(
                { name: 'Support Agent', description: 'AI support' },
                'user-1',
                'workspace-1',
            );

            expect(result.status).toBe(AgentStatus.DEVELOPMENT);
            expect(mockAgentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Support Agent',
                    description: 'AI support',
                    createdBy: 'user-1',
                    updatedBy: 'user-1',
                    status: AgentStatus.DEVELOPMENT,
                    workspace: { connect: { id: 'workspace-1' } },
                }),
            );
        });

        it('should use empty string as default description', async () => {
            mockAgentRepository.create.mockResolvedValue({
                ...fakeAgent,
                description: '',
            });

            await service.insertOne(
                { name: 'Agent', description: undefined },
                'user-1',
                'workspace-1',
            );

            expect(mockAgentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ description: '' }),
            );
        });
    });

    describe('findAll', () => {
        it('should return all agents for a workspace', async () => {
            mockAgentRepository.findAll.mockResolvedValue([fakeAgent]);

            const result = await service.findAll('workspace-1');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('agent-1');
            expect(mockAgentRepository.findAll).toHaveBeenCalledWith(
                'workspace-1',
            );
        });

        it('should return empty array when no agents', async () => {
            mockAgentRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll('workspace-1');

            expect(result).toHaveLength(0);
        });
    });

    describe('findOne', () => {
        it('should return agent when found', async () => {
            mockAgentRepository.findOne.mockResolvedValue(fakeAgent);

            const result = await service.findOne('agent-1', 'workspace-1');

            expect(result).toEqual(fakeAgent);
            expect(mockAgentRepository.findOne).toHaveBeenCalledWith(
                'agent-1',
                'workspace-1',
            );
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.findOne.mockResolvedValue(null);

            await expect(
                service.findOne('unknown-id', 'workspace-1'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when agent belongs to different workspace', async () => {
            mockAgentRepository.findOne.mockResolvedValue(null);

            await expect(
                service.findOne('agent-1', 'other-workspace'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update agent when found', async () => {
            const updatedAgent = { ...fakeAgent, name: 'Updated Agent' };
            mockAgentRepository.findOne.mockResolvedValue(fakeAgent);
            mockAgentRepository.update.mockResolvedValue(updatedAgent);

            const result = await service.update(
                'agent-1',
                'workspace-1',
                { name: 'Updated Agent' },
                'user-1',
            );

            expect(result.name).toBe('Updated Agent');
            expect(mockAgentRepository.update).toHaveBeenCalledWith(
                'agent-1',
                expect.objectContaining({
                    name: 'Updated Agent',
                    updatedBy: 'user-1',
                }),
            );
        });

        it('should allow status transition from DEVELOPMENT to STAGING', async () => {
            const updatedAgent = { ...fakeAgent, status: AgentStatus.STAGING };
            mockAgentRepository.findOne.mockResolvedValue(fakeAgent);
            mockAgentRepository.update.mockResolvedValue(updatedAgent);

            const result = await service.update(
                'agent-1',
                'workspace-1',
                { status: AgentStatus.STAGING },
                'user-1',
            );

            expect(result.status).toBe(AgentStatus.STAGING);
            expect(mockAgentRepository.update).toHaveBeenCalledWith(
                'agent-1',
                expect.objectContaining({
                    status: AgentStatus.STAGING,
                    updatedBy: 'user-1',
                }),
            );
        });

        it('should allow status transition from STAGING to PRODUCTION', async () => {
            const stagingAgent = { ...fakeAgent, status: AgentStatus.STAGING };
            const updatedAgent = {
                ...stagingAgent,
                status: AgentStatus.PRODUCTION,
            };
            mockAgentRepository.findOne.mockResolvedValue(stagingAgent);
            mockAgentRepository.update.mockResolvedValue(updatedAgent);

            const result = await service.update(
                'agent-1',
                'workspace-1',
                { status: AgentStatus.PRODUCTION },
                'user-1',
            );

            expect(result.status).toBe(AgentStatus.PRODUCTION);
            expect(mockAgentRepository.update).toHaveBeenCalledWith(
                'agent-1',
                expect.objectContaining({
                    status: AgentStatus.PRODUCTION,
                    updatedBy: 'user-1',
                }),
            );
        });

        it('should reject status transition from DEVELOPMENT to PRODUCTION', async () => {
            mockAgentRepository.findOne.mockResolvedValue(fakeAgent);

            await expect(
                service.update(
                    'agent-1',
                    'workspace-1',
                    { status: AgentStatus.PRODUCTION },
                    'user-1',
                ),
            ).rejects.toThrow(ForbiddenException);

            expect(mockAgentRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.findOne.mockResolvedValue(null);

            await expect(
                service.update(
                    'unknown-id',
                    'workspace-1',
                    { name: 'New' },
                    'user-1',
                ),
            ).rejects.toThrow(NotFoundException);

            expect(mockAgentRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should delete agent when found', async () => {
            mockAgentRepository.findOne.mockResolvedValue(fakeAgent);
            mockAgentRepository.delete.mockResolvedValue(fakeAgent);

            const result = await service.remove('agent-1', 'workspace-1');

            expect(result).toEqual(fakeAgent);
            expect(mockAgentRepository.delete).toHaveBeenCalledWith('agent-1');
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.findOne.mockResolvedValue(null);

            await expect(
                service.remove('unknown-id', 'workspace-1'),
            ).rejects.toThrow(NotFoundException);

            expect(mockAgentRepository.delete).not.toHaveBeenCalled();
        });
    });
});
