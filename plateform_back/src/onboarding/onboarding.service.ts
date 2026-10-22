import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { OnboardingSession, Prisma } from 'generated/prisma';
import { AgentService } from 'src/agent/agent.service';
import { DatasetService } from 'src/dataset/dataset.service';
import { WorkflowService } from 'src/workflow/workflow.service';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import type { PipelineBlock } from 'src/rag-engine/pipeline.schema';
import { OnboardingRepository } from './onboarding.repository';
import { OnboardingSessionResponse } from './dto/onboarding-session.response';
import { CompareOnboardingResponse } from './dto/compare-onboarding.request';
import { InstructionStyle } from './dto/complete-onboarding.request';
import { DEMO_WORKFLOW_DEFINITION } from './demo-workflow.definition';

const DEMO_DATASET_NAME = 'Documents de démonstration';

// Steps whose chat goes through GET /onboarding/stream. `compare-intelligence` uses POST /compare.
const STREAM_STEP_IDS = ['test-assistant', 'improve-assistant'];
const DEFAULT_STREAM_STEP_ID = 'test-assistant';

// Server-managed counter (see tryIncrementQueryCount): never writable through steps-data.
const RESERVED_STEP_DATA_KEYS = ['queryCount'];

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
        private readonly datasetService: DatasetService,
    ) {}

    async start(userId: string, workspaceId: string): Promise<OnboardingSessionResponse> {
        const existing = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);

        if (existing) {
            return this.toResponse(existing);
        }

        const claim = await this.onboardingRepository.claimStart(workspaceId);
        if (claim === 'no-plan') throw new ForbiddenException('Abonnez-vous pour lancer la découverte guidée.');
        if (claim === 'started') {
            const winner = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);
            if (winner) return this.toResponse(winner);
            throw new ConflictException('La découverte guidée a déjà été faite pour cette entreprise.');
        }

        try {
            return await this.createDemo(userId, workspaceId);
        } catch (err) {
            await this.onboardingRepository.releaseStart(workspaceId);
            throw err;
        }
    }

    private async createDemo(userId: string, workspaceId: string): Promise<OnboardingSessionResponse> {
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

        // Everything below must succeed together: on failure the half-built onboarding is removed so that a
        // retry starts clean instead of returning a session that lacks its dataset.
        let datasetId: string | undefined;
        try {
            const dataset = await this.datasetService.create(workspaceId, { name: DEMO_DATASET_NAME });
            datasetId = dataset.id;
            await this.datasetService.attachToAgent(dataset.id, agent.id, workspaceId);
        } catch (err) {
            await this.rollbackStart(agent.id, datasetId, workspaceId);
            throw err;
        }

        return this.toResponse(session);
    }

    private async rollbackStart(agentId: string, datasetId: string | undefined, workspaceId: string): Promise<void> {
        try {
            // The onboarding session and the agent/dataset link cascade with the agent.
            await this.agentService.remove(agentId);
            if (datasetId) await this.datasetService.delete(datasetId, workspaceId);
        } catch (err) {
            this.logger.error(`Failed to roll back the onboarding of agent ${agentId}`, err);
        }
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

        const clientData = Object.fromEntries(
            Object.entries(data).filter(([key]) => !RESERVED_STEP_DATA_KEYS.includes(key)),
        );

        await this.onboardingRepository.mergeStepData(session.id, stepId, clientData);
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
            }),
            this.orchestrator.executeQuery({
                query,
                agentId: session.agentId,
                workspaceId,
                instructionOverride: STYLE_TO_INSTRUCTION.precise,
            }),
            this.orchestrator.executeQuery({
                query,
                agentId: session.agentId,
                workspaceId,
                instructionOverride: STYLE_TO_INSTRUCTION.creative,
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
            nodes?: Array<{ data?: { type?: string; isPlaceholder?: boolean; stringValue?: string } }>;
            edges?: unknown[];
        };

        const updatedBlocks =
            definition.blocks?.map((b) => (b.type === 'answer' ? { ...b, system_prompt: instruction } : b)) ?? [];

        const updatedNodes =
            definition.nodes?.map((node) =>
                node.data?.type === 'INSTRUCTION'
                    ? { ...node, data: { ...node.data, stringValue: instruction, isPlaceholder: false } }
                    : node,
            ) ?? [];

        await this.workflowService.update(session.agentId, {
            definition: { ...definition, blocks: updatedBlocks, nodes: updatedNodes } as Record<string, unknown>,
        });

        await this.onboardingRepository.update(session.id, { instruction, completed: true });
    }

    /**
     * The first step queries the shared demo base (`org_id` "onboarding"); the next one queries the datasets
     * attached to the demo agent (no override).
     */
    resolveStreamParams(stepId?: string): { resolvedStepId: string; orgId?: string } {
        const resolvedStepId = stepId || DEFAULT_STREAM_STEP_ID;
        if (!STREAM_STEP_IDS.includes(resolvedStepId)) {
            throw new BadRequestException(`Unknown onboarding step: ${resolvedStepId}`);
        }
        const orgId = resolvedStepId === DEFAULT_STREAM_STEP_ID ? 'onboarding' : undefined;
        return { resolvedStepId, orgId };
    }

    /**
     * The stream only runs the demo agent of the caller's own onboarding session: `agentId` comes from
     * the query string and selects the datasets searched by the RAG engine, so it must never reference another agent.
     */
    async checkAndIncrementQueryCount(
        userId: string,
        workspaceId: string,
        agentId: string,
        stepId: string,
    ): Promise<void> {
        const session = await this.onboardingRepository.findByUserAndWorkspace(userId, workspaceId);
        if (!session) throw new NotFoundException('Onboarding session not found');
        if (session.agentId !== agentId) throw new NotFoundException('Agent not found');
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
