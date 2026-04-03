import { Injectable } from '@nestjs/common';
import { DocumentStatus } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: { agentId: string; storageKey: string; mimeType: string }) {
        return this.prisma.document.create({
            data: { ...data, status: DocumentStatus.UPLOADED },
        });
    }

    findById(id: string) {
        return this.prisma.document.findUnique({ where: { id } });
    }

    findByAgent(agentId: string) {
        return this.prisma.document.findMany({
            where: { agentId },
            orderBy: { createdAt: 'desc' },
        });
    }

    updateStatus(
        id: string,
        status: DocumentStatus,
        extra?: { indexedAt?: Date; failedAt?: Date },
    ) {
        return this.prisma.document.update({
            where: { id },
            data: { status, ...extra },
        });
    }
}
