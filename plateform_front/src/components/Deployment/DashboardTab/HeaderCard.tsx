import {
    Box,
    HStack,
    Skeleton,
    Text,
    VStack,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import Button from "components/System/Atoms/Button";
import { DeployModal } from "components/Deployment/DeployModal";
import { AgentStatus, CurrentDeployment } from "types/deployment/deployment";
import { useMemo } from "react";
import { DeploymentBadge } from "components/Deployment/DashboardTab/DeploymentBadge";

interface HeaderCardProps {
    data: CurrentDeployment;
    isLoading: boolean;
}

const daysSince = (iso: string) =>
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

export const HeaderCard = ({ data, isLoading }: HeaderCardProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const bgColor = useColorModeValue("white", "grey.950");
    const borderColor = useColorModeValue("green.300", "green.500");
    const textColor = useColorModeValue("grey.900", "grey.50");

    const days = data.latestDeployment
        ? daysSince(data.latestDeployment.createdAt)
        : null;

    const deployLabel = useMemo(() => {
        if (isLoading) return "—";

        return data.deploymentStatus === AgentStatus.DEVELOPMENT
            ? "Déployer en Production"
            : "Redéployer";
    }, [data.deploymentStatus, isLoading]);

    return (
        <>
            <Box
                borderRadius="12px"
                border="2px solid"
                borderColor={borderColor}
                bg={bgColor}
                p={4}
            >
                <HStack justify="space-between" align="flex-start">
                    <VStack align="start">
                        <DeploymentBadge
                            status={data.deploymentStatus}
                            isLoading={isLoading}
                        />
                        <HStack align="end">
                            <Skeleton isLoaded={!isLoading} borderRadius="4px">
                                <Text
                                    fontSize="xl"
                                    fontWeight={700}
                                    color={textColor}
                                    fontFamily="mono"
                                >
                                    {data?.latestDeployment
                                        ? `v${data.latestDeployment.version}`
                                        : "—"}
                                </Text>
                            </Skeleton>
                            {days !== null && (
                                <Text fontSize="xs" color={textColor}>
                                    stable depuis {days} jour
                                    {days !== 1 ? "s" : ""}
                                </Text>
                            )}
                        </HStack>
                        <HStack spacing={1.5}>
                            <Text
                                fontSize="xs"
                                fontFamily="mono"
                                color={textColor}
                            >
                                {data?.latestDeployment?.name ??
                                    data?.name ??
                                    "—"}
                            </Text>
                            <Box color={textColor}>
                                <ExternalLink size={11} />
                            </Box>
                        </HStack>
                    </VStack>
                    <HStack spacing={2}>
                        <Button size="sm" variant="primary">
                            Ouvrir l&apos;agent
                        </Button>
                        <Button size="sm" variant="outline" onClick={onOpen}>
                            {deployLabel}
                        </Button>
                    </HStack>
                </HStack>
            </Box>

            <DeployModal
                isOpen={isOpen}
                onClose={onClose}
                title={deployLabel}
            />
        </>
    );
};

export default HeaderCard;
