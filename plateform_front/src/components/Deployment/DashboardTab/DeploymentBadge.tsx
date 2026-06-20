import { Badge, HStack, Skeleton } from "@chakra-ui/react";
import { AgentStatus } from "types/deployment/deployment";

const STATUS_LABEL: Record<AgentStatus, string> = {
    [AgentStatus.DEVELOPMENT]: "Developpement",
    [AgentStatus.PRODUCTION]: "Production",
};

export const DeploymentBadge = ({ status, isLoading }: { status: AgentStatus; isLoading: boolean }) => {
    return (
        <HStack spacing={3}>
            <Skeleton isLoaded={!isLoading} borderRadius="4px">
                <Badge colorScheme={status === AgentStatus.PRODUCTION ? "green" : "gray"}>{STATUS_LABEL[status]}</Badge>
            </Skeleton>
        </HStack>
    );
};
