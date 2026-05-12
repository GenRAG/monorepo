import { Injectable } from '@nestjs/common';
import { DocumentStatus } from 'generated/*';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';

@Injectable()
export class WorkspaceStatsService {
    private readonly DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    constructor(private readonly workspaceRepository: WorkspaceRepository) {}

    async getStats(workspaceId: string) {
        const now = new Date();
        const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [agents, documents, conversations, activity, credit] = await Promise.all([
            this.workspaceRepository.getAgentStats(workspaceId),
            this.workspaceRepository.getDocumentStats(workspaceId),
            this.workspaceRepository.getConversationStats(workspaceId, since24h, since30d),
            this.workspaceRepository.getRecentActivity(workspaceId),
            this.workspaceRepository.getCreditBalance(workspaceId),
        ]);

        return {
            agents: this.formatAgents(agents),
            documents,
            conversations: {
                total: conversations.total,
                today: conversations.last24h,
            },
            credits: credit?.balance ?? 0,
            recentActivity: this.formatActivity(activity, conversations.recent),
            activityChart: this.buildCharts(conversations, now),
        };
    }

    private formatAgents(agents: Awaited<ReturnType<WorkspaceRepository['getAgentStats']>>) {
        return {
            total: agents.production + agents.development,
            production: agents.production,
            development: agents.development,
            items: agents.items.map((a) => ({
                id: a.id,
                name: a.name,
                status: a.status as string,
                conversationCount: a._count.conversations,
                documentCount: a._count.documents,
                latestVersion: a.deployments[0]?.version ?? null,
            })),
        };
    }

    private formatActivity(
        activity: Awaited<ReturnType<WorkspaceRepository['getRecentActivity']>>,
        conversations: {
            title: string;
            createdAt: Date;
            agent: { name: string };
        }[],
    ) {
        const feed = [
            ...activity.docs.map((d) => ({
                type: 'document_upload',
                title: d.name,
                subtitle: `${d.agent.name} · ${this.formatDocStatus(d.status)}`,
                createdAt: d.createdAt.toISOString(),
            })),
            ...activity.deployments.map((d) => ({
                type: 'deployment',
                title: `Promotion en production · v${d.version}`,
                subtitle: d.agent.name,
                createdAt: d.createdAt.toISOString(),
            })),
            ...conversations.map((c) => ({
                type: 'conversation',
                title: c.title,
                subtitle: c.agent.name,
                createdAt: c.createdAt.toISOString(),
            })),
        ];

        return feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    }

    private formatDocStatus(status: DocumentStatus): string {
        const map: Record<DocumentStatus, string> = {
            [DocumentStatus.INDEXED]: 'Indexé',
            [DocumentStatus.FAILED]: 'Échec',
            [DocumentStatus.PROCESSING]: 'En cours',
            [DocumentStatus.UPLOADED]: 'Uploadé',
        };
        return map[status];
    }

    private buildCharts(conversations: Awaited<ReturnType<WorkspaceRepository['getConversationStats']>>, now: Date) {
        const dayMap = new Map(
            conversations.daily.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.count)]),
        );
        const daily30 = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(now.getTime() - (29 - i) * 86400000);
            return dayMap.get(d.toISOString().slice(0, 10)) ?? 0;
        });

        const hourMap = new Map(conversations.hourly.map((r) => [new Date(r.hour).getHours(), Number(r.count)]));

        return {
            '24h': {
                labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
                values: Array.from({ length: 24 }, (_, i) => hourMap.get(i) ?? 0),
            },
            '7j': {
                labels: Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(now.getTime() - (6 - i) * 86400000);
                    return this.DAY_NAMES[d.getDay()];
                }),
                values: daily30.slice(-7),
            },
            '30j': {
                labels: Array.from({ length: 30 }, (_, i) => (i === 29 ? 'Auj.' : `J-${30 - i}`)),
                values: daily30,
            },
        };
    }
}
