import {
    applyDecorators,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    SetMetadata,
    UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getPlanConfig } from 'src/plans/plans.config';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';

export type LimitedResource = 'agents' | 'datasets';

const PLAN_LIMIT_KEY = 'planLimit';
/**
 * Refuses the route once the workspace of the path holds as many `resource` as its plan allows. Puts the guard on
 * the route itself, so the limit cannot be declared without being enforced.
 */
export const PlanLimit = (resource: LimitedResource) =>
    applyDecorators(SetMetadata(PLAN_LIMIT_KEY, resource), UseGuards(PlanLimitGuard));

const MESSAGES: Record<LimitedResource, (max: number, plan: string) => string> = {
    agents: (max, plan) =>
        max === 0
            ? 'Abonnez-vous pour créer des agents.'
            : `Votre offre ${plan} permet ${max} agent${max > 1 ? 's' : ''}. Passez à l'abonnement pour en créer d'autres.`,
    datasets: (max, plan) =>
        max === 0
            ? 'Abonnez-vous pour créer des bases de connaissances.'
            : `Votre offre ${plan} permet ${max} base${max > 1 ? 's' : ''}. Passez à l'abonnement pour en créer d'autres.`,
};

/**
 * shortcut: count then create without a lock, so two requests at the same instant can both pass and exceed the
 * limit by one. Lock the workspace row in the create transaction if that ever matters.
 */
@Injectable()
export class PlanLimitGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly workspaceRepository: WorkspaceRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const resource = this.reflector.get<LimitedResource | undefined>(PLAN_LIMIT_KEY, context.getHandler());
        if (!resource) return true;

        const workspaceId = context.switchToHttp().getRequest().params?.workspaceId;
        const usage = workspaceId ? await this.workspaceRepository.findPlanUsage(workspaceId) : null;
        if (!usage) return false;

        const plan = getPlanConfig(usage.plan);
        const max = resource === 'agents' ? plan.maxAgents : plan.maxDatasets;
        if (usage[resource] < max) return true;
        throw new ForbiddenException(MESSAGES[resource](max, plan.displayName));
    }
}
