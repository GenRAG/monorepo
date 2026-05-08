import { useMemo } from "react";
import {
    AgentStatus,
    Deployment,
    DeploymentEnv,
    VersionStatus,
} from "types/deployment/deployment";

export const useDeploymentEnvGetter = (deployments: Deployment[]) => {
    return useMemo(() => {
        const latestProd = [...deployments]
            .sort((a, b) => b.version - a.version)
            .find((d) => d.toStatus === AgentStatus.PRODUCTION);

        return (deployment: Deployment): DeploymentEnv =>
            latestProd?.id === deployment.id
                ? VersionStatus.PRODUCTION
                : VersionStatus.ARCHIVED;
    }, [deployments]);
};
