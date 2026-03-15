export interface AgentPreview {
    id: string;
    name: string;
    workspaceId: string;
    documentsCount?: number;
    updatedAt?: string;
}

export interface Agent {
    id: string;
    name: string;
    workspaceId: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}
