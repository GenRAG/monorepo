import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspaceRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string) {
        return this.prisma.workspace.findUnique({
            where: { id },
            include: { users: true },
        });
    }

    async findAll(userId: string) {
        return this.prisma.workspace.findMany({
            where: {
                users: { some: { userId } },
            },
        });
    }

    async create(data: { name: string; description?: string; userId: string }) {
        const { name, description, userId } = data;

        return this.prisma.workspace.create({
            data: {
                name,
                description,
                users: {
                    create: {
                        userId,
                        role: 'ADMIN',
                    },
                },
            },
            include: { users: true },
        });
    }

    async delete(id: string) {
        return this.prisma.workspace.delete({
            where: { id },
        });
    }
}
