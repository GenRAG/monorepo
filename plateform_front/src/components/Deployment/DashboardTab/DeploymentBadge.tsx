import { Badge, HStack, Skeleton, Text } from "@chakra-ui/react";
import { LiveDot } from "components/Deployment/LiveDot";
import { AgentStatus } from "types/deployment/deployment";

const STATUS_LABEL: Record<AgentStatus, string> = {
    [AgentStatus.DEVELOPMENT]: "Development",
    [AgentStatus.PRODUCTION]: "Production",
};

export const DeploymentBadge = ({
    status,
    isLoading,
}: {
    status: AgentStatus;
    isLoading: boolean;
}) => {
    return (
        <HStack spacing={3}>
            <Skeleton isLoaded={!isLoading} borderRadius="4px">
                <Badge
                    colorScheme={
                        status === AgentStatus.PRODUCTION ? "green" : "gray"
                    }
                >
                    {STATUS_LABEL[status]}
                </Badge>
            </Skeleton>
            {status === AgentStatus.PRODUCTION && (
                <HStack align="center">
                    <LiveDot />
                    <Text fontSize="sm" fontWeight={600} color="green.500">
                        EN DIRECT
                    </Text>
                </HStack>
            )}
        </HStack>
    );
};
