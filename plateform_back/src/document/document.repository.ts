import { Injectable } from '@nestjs/common';
import { DocumentSource, DocumentStatus, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

/** Grouped by source (enum declaration order: manual import first), newest first inside a source. */
const LIST_ORDER: Prisma.DocumentOrderByWithRelationInput[] = [{ source: 'asc' }, { createdAt: 'desc' }];

@Injectable()
export class DocumentRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: {
        datasetId: string;
        storageKey: string;
        mimeType: string;
        name: string;
        size: number;
        source: DocumentSource;
        externalId?: string;
        externalUrl?: string;
        externalModifiedAt?: Date;
    }) {
        return this.prisma.document.create({
            data: { ...data, status: DocumentStatus.UPLOADED },
        });
    }

    findById(id: string, datasetId: string) {
        return this.prisma.document.findFirst({ where: { id, datasetId } });
    }

    findByName(datasetId: string, name: string) {
        return this.prisma.document.findFirst({
            where: { datasetId, name },
            select: { id: true },
        });
    }

    findByDataset(datasetId: string, sources?: DocumentSource[]) {
        return this.prisma.document.findMany({
            where: { datasetId, source: sources?.length ? { in: sources } : undefined },
            orderBy: LIST_ORDER,
        });
    }

    async findByDatasetPaginated(datasetId: string, page: number, limit: number, sources?: DocumentSource[]) {
        const where = { datasetId, source: sources?.length ? { in: sources } : undefined };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.document.findMany({
                where,
                orderBy: LIST_ORDER,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.document.count({ where }),
        ]);
        return { data, total };
    }

    updateStatus(
        id: string,
        status: DocumentStatus,
        extra?: {
            indexedAt?: Date;
            failedAt?: Date;
            indexError?: string;
            retryCount?: number;
        },
    ) {
        return this.prisma.document.update({
            where: { id },
            data: { status, ...extra },
        });
    }

    async getStats(datasetId: string) {
        const [documents, statusCounts, sourceCounts] = await this.prisma.$transaction([
            this.prisma.document.findMany({
                where: { datasetId },
                select: { status: true, mimeType: true, size: true },
            }),
            this.prisma.document.groupBy({
                by: ['status'],
                where: { datasetId },
                _count: true,
                orderBy: { status: 'asc' },
            }),
            this.prisma.document.groupBy({
                by: ['source'],
                where: { datasetId },
                _count: true,
                orderBy: { source: 'asc' },
            }),
        ]);

        const countByStatus = Object.fromEntries(statusCounts.map((r) => [r.status, r._count as number]));

        const sizeByMimeType = documents.reduce<Record<string, number>>((acc, { mimeType, size }) => {
            acc[mimeType] = (acc[mimeType] ?? 0) + size;
            return acc;
        }, {});

        return {
            total: statusCounts.reduce((acc, r) => acc + (r._count as number), 0),
            indexed: countByStatus[DocumentStatus.INDEXED] ?? 0,
            processing: countByStatus[DocumentStatus.PROCESSING] ?? 0,
            sizeByMimeType,
            countBySource: Object.fromEntries(sourceCounts.map((r) => [r.source, r._count as number])),
        };
    }

    async getTotalSize(datasetId: string): Promise<number> {
        const result = await this.prisma.document.aggregate({
            where: { datasetId },
            _sum: { size: true },
        });
        return result._sum.size ?? 0;
    }

    resetForRetry(id: string) {
        return this.prisma.document.update({
            where: { id },
            data: {
                status: DocumentStatus.UPLOADED,
                failedAt: null,
                indexError: null,
            },
        });
    }

    async touchDataset(datasetId: string): Promise<void> {
        await this.prisma.dataset.update({
            where: { id: datasetId },
            data: { updatedAt: new Date() },
        });
    }

    delete(id: string) {
        return this.prisma.document.delete({ where: { id } });
    }
}
