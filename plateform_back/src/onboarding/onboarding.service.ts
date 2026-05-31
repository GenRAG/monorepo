import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnboardingSession, Prisma } from 'generated/prisma';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import type { PipelineBlock } from 'src/rag-engine/pipeline.schema';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { OnboardingRepository } from './onboarding.repository';
import { OnboardingSessionResponse } from './dto/onboarding-session.response';
import { CompareOnboardingResponse } from './dto/compare-onboarding.request';
import { InstructionStyle } from './dto/complete-onboarding.request';
import { DEMO_WORKFLOW_DEFINITION } from './demo-workflow.definition';

const ONBOARDING_INITIAL_CREDITS = 20;

const STYLE_TO_INSTRUCTION: Record<InstructionStyle, string> = {
    standard: 'Répondre de façon concise et directe en se basant exclusivement sur les documents fournis.',
    precise:
        "Répondre en apportant des références précises aux documents. Citez les numéros d'articles, les titres des sections et les chiffres exacts lorsque disponibles.",
    creative:
        'Répondre sur un ton convivial et conversationnel. Expliquer les concepts clairement et rendre la réponse engageante, tout en restant fondée sur les documents.',
};

@Injectable()
export class OnboardingService {
    private static readonly QUERY_LIMITS: Record<string, number> = {
        'test-assistant': 5,
        'improve-assistant': 5,
        'compare-intelligence': 2,
    };

    private readonly logger = new Logger(OnboardingService.name);

    constructor(
        private readonly onboardingRepository: OnboardingRepository,
        private readonly agentService: AgentService,
        private readonly workflowService: WorkflowService,
        private readonly orchestrator: AgentRuntimeOrchestrator,
        private readonly creditBalanceService: CreditBalanceService,
    ) {}

    async start(userId: string, workspaceId: string): Promise<OnboardingSessionResponse> {
        const existing = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (existing) {
            return this.toResponse(existing);
        }

        const agent = await this.agentService.insertOne(
            {
                name: 'Demo Assistant',
                description: "Agent de démonstration créé lors de l'onboarding.",
                workflow: { definition: DEMO_WORKFLOW_DEFINITION },
            },
            userId,
            workspaceId,
        );

        let session: OnboardingSession;
        try {
            session = await this.onboardingRepository.create({
                user: { connect: { id: userId } },
                workspace: { connect: { id: workspaceId } },
                agent: { connect: { id: agent.id } },
            });
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                await this.agentService.remove(agent.id);
                const winner = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);
                return this.toResponse(winner!);
            }
            throw err;
        }

        try {
            await this.creditBalanceService.grantInitial({ workspaceId, amount: ONBOARDING_INITIAL_CREDITS });
        } catch (err) {
            this.logger.error(`Failed to grant initial credits for workspace ${workspaceId}`, err);
        }

        return this.toResponse(session);
    }

    async getSession(userId: string, workspaceId: string): Promise<OnboardingSessionResponse | null> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);
        if (!session) return null;
        return this.toResponse(session);
    }

    async updateStep(userId: string, workspaceId: string, step: number): Promise<OnboardingSessionResponse> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (!session) throw new NotFoundException('Onboarding session not found');

        if (step > session.step + 1) {
            throw new ForbiddenException(`Cannot skip to step ${step} from step ${session.step}`);
        }

        const updated = await this.onboardingRepository.update(session.id, { step });
        return this.toResponse(updated);
    }

    async updateStepsData(
        userId: string,
        workspaceId: string,
        stepId: string,
        data: Record<string, unknown>,
    ): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (!session) throw new NotFoundException('Onboarding session not found');

        const current = (session.stepsData as Record<string, Record<string, unknown>>) ?? {};

        await this.onboardingRepository.update(session.id, {
            stepsData: {
                ...current,
                [stepId]: { ...(current[stepId] ?? {}), ...data },
            } as Prisma.InputJsonValue,
        });
    }

    async compare(userId: string, workspaceId: string, query: string): Promise<CompareOnboardingResponse> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (!session) throw new NotFoundException('Onboarding session not found');

        await this._checkAndIncrementStepQueryCount(session, 'compare-intelligence');

        const results = await Promise.allSettled([
            this.orchestrator.executeQuery({
                query,
                agentId: session.agentId,
                workspaceId,
                instructionOverride: STYLE_TO_INSTRUCTION.standard,
                skipUsageTracking: true,
            }),
            this.orchestrator.executeQuery({
                query,
                agentId: session.agentId,
                workspaceId,
                instructionOverride: STYLE_TO_INSTRUCTION.precise,
                skipUsageTracking: true,
            }),
            this.orchestrator.executeQuery({
                query,
                agentId: session.agentId,
                workspaceId,
                instructionOverride: STYLE_TO_INSTRUCTION.creative,
                skipUsageTracking: true,
            }),
        ]);

        const [standard, precise, creative] = results.map((r) => (r.status === 'fulfilled' ? r.value.answer : ''));

        return { standard, precise, creative };
    }

    async skip(userId: string, workspaceId: string): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);
        if (!session) throw new NotFoundException('Onboarding session not found');

        const instruction = STYLE_TO_INSTRUCTION.standard;
        await this.onboardingRepository.update(session.id, { instruction, completed: true });
    }

    async complete(userId: string, workspaceId: string, style: InstructionStyle): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (!session) throw new NotFoundException('Onboarding session not found');

        const instruction = STYLE_TO_INSTRUCTION[style];
        const workflow = await this.workflowService.findActive(session.agentId);

        if (!workflow) throw new NotFoundException('No active workflow found for this agent');

        const definition = workflow.definition as {
            blocks: PipelineBlock[];
            nodes?: unknown[];
            edges?: unknown[];
        };

        const updatedBlocks =
            definition.blocks?.map((b) => (b.type === 'answer' ? { ...b, system_prompt: instruction } : b)) ?? [];

        await this.workflowService.update(session.agentId, {
            definition: { ...definition, blocks: updatedBlocks } as Record<string, unknown>,
        });

        await this.onboardingRepository.update(session.id, { instruction, completed: true });
    }

    resolveStreamParams(agentId: string, stepId?: string): { resolvedStepId: string; orgId: string } {
        const resolvedStepId = stepId || 'test-assistant';
        const orgId = resolvedStepId === 'test-assistant' ? 'onboarding' : agentId;
        return { resolvedStepId, orgId };
    }

    async checkAndIncrementQueryCount(userId: string, workspaceId: string, stepId: string): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);
        if (!session) throw new NotFoundException('Onboarding session not found');
        await this._checkAndIncrementStepQueryCount(session, stepId);
    }

    private async _checkAndIncrementStepQueryCount(session: OnboardingSession, stepId: string): Promise<void> {
        const max = OnboardingService.QUERY_LIMITS[stepId];
        if (!max) return;

        const ok = await this.onboardingRepository.tryIncrementQueryCount(session.id, stepId, max);
        if (!ok) {
            throw new ForbiddenException(`Limite de ${max} messages atteinte pour cette étape.`);
        }
    }

    private toResponse(session: OnboardingSession): OnboardingSessionResponse {
        return {
            sessionId: session.id,
            agentId: session.agentId,
            step: session.step,
            completed: session.completed,
            instruction: session.instruction,
            stepsData: (session.stepsData as Record<string, Record<string, unknown>>) ?? {},
        };
    }
}
