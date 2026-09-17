import { AgentStatus } from "types/deployment/deployment";

export const VisibilityStatus = {
    PUBLIC: "public",
    PRIVATE: "private",
    API: "api",
} as const;

export type VisibilityMode = (typeof VisibilityStatus)[keyof typeof VisibilityStatus];

export interface AgentPreview {
    id: string;
    name: string;
    workspaceId: string;
    documentsCount?: number;
    updatedAt?: string;
    description?: string;
    status: AgentStatus;
}

// `Agent` (single-agent detail, e.g. GET /agents/:id) has no `status` field: the backend derives
// status from the agent's latest AgentVersion.toStatus, which only `AgentPreview` (list endpoint)
// and `CurrentDeployment.deploymentStatus` (deployment endpoints) expose today.
export interface Agent {
    id: string;
    name: string;
    workspaceId: string;
    description?: string;
    retentionDays?: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceRouteParams {
    workspaceId: string;
}

export interface AgentByIdParams extends WorkspaceRouteParams {
    id: string;
}

export interface CreateAgentParams {
    workspaceId: string;
    name: string;
    description?: string;
    workflow?: {
        name?: string;
        definition: object;
    };
}

export interface UpdateAgentParams extends AgentByIdParams {
    name?: string;
    description?: string;
    retentionDays?: number | null;
}

export interface AgentMember {
    id: string;
    userId: string;
    email: string;
    name: string | null;
    createdAt: string;
}
