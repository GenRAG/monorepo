import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { describe, it, expect, jest } from '@jest/globals';
import { PlanTier } from 'generated/prisma';
import { PlanLimit, PlanLimitGuard } from 'src/workspace/guards/plan-limit.guard';

class Routes {
    @PlanLimit('agents')
    createAgent(this: void) {}

    @PlanLimit('datasets')
    createDataset(this: void) {}

    unlimited(this: void) {}
}

const contextWith = (handler: () => void, params: Record<string, string>) =>
    ({
        getHandler: () => handler,
        switchToHttp: () => ({ getRequest: () => ({ params }) }),
    }) as unknown as ExecutionContext;

type Usage = { plan: PlanTier; agents: number; datasets: number };

describe('PlanLimitGuard', () => {
    const findPlanUsage = jest.fn<(id: string) => Promise<Usage | null>>();
    const guard = new PlanLimitGuard(new Reflector(), { findPlanUsage } as never);
    const { createAgent, createDataset, unlimited } = Routes.prototype;

    it('@PlanLimit alone puts the guard on the route', () => {
        expect(Reflect.getMetadata(GUARDS_METADATA, createAgent)).toEqual([PlanLimitGuard]);
        expect(Reflect.getMetadata(GUARDS_METADATA, createDataset)).toEqual([PlanLimitGuard]);
    });

    it('lets a route without a limit through', async () => {
        await expect(guard.canActivate(contextWith(unlimited, { workspaceId: 'w1' }))).resolves.toBe(true);
        expect(findPlanUsage).not.toHaveBeenCalled();
    });

    it('lets a workspace under its limit create', async () => {
        findPlanUsage.mockResolvedValue({ plan: PlanTier.FREE, agents: 0, datasets: 1 });

        await expect(guard.canActivate(contextWith(createAgent, { workspaceId: 'w1' }))).resolves.toBe(true);
        await expect(guard.canActivate(contextWith(createDataset, { workspaceId: 'w1' }))).resolves.toBe(true);
        expect(findPlanUsage).toHaveBeenCalledWith('w1');
    });

    it("refuses at the limit with the plan's message", async () => {
        findPlanUsage.mockResolvedValue({ plan: PlanTier.FREE, agents: 1, datasets: 2 });

        await expect(guard.canActivate(contextWith(createAgent, { workspaceId: 'w1' }))).rejects.toThrow(
            new ForbiddenException(
                "Votre offre Découverte permet 1 agent. Passez à l'abonnement pour en créer d'autres.",
            ),
        );
        await expect(guard.canActivate(contextWith(createDataset, { workspaceId: 'w1' }))).rejects.toThrow(
            new ForbiddenException(
                "Votre offre Découverte permet 2 bases. Passez à l'abonnement pour en créer d'autres.",
            ),
        );
    });

    it('asks a workspace with no plan to subscribe', async () => {
        findPlanUsage.mockResolvedValue({ plan: PlanTier.NONE, agents: 0, datasets: 0 });

        await expect(guard.canActivate(contextWith(createDataset, { workspaceId: 'w1' }))).rejects.toThrow(
            new ForbiddenException('Abonnez-vous pour créer des bases de connaissances.'),
        );
    });

    it('refuses when the workspace is missing from the path or unknown', async () => {
        findPlanUsage.mockResolvedValue(null);

        await expect(guard.canActivate(contextWith(createAgent, {}))).resolves.toBe(false);
        await expect(guard.canActivate(contextWith(createAgent, { workspaceId: 'gone' }))).resolves.toBe(false);
    });
});
