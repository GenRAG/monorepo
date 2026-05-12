import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
    nodes: [
        {
            id: 'demo-query',
            type: 'GenNode',
            dragHandle: '.drag-handle',
            data: { type: 'QUERY', inputs: {}, outputs: [] },
            position: { x: 100, y: 80 },
            deletable: false,
        },
        {
            id: 'demo-retriever',
            type: 'GenNode',
            dragHandle: '.drag-handle',
            data: { type: 'RETRIEVER', inputs: {}, outputs: [] },
            position: { x: 100, y: 220 },
            deletable: false,
        },
        {
            id: 'demo-response',
            type: 'GenNode',
            dragHandle: '.drag-handle',
            data: { type: 'RESPONSE', inputs: {}, outputs: [] },
            position: { x: 100, y: 360 },
            deletable: false,
        },
        {
            id: 'demo-response-model',
            type: 'GenNode',
            dragHandle: '.drag-handle',
            data: {
                type: 'MODEL',
                inputs: {},
                outputs: [],
                isPlaceholder: false,
                firstTime: false,
                isEditing: false,
                configItems: [], //appelle API pour récupérer les modèles disponibles
                settingLabel: 'Large Language Model',
                inputType: 'SELECT',
                parentNodeId: 'demo-response',
                modelName: 'google/gemini-2.5-flash',
                stringValue: 'google/gemini-2.5-flash',
            },
            position: { x: 380, y: 295 },
            deletable: true,
        },
        {
            id: 'demo-response-instruction',
            type: 'GenNode',
            dragHandle: '.drag-handle',
            data: {
                type: 'INSTRUCTION',
                inputs: {},
                outputs: [],
                isPlaceholder: true,
                configItems: [],
                settingLabel: 'system_prompt',
                inputType: 'STRING',
                parentNodeId: 'demo-response',
            },
            position: { x: 380, y: 425 },
            deletable: true,
        },
    ],
    edges: [
        {
            id: 'demo-query-to-demo-retriever',
            source: 'demo-query',
            target: 'demo-retriever',
            sourceHandle: 'main-source',
            targetHandle: 'main-target',
            animated: true,
            type: 'default',
        },
        {
            id: 'demo-retriever-to-demo-response',
            source: 'demo-retriever',
            target: 'demo-response',
            sourceHandle: 'main-source',
            targetHandle: 'main-target',
            animated: true,
            type: 'default',
        },
        {
            id: 'demo-response-setting-llm',
            source: 'demo-response',
            target: 'demo-response-model',
            sourceHandle: 'setting-source-Large Language Model',
            targetHandle: 'setting-target',
            type: 'settings',
            animated: false,
            data: { label: 'Large Language Model' },
        },
        {
            id: 'demo-response-setting-instruction',
            source: 'demo-response',
            target: 'demo-response-instruction',
            sourceHandle: 'setting-source-system_prompt',
            targetHandle: 'setting-target',
            type: 'settings',
            animated: false,
            data: { label: 'system_prompt' },
        },
    ],
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
        },
    ],
};

const STYLE_TO_INSTRUCTION: Record<InstructionStyle, string> = {
    standard: 'Répondre de façon concise et directe en se basant exclusivement sur les documents fournis.',
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
                await this.agentService.remove(agent.id, workspaceId);
                const winner = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);
                return this.toResponse(winner!);
            }
            throw err;
        }

        try {
            await this.creditBalanceService.grantInitial({
                workspaceId,
                amount: ONBOARDING_INITIAL_CREDITS,
            });
        } catch (err) {
            console.error(`[Onboarding] Failed to grant initial credits for workspace ${workspaceId}:`, err);
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

        if (!session) {
            throw new NotFoundException('Onboarding session not found');
        }

        if (step > session.step + 1) {
            throw new BadRequestException(`Cannot skip to step ${step} from step ${session.step}`);
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
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (!session) {
            throw new NotFoundException('Onboarding session not found');
        }

        const current = (session.stepsData as Record<string, Record<string, unknown>>) ?? {};

        const updated = {
            ...current,
            [stepId]: { ...(current[stepId] ?? {}), ...data },
        };

        await this.onboardingRepository.update(session.id, {
            stepsData: updated as Prisma.InputJsonValue,
        });
    }

    async compare(userId: string, workspaceId: string, query: string): Promise<CompareOnboardingResponse> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (!session) {
            throw new NotFoundException('Onboarding session not found');
        }

        await this._checkAndIncrementStepQueryCount(session, 'compare-intelligence');

        const results = await Promise.allSettled([
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

        const [standard, precise, creative] = results.map((r) => (r.status === 'fulfilled' ? r.value.answer : ''));

        return { standard, precise, creative };
    }

    async complete(userId: string, workspaceId: string, style: InstructionStyle): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (!session) {
            throw new NotFoundException('Onboarding session not found');
        }

        const instruction = STYLE_TO_INSTRUCTION[style];

        const workflow = await this.workflowService.findActive(session.agentId);

        if (!workflow) {
            throw new NotFoundException('No active workflow found for this agent');
        }

        const definition = workflow.definition as {
            blocks: Record<string, unknown>[];
            nodes?: unknown[];
            edges?: unknown[];
        };

        const updatedBlocks =
            definition.blocks?.map((b) => (b['type'] === 'answer' ? { ...b, system_prompt: instruction } : b)) ?? [];

        const updatedDefinition = { ...definition, blocks: updatedBlocks };

        await this.workflowService.update(session.agentId, {
            definition: updatedDefinition as Record<string, unknown>,
        });

        await this.onboardingRepository.update(session.id, {
            instruction,
            completed: true,
        });
    }

    private static readonly QUERY_LIMITS: Record<string, number> = {
        'test-assistant': 5,
        'improve-assistant': 5,
        'compare-intelligence': 2,
    };

    private async _checkAndIncrementStepQueryCount(session: OnboardingSession, stepId: string): Promise<void> {
        const max = OnboardingService.QUERY_LIMITS[stepId];
        if (!max) return;

        const stepsData = (session.stepsData as Record<string, Record<string, unknown>>) ?? {};
        const count = (stepsData[stepId]?.queryCount as number) ?? 0;

        if (count >= max) {
            throw new ForbiddenException(`Limite de ${max} messages atteinte pour cette étape.`);
        }

        const updated = {
            ...stepsData,
            [stepId]: { ...(stepsData[stepId] ?? {}), queryCount: count + 1 },
        };
        await this.onboardingRepository.update(session.id, {
            stepsData: updated as Prisma.InputJsonValue,
        });
    }

    async checkAndIncrementQueryCount(userId: string, workspaceId: string, stepId: string): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);
        if (!session) throw new NotFoundException('Onboarding session not found');
        await this._checkAndIncrementStepQueryCount(session, stepId);
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
