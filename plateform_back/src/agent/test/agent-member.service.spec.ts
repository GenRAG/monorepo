import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentMemberService } from 'src/agent/agent-member.service';
import { AgentMemberRepository } from 'src/agent/agent-member.repository';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockAgentMemberRepository: any = {
    findUserByEmail: jest.fn(),
    findMembership: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
};

const memberEntity = {
    id: 'member-1',
    userId: 'user-1',
    createdAt: new Date(),
    user: {
        id: 'user-1',
        email: 'member@genrag.com',
        name: 'Member One',
    },
};

describe('AgentMemberService', () => {
    let service: AgentMemberService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AgentMemberService, { provide: AgentMemberRepository, useValue: mockAgentMemberRepository }],
        }).compile();

        service = module.get<AgentMemberService>(AgentMemberService);
        jest.clearAllMocks();
    });

    describe('addMember', () => {
        it('should throw NotFoundException when user does not exist', async () => {
            mockAgentMemberRepository.findUserByEmail.mockImplementation(() => Promise.resolve(null));

            await expect(service.addMember('agent-1', 'unknown@genrag.com')).rejects.toThrow(NotFoundException);
            expect(mockAgentMemberRepository.findMembership).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when membership already exists', async () => {
            mockAgentMemberRepository.findUserByEmail.mockImplementation(() => Promise.resolve({ id: 'user-1' }));
            mockAgentMemberRepository.findMembership.mockImplementation(() => Promise.resolve({ id: 'existing' }));

            await expect(service.addMember('agent-1', 'member@genrag.com')).rejects.toThrow(ConflictException);
            expect(mockAgentMemberRepository.create).not.toHaveBeenCalled();
        });

        it('should create and map member data on success', async () => {
            mockAgentMemberRepository.findUserByEmail.mockImplementation(() => Promise.resolve({ id: 'user-1' }));
            mockAgentMemberRepository.findMembership.mockImplementation(() => Promise.resolve(null));
            mockAgentMemberRepository.create.mockImplementation(() => Promise.resolve(memberEntity));

            const result = await service.addMember('agent-1', 'member@genrag.com');

            expect(mockAgentMemberRepository.create).toHaveBeenCalledWith('agent-1', 'user-1');
            expect(result).toEqual({
                id: memberEntity.id,
                userId: memberEntity.userId,
                email: memberEntity.user.email,
                name: memberEntity.user.name,
                createdAt: memberEntity.createdAt,
            });
        });
    });

    describe('getMembers', () => {
        it('should map all members from repository format', async () => {
            mockAgentMemberRepository.findAll.mockImplementation(() => Promise.resolve([memberEntity]));

            const result = await service.getMembers('agent-1');

            expect(mockAgentMemberRepository.findAll).toHaveBeenCalledWith('agent-1');
            expect(result).toEqual([
                {
                    id: memberEntity.id,
                    userId: memberEntity.userId,
                    email: memberEntity.user.email,
                    name: memberEntity.user.name,
                    createdAt: memberEntity.createdAt,
                },
            ]);
        });
    });

    describe('removeMember', () => {
        it('should throw NotFoundException when delete returns false', async () => {
            mockAgentMemberRepository.delete.mockImplementation(() => Promise.resolve(false));

            await expect(service.removeMember('agent-1', 'missing-member')).rejects.toThrow(NotFoundException);
        });

        it('should resolve when delete returns true', async () => {
            mockAgentMemberRepository.delete.mockImplementation(() => Promise.resolve(true));

            await expect(service.removeMember('agent-1', 'member-1')).resolves.toBeUndefined();
            expect(mockAgentMemberRepository.delete).toHaveBeenCalledWith('member-1', 'agent-1');
        });
    });
});
