import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { AgentAccessGuard } from 'src/conversation/guard/agent-access.guard';
import { ConversationRepository } from 'src/conversation/conversation.repository';

function createContext(request: Record<string, unknown>): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
}

describe('AgentAccessGuard', () => {
    let guard: AgentAccessGuard;
    let conversationRepo: { hasAgentAccess: jest.Mock<any> };

    beforeEach(() => {
        conversationRepo = { hasAgentAccess: jest.fn<any>() };
        guard = new AgentAccessGuard(conversationRepo as unknown as ConversationRepository);
    });

    it('returns false when there is no authenticated user', async () => {
        const result = await guard.canActivate(createContext({ params: { agentId: 'agent-1' } }));

        expect(result).toBe(false);
        expect(conversationRepo.hasAgentAccess).not.toHaveBeenCalled();
    });

    it('returns false when the route has no agentId param', async () => {
        const result = await guard.canActivate(createContext({ user: { userId: 'user-1' }, params: {} }));

        expect(result).toBe(false);
    });

    it('throws ForbiddenException when the user has no access to the agent', async () => {
        conversationRepo.hasAgentAccess.mockResolvedValue(false);

        await expect(
            guard.canActivate(createContext({ user: { userId: 'user-1' }, params: { agentId: 'agent-1' } })),
        ).rejects.toThrow(ForbiddenException);
        expect(conversationRepo.hasAgentAccess).toHaveBeenCalledWith('user-1', 'agent-1');
    });

    it('allows the request through when the user has access', async () => {
        conversationRepo.hasAgentAccess.mockResolvedValue(true);

        const result = await guard.canActivate(
            createContext({ user: { userId: 'user-1' }, params: { agentId: 'agent-1' } }),
        );

        expect(result).toBe(true);
    });
});
