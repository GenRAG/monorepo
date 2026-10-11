import { DocumentStatus } from "types/document/document";

export interface DatasetAgentSummary {
    id: string;
    name: string;
}

export interface DatasetEntity {
    id: string;
    name: string;
    description?: string | null;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
    documentsCount: number;
    agentsCount: number;
    /** Documents added per day over the last 30 days, oldest first (list only). */
    activity?: number[];
    totalSize: number;
    statusCounts: Record<DocumentStatus, number>;
    agents: DatasetAgentSummary[];
}

export interface AgentDatasetLink {
    agentId: string;
    datasetId: string;
}

export type DocumentSource = "UPLOAD" | "GOOGLE_DRIVE" | "SHAREPOINT" | "NOTION";

export interface DatasetByIdParams {
    workspaceId: string;
    id: string;
}

export interface CreateDatasetParams {
    workspaceId: string;
    name: string;
    description?: string;
}

export interface UpdateDatasetParams extends DatasetByIdParams {
    name?: string;
    description?: string;
}

export interface DatasetAgentParams extends DatasetByIdParams {
    agentId: string;
}

export interface SetDatasetAgentsParams extends DatasetByIdParams {
    agentIds: string[];
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
    additions: DatasetDailyAdditions[];
    sizeByMimeType: { mimeType: string; count: number; size: number }[];
    countBySource: Record<DocumentSource, number>;
    statusCounts: Record<DocumentStatus, number>;
}

export interface DatasetAnalyticsParams extends DatasetByIdParams {
    days: number;
}
