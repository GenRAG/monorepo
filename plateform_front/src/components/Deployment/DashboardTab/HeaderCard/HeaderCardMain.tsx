import { Box, HStack, VStack, Text, Skeleton, useColorModeValue } from "@chakra-ui/react";
import Button from "components/ui/Button";
import { DeploymentBadge } from "components/Deployment/DashboardTab/DeploymentBadge";
import type { FC } from "react";
import { AgentStatus, type CurrentDeployment } from "types/deployment/deployment";

interface Props {
    data: CurrentDeployment;
    isLoading: boolean;
    onOpen: () => void;
    onStop: () => void;
    isStopping: boolean;
    deployLabel: string;
}

export const HeaderCardMain: FC<Props> = ({ data, isLoading, onOpen, onStop, isStopping, deployLabel }) => {
    const bgColor = useColorModeValue("white", "grey.950");
    const borderColor = useColorModeValue("green.300", "green.500");
    const textColor = useColorModeValue("grey.900", "grey.50");
    const isProduction = data.deploymentStatus === AgentStatus.PRODUCTION;

    return (
        <Box borderRadius="12px" border="2px solid" borderColor={borderColor} bg={bgColor} p={4}>
            <HStack justify="space-between" align="flex-start">
                <VStack align="start">
                    <DeploymentBadge status={data.deploymentStatus} isLoading={isLoading} />
                    <HStack align="end">
                        <Skeleton isLoaded={!isLoading} borderRadius="4px">
                            <Text fontSize="xl" fontWeight={700} color={textColor} fontFamily="mono">
                                {data?.latestDeployment ? `v${data.latestDeployment.version}` : "—"}
                            </Text>
                        </Skeleton>
                    </HStack>
                    <HStack spacing={1.5}>
                        <Text fontSize="xs" fontFamily="mono" color={textColor}>
                            {data?.latestDeployment?.name ?? data?.name ?? "—"}
                        </Text>
                    </HStack>
                </VStack>
                <HStack spacing={2}>
                    {isProduction && (
                        <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={onStop}
                            isLoading={isStopping}
                            loadingText="Arrêt..."
                        >
                            Arrêter
                        </Button>
                    )}
                    <Button size="sm" variant="superPrimary" onClick={onOpen}>
                        {deployLabel}
                    </Button>
                </HStack>
            </HStack>
        </Box>
    );
};

export default HeaderCardMain;
