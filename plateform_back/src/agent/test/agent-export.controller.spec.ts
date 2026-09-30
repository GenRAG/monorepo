import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import type { Response } from 'express';
import { MessageSender } from 'generated/prisma';
import { AgentExportController } from 'src/agent/agent-export.controller';
import { PrismaService } from 'src/prisma/prisma.service';

const at = (iso: string) => new Date(iso);

describe('AgentExportController', () => {
    const findMany = jest.fn() as any;
    const prisma = { conversation: { findMany } } as unknown as PrismaService;
    const send = jest.fn();
    const setHeader = jest.fn();
    const res = { send, setHeader } as unknown as Response;

    let controller: AgentExportController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new AgentExportController(prisma);
    });

    const conversation = (messages: Array<{ sender: MessageSender; content: string }>) => ({
        id: 'conv-1',
        title: 'Congés',
        createdAt: at('2026-01-01T10:00:00Z'),
        updatedAt: at('2026-01-01T10:05:00Z'),
        messages: messages.map((m, i) => ({
            id: `msg-${i}`,
            ...m,
            createdAt: at(`2026-01-01T10:0${i}:00Z`),
        })),
    });

    describe('exportApiLogs', () => {
        it('should export one CSV row per question/answer pair', async () => {
            findMany.mockResolvedValue([
                conversation([
                    { sender: MessageSender.USER, content: 'Combien de jours ?' },
                    { sender: MessageSender.AGENT, content: 'Il dit "25"\nsur deux lignes' },
                ]),
            ]);

            await controller.exportApiLogs('agent-1', res);

            expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
            const csv = (send.mock.calls[0] as string[])[0];
            expect(csv.split('\n')).toEqual([
                '﻿conversation_id,conversation_title,timestamp,question,response',
                '"conv-1","Congés",2026-01-01T10:00:00.000Z,"Combien de jours ?","Il dit ""25"" sur deux lignes"',
            ]);
        });

        it.each(['=HYPERLINK("https://evil.example","clic")', '+1+cmd|calc', '-2+3', '@SUM(A1:A2)', '\tcmd'])(
            'should neutralize a cell starting with a formula trigger: %s',
            async (question) => {
                findMany.mockResolvedValue([conversation([{ sender: MessageSender.USER, content: question }])]);

                await controller.exportApiLogs('agent-1', res);

                const row = (send.mock.calls[0] as string[])[0].split('\n')[1];
                const questionCell = row.split(',').slice(3).join(',');
                expect(questionCell.startsWith(`"'`)).toBe(true);
            },
        );
    });
});
