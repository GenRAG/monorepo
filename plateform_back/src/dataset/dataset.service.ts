import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Dataset } from 'generated/prisma';
import { AgentRepository } from 'src/agent/agent.repository';
import { DatasetRepository } from './dataset.repository';
import { CreateDatasetRequest } from './dto/create-dataset.request';
import { UpdateDatasetRequest } from './dto/update-dataset.request';
import { DatasetAnalytics, DatasetCleanupJob, DatasetListItem } from './dataset.types';
import { MAX_DATASET_STORAGE_BYTES } from './dataset.constants';

export const DATASET_CLEANUP_QUEUE = 'dataset-cleanup';

export const DATASET_ACTIVITY_DAYS = 30;

/** Same day keys as agent analytics: Postgres `::date` values come back as UTC midnights. */
const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

/** Midnight `days - 1` days ago and the key of every day up to today. */
const dayRange = (days: number) => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));
    const keys = Array.from({ length: days }, (_, i) => {
        const day = new Date(since);
        day.setDate(since.getDate() + i);
        return toIsoDate(day);
    });
    return { since, keys };
};

export const DATASET_CLEANUP_JOB = 'cleanup-dataset';

@Injectable()
export class DatasetService {
    private readonly logger = new Logger(DatasetService.name);

    constructor(
        private readonly datasetRepository: DatasetRepository,
        private readonly agentRepository: AgentRepository,
        @InjectQueue(DATASET_CLEANUP_QUEUE)
        private readonly cleanupQueue: Queue<DatasetCleanupJob>,
    ) {}

    create(workspaceId: string, dto: CreateDatasetRequest): Promise<Dataset> {
        return this.datasetRepository.create(workspaceId, {
            name: dto.name.trim(),
            description: dto.description,
        });
    }

    /** With each dataset's daily additions over the last DATASET_ACTIVITY_DAYS days (oldest first). */
    async findAll(workspaceId: string): Promise<DatasetListItem[]> {
        const { since, keys } = dayRange(DATASET_ACTIVITY_DAYS);
        const [datasets, rows] = await Promise.all([
            this.datasetRepository.findAll(workspaceId),
            this.datasetRepository.getWorkspaceDailyAdditions(workspaceId, since),
        ]);

        const counts = new Map(rows.map((row) => [`${row.datasetId}:${toIsoDate(row.day)}`, row.count]));
        return datasets.map((dataset) => ({
            ...dataset,
            activity: keys.map((key) => counts.get(`${dataset.id}:${key}`) ?? 0),
        }));
    }

    async findOne(id: string, workspaceId: string): Promise<DatasetListItem> {
        const dataset = await this.datasetRepository.findOne(id, workspaceId);
        if (!dataset) throw new NotFoundException('Base de connaissances introuvable');
        return dataset;
    }

    async update(id: string, workspaceId: string, dto: UpdateDatasetRequest): Promise<Dataset> {
        await this._assertDatasetInWorkspace(id, workspaceId);
        return this.datasetRepository.update(id, {
            name: dto.name?.trim(),
            description: dto.description,
        });
    }

    async delete(id: string, workspaceId: string): Promise<void> {
        await this._assertDatasetInWorkspace(id, workspaceId);

        const documents = await this.datasetRepository.findDocumentsForCleanup(id);
        await this.datasetRepository.delete(id);

        if (documents.length === 0) return;

        await this.cleanupQueue.add(
            DATASET_CLEANUP_JOB,
            { datasetId: id, documents },
            {
                attempts: 5,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true,
                removeOnFail: false,
            },
        );
    }

    async attachToAgent(datasetId: string, agentId: string, workspaceId: string): Promise<void> {
        await this._assertDatasetInWorkspace(datasetId, workspaceId);
        await this._assertAgentInWorkspace(agentId, workspaceId);
        await this.datasetRepository.addAgentToDataset(datasetId, agentId);
    }

    async detachFromAgent(datasetId: string, agentId: string, workspaceId: string): Promise<void> {
        await this._assertDatasetInWorkspace(datasetId, workspaceId);
        await this._assertAgentInWorkspace(agentId, workspaceId);
        await this.datasetRepository.removeAgentFromDataset(datasetId, agentId);
    }

    async setAgents(datasetId: string, agentIds: string[], workspaceId: string): Promise<void> {
        await this._assertDatasetInWorkspace(datasetId, workspaceId);

        const uniqueIds = [...new Set(agentIds)];
        if (uniqueIds.length > 0) {
            const count = await this.datasetRepository.countAgentsInWorkspace(uniqueIds, workspaceId);
            if (count !== uniqueIds.length) {
                throw new BadRequestException("Un ou plusieurs agents n'appartiennent pas à cette entreprise");
            }
        }

        await this.datasetRepository.setAgents(datasetId, uniqueIds);
    }

    /**
     * Vector-store `org_id`s an agent may search. Only datasets that are attached to the agent and belong to the
     * agent's workspace are returned: anything else coming from the workflow definition is dropped and logged.
     * An empty `datasetIds` means "every attached dataset". The result may be empty.
     */
    async resolveOrgIdsForAgent(agentId: string, datasetIds?: string[]): Promise<string[]> {
        const attached = await this.datasetRepository.findDatasetIdsByAgent(agentId);
        if (!datasetIds?.length) return attached;

        const allowed = new Set(attached);
        const requested = [...new Set(datasetIds)];
        const ignored = requested.filter((id) => !allowed.has(id));

        if (ignored.length > 0) {
            this.logger.warn(`Agent ${agentId}: ignoring datasets not attached or unknown: ${ignored.join(', ')}`);
        }

        return requested.filter((id) => allowed.has(id));
    }

    async getAnalytics(id: string, workspaceId: string, days: number): Promise<DatasetAnalytics> {
        await this._assertDatasetInWorkspace(id, workspaceId);

        const { since, keys } = dayRange(days);

        const [rows, breakdowns] = await Promise.all([
            this.datasetRepository.getDailyAdditions(id, since),
            this.datasetRepository.getDocumentBreakdowns(id),
        ]);

        const byDate = new Map(rows.map((row) => [toIsoDate(row.day), row]));
        const additions = keys.map((date) => {
            const row = byDate.get(date);
            return { date, count: row?.count ?? 0, size: row?.size ?? 0 };
        });

        const totalDocuments = Object.values(breakdowns.statusCounts).reduce((sum, count) => sum + count, 0);
        const totalSize = breakdowns.sizeByMimeType.reduce((sum, row) => sum + row.size, 0);

        return { totalDocuments, totalSize, quotaBytes: MAX_DATASET_STORAGE_BYTES, additions, ...breakdowns };
    }

    private async _assertDatasetInWorkspace(id: string, workspaceId: string): Promise<void> {
        const dataset = await this.datasetRepository.exists(id, workspaceId);
        if (!dataset) throw new NotFoundException('Base de connaissances introuvable');
    }

    private async _assertAgentInWorkspace(agentId: string, workspaceId: string): Promise<void> {
        const agent = await this.agentRepository.findOne(agentId, workspaceId);
        if (!agent) throw new NotFoundException('Agent introuvable');
    }
}
