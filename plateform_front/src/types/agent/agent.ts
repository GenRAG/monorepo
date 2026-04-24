export interface AgentPreview {
    id: string;
    name: string;
    workspaceId: string;
    documentsCount?: number;
    updatedAt?: string;
    description?: string;
    status?: "DEVELOPMENT" | "STAGING" | "PRODUCTION";
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
}

export interface UpdateAgentParams extends AgentByIdParams {
    name?: string;
    description?: string;
    status?: "DEVELOPMENT" | "STAGING" | "PRODUCTION";
}
