import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentMemberRepository } from './agent-member.repository';

@Injectable()
export class AgentMemberService {
    private readonly isProduction: boolean;

    constructor(
        private readonly agentMemberRepository: AgentMemberRepository,
        configService: ConfigService,
    ) {
        this.isProduction = configService.get('NODE_ENV') === 'production';
    }

    async addMember(agentId: string, email: string) {
        const user = await this.agentMemberRepository.findUserByEmail(email);
        // An unverified account may hold an address its creator does not own: it must not receive the invitation.
        if (!user || (this.isProduction && !user.isEmailVerified)) {
            throw new NotFoundException(
                `Aucun compte GenRAG n'existe avec l'email ${email}. Cette personne doit d'abord créer un compte avant de pouvoir être ajoutée.`,
            );
        }

        const existing = await this.agentMemberRepository.findMembership(agentId, user.id);
        if (existing) throw new ConflictException(`${email} a déjà accès à cet assistant`);

        const member = await this.agentMemberRepository.create(agentId, user.id);

        return {
            id: member.id,
            userId: member.userId,
            email: member.user.email,
            name: member.user.name,
            createdAt: member.createdAt,
        };
    }

    async getMembers(agentId: string) {
        const members = await this.agentMemberRepository.findAll(agentId);

        return members.map((m) => ({
            id: m.id,
            userId: m.userId,
            email: m.user.email,
            name: m.user.name,
            createdAt: m.createdAt,
        }));
    }

    async removeMember(agentId: string, memberId: string): Promise<void> {
        const deleted = await this.agentMemberRepository.delete(memberId, agentId);
        if (!deleted) throw new NotFoundException('Membre introuvable');
    }
}
