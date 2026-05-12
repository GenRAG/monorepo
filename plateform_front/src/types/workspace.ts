export enum UserRole {
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    VIEWER = "VIEWER",
}

export interface Workspace {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
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
        createdAt: Date;
        workflows: {
            id: string;
            definition: unknown;
            isActive: boolean;
        }[];
        documents: {
            id: string;
        }[];
    }[];
}

export interface WorkspaceCreateRequest {
    name: string;
    description?: string;
}

export interface WorkspaceStatsAgentItem {
    id: string;
    name: string;
    status: string;
    conversationCount: number;
    documentCount: number;
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
