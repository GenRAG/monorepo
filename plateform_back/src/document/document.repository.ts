import { Injectable } from '@nestjs/common';
import { DocumentStatus } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: { agentId: string; storageKey: string; mimeType: string; name: string; size: number }) {
        return this.prisma.document.create({
            data: { ...data, status: DocumentStatus.UPLOADED },
        });
    }

    findById(id: string, agentId: string) {
        return this.prisma.document.findFirst({ where: { id, agentId } });
    }

    findByAgent(agentId: string) {
        return this.prisma.document.findMany({
            where: { agentId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByAgentPaginated(agentId: string, page: number, limit: number) {
        const [data, total] = await this.prisma.$transaction([
            this.prisma.document.findMany({
                where: { agentId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.document.count({ where: { agentId } }),
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

    async getStats(agentId: string) {
        const [documents, statusCounts] = await this.prisma.$transaction([
            this.prisma.document.findMany({
                where: { agentId },
                select: { status: true, mimeType: true, size: true },
            }),
            this.prisma.document.groupBy({
                by: ['status'],
                where: { agentId },
                _count: true,
                orderBy: { status: 'asc' },
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
        };
    }

    async getTotalSize(agentId: string): Promise<number> {
        const result = await this.prisma.document.aggregate({
            where: { agentId },
            _sum: { size: true },
        });
        return result._sum.size ?? 0;
    }

    delete(id: string) {
        return this.prisma.document.delete({ where: { id } });
    }
}
