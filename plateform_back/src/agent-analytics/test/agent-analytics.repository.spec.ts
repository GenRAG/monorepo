import { jest, describe, it, expect } from '@jest/globals';
import { AgentAnalyticsRepository } from 'src/agent-analytics/agent-analytics.repository';
import { PrismaService } from 'src/prisma/prisma.service';

// Only the cost-breakdown methods are covered here: they're the one query in this repository
// that runs in JS rather than SQL (see agent-analytics.repository.ts for why), so it's the one
// place a bug in the aggregation logic itself could hide. The others are thin $queryRaw wrappers
// with no branching worth asserting against a mocked query result.
describe('AgentAnalyticsRepository — cost breakdown', () => {
    const since = new Date('2026-01-01T00:00:00Z');

    function build(rows: Array<Record<string, unknown>>) {
        const prisma = { agentQueryLog: { findMany: jest.fn<any>().mockResolvedValue(rows) } };
        return { repo: new AgentAnalyticsRepository(prisma as unknown as PrismaService), prisma };
    }

    it('sums the same key across multiple rows', async () => {
        const { repo } = build([{ costByModel: { 'gpt-4o': 0.02 } }, { costByModel: { 'gpt-4o': 0.03 } }]);

        const result = await repo.getCostByModel('agent-1', since);

        expect(result).toEqual([{ key: 'gpt-4o', cost: 0.05 }]);
    });

    it('keeps separate keys separate', async () => {
        const { repo } = build([{ costByModel: { 'gpt-4o': 0.02 } }, { costByModel: { mistral: 0.01 } }]);

        const result = await repo.getCostByModel('agent-1', since);

        expect(result).toHaveLength(2);
        expect(result).toEqual(
            expect.arrayContaining([
                { key: 'gpt-4o', cost: 0.02 },
                { key: 'mistral', cost: 0.01 },
            ]),
        );
    });

    it('ignores rows with a null breakdown', async () => {
        const { repo } = build([{ costByModel: null }, { costByModel: { 'gpt-4o': 0.02 } }]);

        const result = await repo.getCostByModel('agent-1', since);

        expect(result).toEqual([{ key: 'gpt-4o', cost: 0.02 }]);
    });

    it('returns an empty array when there are no rows', async () => {
        const { repo } = build([]);

        const result = await repo.getCostByModel('agent-1', since);

        expect(result).toEqual([]);
    });

    it('sorts by descending cost', async () => {
        const { repo } = build([{ costByModel: { small: 0.01, big: 0.5, medium: 0.1 } }]);

        const result = await repo.getCostByModel('agent-1', since);

        expect(result.map((r) => r.key)).toEqual(['big', 'medium', 'small']);
    });

    it('queries with the right agent, date range and column selection', async () => {
        const { repo, prisma } = build([]);

        await repo.getCostByType('agent-1', since);

        expect(prisma.agentQueryLog.findMany).toHaveBeenCalledWith({
            where: { agentId: 'agent-1', createdAt: { gte: since } },
            select: { costByType: true },
        });
    });
});
