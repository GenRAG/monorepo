import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { MessageSender } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('workspaces/:workspaceId/agents')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard, AgentBelongsToWorkspaceGuard)
export class AgentExportController {
    constructor(private readonly prisma: PrismaService) {}

    @Get(':id/export/conversations')
    async exportConversations(@Param('id') agentId: string, @Res() res: Response) {
        const conversations = await this.prisma.conversation.findMany({
            where: { agentId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });

        const data = conversations.map((c) => ({
            id: c.id,
            title: c.title,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
            messages: c.messages.map((m) => ({
                id: m.id,
                sender: m.sender,
                content: m.content,
                createdAt: m.createdAt.toISOString(),
            })),
        }));

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="conversations-${agentId}.json"`);
        res.send(JSON.stringify(data, null, 2));
    }

    @Get(':id/export/api-logs')
    async exportApiLogs(@Param('id') agentId: string, @Res() res: Response) {
        const conversations = await this.prisma.conversation.findMany({
            where: { agentId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });

        const escape = (s: string) => `"${s.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        const rows: string[] = ['conversation_id,conversation_title,timestamp,question,response'];

        for (const conv of conversations) {
            const msgs = conv.messages;
            for (let i = 0; i < msgs.length; i++) {
                const msg = msgs[i];
                if (msg.sender !== MessageSender.USER) continue;
                const next = msgs[i + 1];
                const agentMsg = next?.sender === MessageSender.AGENT ? next : null;
                if (agentMsg) i++;
                rows.push(
                    [
                        escape(conv.id),
                        escape(conv.title ?? ''),
                        msg.createdAt.toISOString(),
                        escape(msg.content),
                        escape(agentMsg?.content ?? ''),
                    ].join(','),
                );
            }
        }

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="api-logs-${agentId}.csv"`);
        res.send('﻿' + rows.join('\n'));
    }
}
