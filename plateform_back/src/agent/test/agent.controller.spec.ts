import { AgentController } from 'src/agent/agent.controller';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockAgentService = {
    insertOne: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    update: jest.fn() as any,
    remove: jest.fn() as any,
};

const fakeUser = { id: 'user-1' } as any;

const fakeAgent = {
    id: 'agent-1',
    name: 'Support Agent',
    description: 'AI support',
};

describe('AgentController', () => {
    let controller: AgentController;

    beforeEach(() => {
        controller = new AgentController(mockAgentService as any);
        jest.clearAllMocks();
    });

    it('should delegate create to service', async () => {
        mockAgentService.insertOne.mockImplementation(() => Promise.resolve(fakeAgent));

        const dto = { name: 'Support Agent', description: 'AI support' };
        const result = await controller.create('workspace-1', fakeUser, dto);

        expect(mockAgentService.insertOne).toHaveBeenCalledWith(dto, 'user-1', 'workspace-1');
        expect(result).toEqual(fakeAgent);
    });

    it('should delegate getAll to service', async () => {
        mockAgentService.findAll.mockImplementation(() => Promise.resolve([fakeAgent]));

        const result = await controller.getAll('workspace-1');

        expect(mockAgentService.findAll).toHaveBeenCalledWith('workspace-1');
        expect(result).toHaveLength(1);
    });

    it('should delegate getOne to service', async () => {
        mockAgentService.findOne.mockImplementation(() => Promise.resolve(fakeAgent));

        const result = await controller.getOne('workspace-1', 'agent-1');

        expect(mockAgentService.findOne).toHaveBeenCalledWith('agent-1', 'workspace-1');
        expect(result).toEqual(fakeAgent);
    });

    it('should delegate update to service', async () => {
        const updated = { ...fakeAgent, name: 'Updated Agent' };
        mockAgentService.update.mockImplementation(() => Promise.resolve(updated));

        const dto = { name: 'Updated Agent' };
        const result = await controller.update('agent-1', dto, fakeUser);

        expect(mockAgentService.update).toHaveBeenCalledWith('agent-1', dto, 'user-1');
        expect(result.name).toBe('Updated Agent');
    });

    it('should delegate remove to service', async () => {
        mockAgentService.remove.mockImplementation(() => Promise.resolve(undefined));

        await controller.remove('agent-1');

        expect(mockAgentService.remove).toHaveBeenCalledWith('agent-1');
    });
});
