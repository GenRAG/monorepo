import type { WorkflowDefinition } from "@genrag/workflow";

export type { WorkflowDefinition as WorkflowCanvas };

export interface WorkflowEntity {
    id: string;
    agentId: string;
    name?: string | null;
    definition: WorkflowDefinition | Record<string, unknown>;
    version: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowRouteParams {
    workspaceId: string;
    agentId: string;
}

export interface SaveWorkflowParams extends WorkflowRouteParams {
    definition: WorkflowDefinition;
    name?: string;
}
