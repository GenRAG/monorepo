import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentStatus } from 'generated/prisma';
import { AgentRepository } from 'src/agent/agent.repository';
import { AgentService } from 'src/agent/agent.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

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

const mockTx = {
    agent: { create: jest.fn() as any },
    workflow: { create: jest.fn() as any },
};

const mockAgentRepository = {
    findOne: jest.fn() as any,
    findAll: jest.fn() as any,
    update: jest.fn() as any,
    delete: jest.fn() as any,
    transaction: jest.fn((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as any,
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
            mockTx.agent.create.mockImplementation(() => Promise.resolve(fakeAgent));

            const result = await service.insertOne(
                { name: 'Support Agent', description: 'AI support' },
                'user-1',
                'workspace-1',
            );

            expect(result.status).toBe(AgentStatus.DEVELOPMENT);
            expect(mockTx.agent.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Support Agent',
                    description: 'AI support',
                    createdBy: 'user-1',
                    updatedBy: 'user-1',
                    workspace: { connect: { id: 'workspace-1' } },
                }),
            });
        });

        it('should use default description when none provided', async () => {
            mockTx.agent.create.mockImplementation(() =>
                Promise.resolve({ ...fakeAgent, description: 'Pas de description pour le moment' }),
            );

            await service.insertOne({ name: 'Agent' }, 'user-1', 'workspace-1');

            expect(mockTx.agent.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ description: 'Pas de description pour le moment' }),
            });
        });
    });

    describe('findAll', () => {
        it('should return all agents for a workspace', async () => {
            mockAgentRepository.findAll.mockImplementation(() => Promise.resolve([fakeAgent]));

            const result = await service.findAll('workspace-1');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('agent-1');
            expect(mockAgentRepository.findAll).toHaveBeenCalledWith('workspace-1');
        });

        it('should return empty array when no agents', async () => {
            mockAgentRepository.findAll.mockImplementation(() => Promise.resolve([]));

            const result = await service.findAll('workspace-1');

            expect(result).toHaveLength(0);
        });
    });

    describe('findOne', () => {
        it('should return agent when found', async () => {
            mockAgentRepository.findOne.mockImplementation(() => Promise.resolve(fakeAgent));

            const result = await service.findOne('agent-1', 'workspace-1');

            expect(result).toEqual(fakeAgent);
            expect(mockAgentRepository.findOne).toHaveBeenCalledWith('agent-1', 'workspace-1');
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.findOne.mockImplementation(() => Promise.resolve(null));

            await expect(service.findOne('unknown-id', 'workspace-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when agent belongs to different workspace', async () => {
            mockAgentRepository.findOne.mockImplementation(() => Promise.resolve(null));

            await expect(service.findOne('agent-1', 'other-workspace')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update agent', async () => {
            const updatedAgent = { ...fakeAgent, name: 'Updated Agent' };
            mockAgentRepository.update.mockImplementation(() => Promise.resolve(updatedAgent));

            const result = await service.update('agent-1', { name: 'Updated Agent' }, 'user-1');

            expect(result.name).toBe('Updated Agent');
            expect(mockAgentRepository.update).toHaveBeenCalledWith(
                'agent-1',
                expect.objectContaining({ name: 'Updated Agent', updatedBy: 'user-1' }),
            );
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.update.mockImplementation(() => Promise.reject(new Error('Not found')));

            await expect(service.update('unknown-id', { name: 'New' }, 'user-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete agent', async () => {
            mockAgentRepository.delete.mockImplementation(() => Promise.resolve(fakeAgent));

            await service.remove('agent-1');

            expect(mockAgentRepository.delete).toHaveBeenCalledWith('agent-1');
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockAgentRepository.delete.mockImplementation(() => Promise.reject(new Error('Not found')));

            await expect(service.remove('unknown-id')).rejects.toThrow(NotFoundException);
        });
    });
});
