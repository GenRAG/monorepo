import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { WorkflowRepository } from 'src/workflow/workflow.repository';
import { PrismaService } from 'src/prisma/prisma.service';

describe('WorkflowRepository', () => {
    const tx = {
        workflow: {
            findFirst: jest.fn() as any,
            updateMany: jest.fn() as any,
            update: jest.fn() as any,
        },
    };
    const prisma = {
        $transaction: jest.fn((fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    } as unknown as PrismaService;

    let repository: WorkflowRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new WorkflowRepository(prisma);
    });

    describe('activate', () => {
        it('should deactivate the current workflow and activate the target one', async () => {
            const activated = { id: 'workflow-2', agentId: 'agent-1', isActive: true };
            tx.workflow.findFirst.mockResolvedValue({ id: 'workflow-2' });
            tx.workflow.update.mockResolvedValue(activated);

            const result = await repository.activate('workflow-2', 'agent-1');

            expect(tx.workflow.findFirst).toHaveBeenCalledWith({
                where: { id: 'workflow-2', agentId: 'agent-1' },
                select: { id: true },
            });
            expect(tx.workflow.updateMany).toHaveBeenCalledWith({
                where: { agentId: 'agent-1', isActive: true },
                data: { isActive: false },
            });
            expect(tx.workflow.update).toHaveBeenCalledWith({ where: { id: 'workflow-2' }, data: { isActive: true } });
            expect(result).toBe(activated);
        });

        it('should not touch any workflow when the id belongs to another agent', async () => {
            tx.workflow.findFirst.mockResolvedValue(null);

            const result = await repository.activate('workflow-of-another-tenant', 'agent-1');

            expect(result).toBeNull();
            expect(tx.workflow.updateMany).not.toHaveBeenCalled();
            expect(tx.workflow.update).not.toHaveBeenCalled();
        });
    });
});
