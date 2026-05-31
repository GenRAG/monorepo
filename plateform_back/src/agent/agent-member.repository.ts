import { Injectable } from '@nestjs/common';
import { AgentMember, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

export type AgentMemberWithUser = Prisma.AgentMemberGetPayload<{
    include: { user: { select: { id: true; email: true; name: true } } };
}>;

@Injectable()
export class AgentMemberRepository {
    constructor(private readonly prisma: PrismaService) {}

    findUserByEmail(email: string): Promise<{ id: string } | null> {
        return this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    }

    findMembership(agentId: string, userId: string): Promise<AgentMember | null> {
        return this.prisma.agentMember.findUnique({
            where: { agentId_userId: { agentId, userId } },
        });
    }

    create(agentId: string, userId: string): Promise<AgentMemberWithUser> {
        return this.prisma.agentMember.create({
            data: { agentId, userId },
            include: { user: { select: { id: true, email: true, name: true } } },
        });
    }

    findAll(agentId: string): Promise<AgentMemberWithUser[]> {
        return this.prisma.agentMember.findMany({
            where: { agentId },
            include: { user: { select: { id: true, email: true, name: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }

    async delete(memberId: string, agentId: string): Promise<boolean> {
        const result = await this.prisma.agentMember.deleteMany({ where: { id: memberId, agentId } });
        return result.count > 0;
    }
}
