import { Box, HStack, VStack, Text, Skeleton, useColorModeValue } from "@chakra-ui/react";
import Button from "components/ui/Button";
import { DeploymentBadge } from "components/Deployment/DashboardTab/DeploymentBadge";
import type { FC } from "react";
import type { CurrentDeployment } from "types/deployment/deployment";

interface Props {
    data: CurrentDeployment;
    isLoading: boolean;
    onOpen: () => void;
    deployLabel: string;
}

export const HeaderCardMain: FC<Props> = ({ data, isLoading, onOpen, deployLabel }) => {
    const bgColor = useColorModeValue("white", "grey.950");
    const borderColor = useColorModeValue("green.300", "green.500");
    const textColor = useColorModeValue("grey.900", "grey.50");

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
                    <Button size="sm" variant="superPrimary" onClick={onOpen}>
                        {deployLabel}
                    </Button>
                </HStack>
            </HStack>
        </Box>
    );
};

export default HeaderCardMain;
