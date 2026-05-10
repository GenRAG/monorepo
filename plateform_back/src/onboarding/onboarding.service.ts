import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { OnboardingSession, Prisma } from 'generated/prisma';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { OnboardingRepository } from './onboarding.repository';
import { OnboardingSessionResponse } from './dto/onboarding-session.response';
import { CompareOnboardingResponse } from './dto/compare-onboarding.request';
import { InstructionStyle } from './dto/complete-onboarding.request';
import { CreditBalanceService } from 'src/credit/credit-balance.service';

const ONBOARDING_INITIAL_CREDITS = 20;

const DEMO_WORKFLOW_DEFINITION = {
    blocks: [
        { name: 'query', type: 'query' },
        {
            name: 'retrieve',
            type: 'retrieve',
            collection_name: 'genrag_knowledge_base',
            top_k: 5,
        },
        {
            name: 'answer',
            type: 'answer',
            model: 'google/gemini-2.5-flash',
            instruction: '',
        },
    ],
};

const STYLE_TO_INSTRUCTION: Record<InstructionStyle, string> = {
    standard:
        'Répondre de façon concise et directe en se basant exclusivement sur les documents fournis.',
    precise:
        "Répondre en apportant des références précises aux documents. Citez les numéros d'articles, les titres des sections et les chiffres exacts lorsque disponibles.",
    creative:
        'Répondre sur un ton convivial et conversationnel. Expliquer les concepts clairement et rendre la réponse engageante, tout en restant fondée sur les documents.',
};

@Injectable()
export class OnboardingService {
    constructor(
        private readonly onboardingRepository: OnboardingRepository,
        private readonly agentService: AgentService,
        private readonly workflowService: WorkflowService,
        private readonly orchestrator: AgentRuntimeOrchestrator,
        private readonly creditBalanceService: CreditBalanceService,
    ) {}

    async start(
        userId: string,
        workspaceId: string,
    ): Promise<OnboardingSessionResponse> {
        const existing = await this.onboardingRepository.findByUserAndWorkspace(
            userId,
            workspaceId,
        );

        if (existing) {
            return this.toResponse(existing);
        }

        const agent = await this.agentService.insertOne(
            {
                name: 'Demo Assistant',
                description:
                    "Agent de démonstration créé lors de l'onboarding.",
                workflow: { definition: DEMO_WORKFLOW_DEFINITION },
            },
            userId,
            workspaceId,
        );

        const session = await this.onboardingRepository.create({
            user: { connect: { id: userId } },
            workspace: { connect: { id: workspaceId } },
            agent: { connect: { id: agent.id } },
        });

        try {
            await this.creditBalanceService.grantInitial({
                workspaceId,
                amount: ONBOARDING_INITIAL_CREDITS,
            });
        } catch (err) {
            console.error(
                `[Onboarding] Failed to grant initial credits for workspace ${workspaceId}:`,
                err,
            );
        }

        return this.toResponse(session);
    }

    async getSession(
        userId: string,
        workspaceId: string,
    ): Promise<OnboardingSessionResponse | null> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(
            userId,
            workspaceId,
        );

        if (!session) return null;

        return this.toResponse(session);
    }

    async updateStep(
        userId: string,
        workspaceId: string,
        step: number,
    ): Promise<OnboardingSessionResponse> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(
            userId,
            workspaceId,
        );

        if (!session) {
            throw new NotFoundException('Onboarding session not found');
        }

        if (step > session.step + 1) {
            throw new BadRequestException(
                `Cannot skip to step ${step} from step ${session.step}`,
            );
        }

        const updated = await this.onboardingRepository.update(session.id, {
            step,
        });

        return this.toResponse(updated);
    }

    async updateStepsData(
        userId: string,
        workspaceId: string,
        stepId: string,
        data: Record<string, unknown>,
    ): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(
            userId,
            workspaceId,
        );

        if (!session) {
            throw new NotFoundException('Onboarding session not found');
        }

        const current =
            (session.stepsData as Record<string, Record<string, unknown>>) ??
            {};

        const updated = {
            ...current,
            [stepId]: { ...(current[stepId] ?? {}), ...data },
        };

        await this.onboardingRepository.update(session.id, {
            stepsData: updated as Prisma.InputJsonValue,
        });
    }

    async compare(
        userId: string,
        workspaceId: string,
        query: string,
    ): Promise<CompareOnboardingResponse> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(
            userId,
            workspaceId,
        );

        if (!session) {
            throw new NotFoundException('Onboarding session not found');
        }

        const [standard, precise, creative] = await Promise.all([
            this.orchestrator.execute({
                query,
                agentId: session.agentId,
                workspaceId,
                instructionOverride: STYLE_TO_INSTRUCTION.standard,
                skipUsageTracking: true,
            }),
            this.orchestrator.execute({
                query,
                agentId: session.agentId,
                workspaceId,
                instructionOverride: STYLE_TO_INSTRUCTION.precise,
                skipUsageTracking: true,
            }),
            this.orchestrator.execute({
                query,
                agentId: session.agentId,
                workspaceId,
                instructionOverride: STYLE_TO_INSTRUCTION.creative,
                skipUsageTracking: true,
            }),
        ]);

        return {
            standard: standard.answer,
            precise: precise.answer,
            creative: creative.answer,
        };
    }

    async complete(
        userId: string,
        workspaceId: string,
        style: InstructionStyle,
    ): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(
            userId,
            workspaceId,
        );

        if (!session) {
            throw new NotFoundException('Onboarding session not found');
        }

        const instruction = STYLE_TO_INSTRUCTION[style];

        const workflow = await this.workflowService.findActive(session.agentId);

        const definition = workflow.definition as {
            blocks: Record<string, unknown>[];
            nodes?: unknown[];
            edges?: unknown[];
        };

        const answerBlock = definition.blocks?.find(
            (b) => b['type'] === 'answer',
        );

        if (answerBlock) {
            answerBlock['instruction'] = instruction;
        }

        await this.workflowService.update(session.agentId, {
            definition: definition as Record<string, unknown>,
        });

        await this.onboardingRepository.update(session.id, {
            instruction,
            completed: true,
        });
    }

    private toResponse(session: OnboardingSession): OnboardingSessionResponse {
        return {
            sessionId: session.id,
            agentId: session.agentId,
            step: session.step,
            completed: session.completed,
            instruction: session.instruction,
            stepsData:
                (session.stepsData as Record<
                    string,
                    Record<string, unknown>
                >) ?? {},
        };
    }
}
