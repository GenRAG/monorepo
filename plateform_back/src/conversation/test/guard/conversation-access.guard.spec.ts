import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { ConversationAccessGuard } from 'src/conversation/guard/conversation-access.guard';
import { ConversationRepository } from 'src/conversation/conversation.repository';

function createContext(request: Record<string, unknown>): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
}

const fakeConversation = { id: 'conv-1', userId: 'user-1', agent: { id: 'agent-1' } };

describe('ConversationAccessGuard', () => {
    let guard: ConversationAccessGuard;
    let conversationRepo: { findOne: jest.Mock<any>; hasAgentAccess: jest.Mock<any> };

    beforeEach(() => {
        conversationRepo = { findOne: jest.fn<any>(), hasAgentAccess: jest.fn<any>() };
        guard = new ConversationAccessGuard(conversationRepo as unknown as ConversationRepository);
    });

    it('returns false when there is no authenticated user', async () => {
        const result = await guard.canActivate(createContext({ params: { conversationId: 'conv-1' } }));

        expect(result).toBe(false);
        expect(conversationRepo.findOne).not.toHaveBeenCalled();
    });

    it('returns false when the route has no conversationId param', async () => {
        const result = await guard.canActivate(createContext({ user: { userId: 'user-1' }, params: {} }));

        expect(result).toBe(false);
    });

    it('throws NotFoundException when the conversation does not exist', async () => {
        conversationRepo.findOne.mockResolvedValue(null);

        await expect(
            guard.canActivate(createContext({ user: { userId: 'user-1' }, params: { conversationId: 'conv-1' } })),
        ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException (not Forbidden) when the conversation belongs to a different user', async () => {
        conversationRepo.findOne.mockResolvedValue({ ...fakeConversation, userId: 'someone-else' });

        await expect(
            guard.canActivate(createContext({ user: { userId: 'user-1' }, params: { conversationId: 'conv-1' } })),
        ).rejects.toThrow(NotFoundException);
        expect(conversationRepo.hasAgentAccess).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the owner no longer has access to the agent', async () => {
        conversationRepo.findOne.mockResolvedValue(fakeConversation);
        conversationRepo.hasAgentAccess.mockResolvedValue(false);

        await expect(
            guard.canActivate(createContext({ user: { userId: 'user-1' }, params: { conversationId: 'conv-1' } })),
        ).rejects.toThrow(ForbiddenException);
        expect(conversationRepo.hasAgentAccess).toHaveBeenCalledWith('user-1', 'agent-1');
    });

    it('allows the request through for the conversation owner with agent access', async () => {
        conversationRepo.findOne.mockResolvedValue(fakeConversation);
        conversationRepo.hasAgentAccess.mockResolvedValue(true);

        const result = await guard.canActivate(
            createContext({ user: { userId: 'user-1' }, params: { conversationId: 'conv-1' } }),
        );

        expect(result).toBe(true);
    });
});
