import { AgentStatus } from "types/deployment/deployment";

export const VisibilityStatus = {
    PUBLIC: "public",
    PRIVATE: "private",
    API: "api",
} as const;

export type VisibilityMode =
    (typeof VisibilityStatus)[keyof typeof VisibilityStatus];

export interface AgentPreview {
    id: string;
    name: string;
    workspaceId: string;
    documentsCount?: number;
    updatedAt?: string;
    description?: string;
    deploymentStatus?: AgentStatus;
}

export interface Agent {
    id: string;
    name: string;
    workspaceId: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AgentApiResponse {
    id: string;
    name: string;
    description?: string;
    workspaceId?: string;
    createdAt?: string;
    updatedAt?: string;
    documentsCount?: number;
    deploymentStatus?: AgentStatus;
    _count?: {
        documents?: number;
    };
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
}
