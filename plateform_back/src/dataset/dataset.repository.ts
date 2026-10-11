import { Injectable } from '@nestjs/common';
import { Dataset, DocumentSource, DocumentStatus, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatasetListItem } from './dataset.types';

const datasetInclude = {
    _count: { select: { documents: true, agents: true } },
    agents: {
        orderBy: { createdAt: 'asc' },
        select: { agent: { select: { id: true, name: true } } },
    },
} satisfies Prisma.DatasetInclude;

type DatasetWithRelations = Prisma.DatasetGetPayload<{
    include: typeof datasetInclude;
}>;

const emptyStatusCounts = (): Record<DocumentStatus, number> => ({
    [DocumentStatus.UPLOADED]: 0,
    [DocumentStatus.PROCESSING]: 0,
    [DocumentStatus.INDEXED]: 0,
    [DocumentStatus.FAILED]: 0,
});

@Injectable()
export class DatasetRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(workspaceId: string): Promise<DatasetListItem[]> {
        const [datasets, documentStats] = await Promise.all([
            this.prisma.dataset.findMany({
                where: { workspaceId },
                orderBy: { updatedAt: 'desc' },
                include: datasetInclude,
            }),
            this.prisma.document.groupBy({
                by: ['datasetId', 'status'],
                where: { dataset: { workspaceId } },
                _count: { _all: true },
                _sum: { size: true },
                orderBy: { datasetId: 'asc' },
            }),
        ]);

        return datasets.map((dataset) => {
            const rows = documentStats.filter((row) => row.datasetId === dataset.id);
            return this._toListItem(dataset, rows);
        });
    }

    async findOne(id: string, workspaceId: string): Promise<DatasetListItem | null> {
        const dataset = await this.prisma.dataset.findFirst({
            where: { id, workspaceId },
            include: datasetInclude,
        });
        if (!dataset) return null;

        const rows = await this.prisma.document.groupBy({
            by: ['datasetId', 'status'],
            where: { datasetId: id },
            _count: { _all: true },
            _sum: { size: true },
            orderBy: { datasetId: 'asc' },
        });

        return this._toListItem(dataset, rows);
    }

    exists(id: string, workspaceId: string): Promise<Pick<Dataset, 'id'> | null> {
        return this.prisma.dataset.findFirst({
            where: { id, workspaceId },
            select: { id: true },
        });
    }

    create(workspaceId: string, data: { name: string; description?: string }): Promise<Dataset> {
        return this.prisma.dataset.create({ data: { ...data, workspaceId } });
    }

    update(id: string, data: { name?: string; description?: string }): Promise<Dataset> {
        return this.prisma.dataset.update({ where: { id }, data });
    }

    findDocumentsForCleanup(datasetId: string) {
        return this.prisma.document.findMany({
            where: { datasetId },
            select: { name: true, storageKey: true },
        });
    }

    delete(id: string): Promise<Dataset> {
        return this.prisma.dataset.delete({ where: { id } });
    }

    countAgentsInWorkspace(agentIds: string[], workspaceId: string): Promise<number> {
        return this.prisma.agent.count({
            where: { id: { in: agentIds }, workspaceId },
        });
    }

    async addAgentToDataset(datasetId: string, agentId: string): Promise<void> {
        await this.prisma.agentDataset.upsert({
            where: { agentId_datasetId: { agentId, datasetId } },
            create: { agentId, datasetId },
            update: {},
        });
    }

    async removeAgentFromDataset(datasetId: string, agentId: string): Promise<void> {
        await this.prisma.agentDataset.deleteMany({
            where: { agentId, datasetId },
        });
    }

    async setAgents(datasetId: string, agentIds: string[]): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.agentDataset.deleteMany({
                where: { datasetId, agentId: { notIn: agentIds } },
            }),
            this.prisma.agentDataset.createMany({
                data: agentIds.map((agentId) => ({ agentId, datasetId })),
                skipDuplicates: true,
            }),
        ]);
    }

    /** Datasets attached to the agent that belong to the agent's own workspace. */
    async findDatasetIdsByAgent(agentId: string): Promise<string[]> {
        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId },
            select: { workspaceId: true },
        });
        if (!agent) return [];

        const links = await this.prisma.agentDataset.findMany({
            where: { agentId, dataset: { workspaceId: agent.workspaceId } },
            orderBy: { createdAt: 'asc' },
            select: { datasetId: true },
        });
        return links.map((link) => link.datasetId);
    }

    getWorkspaceDailyAdditions(workspaceId: string, since: Date) {
        return this.prisma.$queryRaw<{ datasetId: string; day: Date; count: number }[]>`
            SELECT d."datasetId"                            AS "datasetId",
                   DATE_TRUNC('day', d."createdAt")::date AS day,
                   COUNT(*)::int                          AS count
            FROM "Document" d
            JOIN "Dataset" ds ON ds."id" = d."datasetId"
            WHERE ds."workspaceId" = ${workspaceId} AND d."createdAt" >= ${since}
            GROUP BY d."datasetId", day
        `;
    }

    getDailyAdditions(datasetId: string, since: Date) {
        return this.prisma.$queryRaw<{ day: Date; count: number; size: number }[]>`
            SELECT DATE_TRUNC('day', "createdAt")::date AS day,
                   COUNT(*)::int                          AS count,
                   COALESCE(SUM("size"), 0)::float        AS size
            FROM "Document"
            WHERE "datasetId" = ${datasetId} AND "createdAt" >= ${since}
            GROUP BY day
            ORDER BY day ASC
        `;
    }

    async getDocumentBreakdowns(datasetId: string) {
        const [byMimeType, bySource, byStatus] = await Promise.all([
            this.prisma.document.groupBy({
                by: ['mimeType'],
                where: { datasetId },
                _count: { _all: true },
                _sum: { size: true },
            }),
            this.prisma.document.groupBy({ by: ['source'], where: { datasetId }, _count: { _all: true } }),
            this.prisma.document.groupBy({ by: ['status'], where: { datasetId }, _count: { _all: true } }),
        ]);

        const countBySource: Record<DocumentSource, number> = {
            [DocumentSource.UPLOAD]: 0,
            [DocumentSource.GOOGLE_DRIVE]: 0,
            [DocumentSource.SHAREPOINT]: 0,
            [DocumentSource.NOTION]: 0,
        };
        for (const row of bySource) countBySource[row.source] = row._count._all;

        const statusCounts = emptyStatusCounts();
        for (const row of byStatus) statusCounts[row.status] = row._count._all;

        return {
            sizeByMimeType: byMimeType.map((row) => ({
                mimeType: row.mimeType,
                count: row._count._all,
                size: row._sum.size ?? 0,
            })),
            countBySource,
            statusCounts,
        };
    }

    private _toListItem(
        dataset: DatasetWithRelations,
        rows: {
            status: DocumentStatus;
            _count: { _all: number };
            _sum: { size: number | null };
        }[],
    ): DatasetListItem {
        const { _count, agents, ...rest } = dataset;
        const statusCounts = emptyStatusCounts();
        let totalSize = 0;

        for (const row of rows) {
            statusCounts[row.status] = row._count._all;
            totalSize += row._sum.size ?? 0;
        }

        return {
            ...rest,
            documentsCount: _count.documents,
            agentsCount: _count.agents,
            totalSize,
            statusCounts,
            agents: agents.map((link) => link.agent),
        };
    }
}
