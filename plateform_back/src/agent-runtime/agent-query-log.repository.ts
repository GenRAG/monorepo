import { Injectable } from '@nestjs/common';
import { QueryLogStatus } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

export interface QueryLogEntry {
    id: string;
    query: string;
    durationMs: number;
    status: QueryLogStatus;
    creditsUsed: number;
    createdAt: Date;
}

export interface QueryLogPage {
    data: QueryLogEntry[];
    total: number;
}

export interface AgentCreditConsumption {
    agentId: string;
    agentName: string;
    creditsUsed: number;
    queryCount: number;
}

@Injectable()
export class AgentQueryLogRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByAgent(agentId: string, page: number, limit: number): Promise<QueryLogPage> {
        const [data, total] = await this.prisma.$transaction([
            this.prisma.agentQueryLog.findMany({
                where: { agentId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: { id: true, query: true, durationMs: true, status: true, creditsUsed: true, createdAt: true },
            }),
            this.prisma.agentQueryLog.count({ where: { agentId } }),
        ]);

        return { data, total };
    }

    async getConsumptionByAgent(agentId: string): Promise<{ creditsUsed: number; queryCount: number }> {
        const result = await this.prisma.agentQueryLog.aggregate({
            where: { agentId, status: QueryLogStatus.SUCCESS },
            _sum: { creditsUsed: true },
            _count: { id: true },
        });

        return {
            creditsUsed: result._sum.creditsUsed ?? 0,
            queryCount: result._count.id,
        };
    }

    async getConsumptionByWorkspace(workspaceId: string): Promise<AgentCreditConsumption[]> {
        const rows = await this.prisma.agentQueryLog.groupBy({
            by: ['agentId'],
            where: {
                status: QueryLogStatus.SUCCESS,
                agent: { workspaceId },
            },
            _sum: { creditsUsed: true },
            _count: { id: true },
        });

        if (rows.length === 0) return [];

        const agents = await this.prisma.agent.findMany({
            where: { id: { in: rows.map((r) => r.agentId) } },
            select: { id: true, name: true },
        });

        const nameMap = new Map(agents.map((a) => [a.id, a.name]));

        return rows.map((r) => ({
            agentId: r.agentId,
            agentName: nameMap.get(r.agentId) ?? r.agentId,
            creditsUsed: r._sum.creditsUsed ?? 0,
            queryCount: r._count.id,
        }));
    }
}
