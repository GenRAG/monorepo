export enum UserRole {
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    VIEWER = "VIEWER",
}

export interface Workspace {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    users: {
        userId: string;
        workspaceId: string;
        role: UserRole;
    }[];
}

export interface WorkspaceDetail extends Workspace {
    creditBalance: {
        balance: number;
    };
    agents: {
        id: string;
        name: string;
        description: string | null;
        createdAt: string;
        workflows: {
            id: string;
            definition: unknown;
            isActive: boolean;
        }[];
        datasets: {
            datasetId: string;
        }[];
    }[];
}

export interface WorkspaceCreateRequest {
    name: string;
    description?: string;
}

export interface WorkspaceRenameRequest {
    workspaceId: string;
    name: string;
}

export const WORKSPACE_NAME_MAX_LENGTH = 60;
export const DEFAULT_WORKSPACE_NAME = "Mon entreprise";

export interface WorkspaceStatsAgentItem {
    id: string;
    name: string;
    status: string;
    conversationCount: number;
    datasetCount: number;
    latestVersion: number | null;
}

export interface WorkspaceStatsActivity {
    type: string;
    title: string;
    subtitle: string;
    createdAt: string;
}

export interface WorkspaceStats {
    agents: {
        total: number;
        production: number;
        development: number;
        items: WorkspaceStatsAgentItem[];
    };
    documents: {
        total: number;
        indexed: number;
        processing: number;
        failed: number;
    };
    conversations: {
        total: number;
        today: number;
    };
    credits: number;
    recentActivity: WorkspaceStatsActivity[];
    activityChart: Record<"24h" | "7j" | "30j", { labels: string[]; values: number[] }>;
}
