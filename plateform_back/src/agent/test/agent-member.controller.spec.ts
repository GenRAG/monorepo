import { AgentMemberController } from 'src/agent/agent-member.controller';
import { AgentMemberService } from 'src/agent/agent-member.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockAgentMemberService: any = {
    getMembers: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
};

describe('AgentMemberController', () => {
    let controller: AgentMemberController;

    beforeEach(() => {
        controller = new AgentMemberController(mockAgentMemberService as AgentMemberService);
        jest.clearAllMocks();
    });

    it('should delegate getMembers to service', async () => {
        const members = [{ id: 'member-1', email: 'member@genrag.com' }];
        mockAgentMemberService.getMembers.mockImplementation(() => Promise.resolve(members));

        const result = await controller.getMembers('agent-1');

        expect(mockAgentMemberService.getMembers).toHaveBeenCalledWith('agent-1');
        expect(result).toEqual(members);
    });

    it('should delegate addMember to service', async () => {
        const created = { id: 'member-1', email: 'member@genrag.com' };
        mockAgentMemberService.addMember.mockImplementation(() => Promise.resolve(created));

        const result = await controller.addMember('agent-1', { email: 'member@genrag.com' });

        expect(mockAgentMemberService.addMember).toHaveBeenCalledWith('agent-1', 'member@genrag.com');
        expect(result).toEqual(created);
    });

    it('should delegate removeMember to service', async () => {
        mockAgentMemberService.removeMember.mockImplementation(() => Promise.resolve(undefined));

        await controller.removeMember('agent-1', 'member-1');

        expect(mockAgentMemberService.removeMember).toHaveBeenCalledWith('agent-1', 'member-1');
    });
});
