export const AgentStatus = {
    DEVELOPMENT: "DEVELOPMENT",
    PRODUCTION: "PRODUCTION",
} as const;

export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

export const VersionStatus = {
    PRODUCTION: "prod",
    ARCHIVED: "archived",
} as const;

export type VersionStatus = (typeof VersionStatus)[keyof typeof VersionStatus];

export interface Deployment {
    id: string;
    version: number;
    name: string | null;
    changelog: string | null;
    fromStatus: AgentStatus;
    toStatus: AgentStatus;
    workflowVersion: number | null;
    agentId: string;
    createdAt: string;
    createdBy: string;
    createdByUser: { id: string; name: string } | null;
}

export interface CurrentDeployment {
    deploymentStatus: AgentStatus;
    name: string;
    latestDeployment: Deployment | null;
    activeWorkflow: {
        id: string;
        version: number;
        name: string | null;
    } | null;
}

export interface DeploymentRouteParams {
    workspaceId: string;
    agentId: string;
}

export interface CreateDeploymentParams extends DeploymentRouteParams {
    name?: string;
    changelog?: string;
}

export interface RollbackParams extends DeploymentRouteParams {
    deploymentId: string;
    changelog?: string;
}

export type DeploymentEnv = VersionStatus;
