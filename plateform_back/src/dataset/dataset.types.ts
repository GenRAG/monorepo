import { DocumentSource, DocumentStatus } from 'generated/prisma';

export interface DatasetAgentSummary {
    id: string;
    name: string;
}

export interface DatasetListItem {
    id: string;
    name: string;
    description: string | null;
    workspaceId: string;
    createdAt: Date;
    updatedAt: Date;
    documentsCount: number;
    agentsCount: number;
    /** Documents added per day, oldest first (list endpoint only). */
    activity?: number[];
    totalSize: number;
    statusCounts: Record<DocumentStatus, number>;
    agents: DatasetAgentSummary[];
}

export interface DatasetCleanupJob {
    workspaceId: string;
    datasetId: string;
    documents: { name: string; storageKey: string }[];
}

/** A workspace deleted with its owner's account: its engine collection and the stored files of its documents. */
export interface WorkspaceCleanupJob {
    workspaceId: string;
    storageKeys: string[];
}

export interface DatasetDailyAdditions {
    /** YYYY-MM-DD */
    date: string;
    count: number;
    size: number;
}

export interface DatasetAnalytics {
    totalDocuments: number;
    totalSize: number;
    quotaBytes: number;
    /** One entry per day of the period, oldest first, days without addition included. */
    additions: DatasetDailyAdditions[];
    sizeByMimeType: { mimeType: string; count: number; size: number }[];
    countBySource: Record<DocumentSource, number>;
    statusCounts: Record<DocumentStatus, number>;
}
