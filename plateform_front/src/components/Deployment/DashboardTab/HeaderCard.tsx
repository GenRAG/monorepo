import {
    Badge,
    Box,
    HStack,
    Skeleton,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";
import { useIsDark } from "hooks/useIsDark";
import { LiveDot } from "components/Deployment/LiveDot";
import Button from "components/System/Atoms/Button";
import { DeployModal } from "components/Deployment/DeployModal";
import { useCreateDeploymentMutation } from "services/deployment/deployment";
import { CurrentDeployment } from "types/deployment/deployment";

interface HeaderCardProps {
    data: CurrentDeployment;
    isLoading: boolean;
}

const STATUS_LABEL: Record<string, string> = {
    DEVELOPMENT: "Development",
    PRODUCTION: "Production",
};

const daysSince = (iso: string) =>
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

export const HeaderCard = ({ data, isLoading }: HeaderCardProps) => {
    const isDark = useIsDark();
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [deploy, { isLoading: isDeploying }] = useCreateDeploymentMutation();

    const isLive = data?.deploymentStatus === "PRODUCTION";
    const days = data?.latestDeployment
        ? daysSince(data.latestDeployment.createdAt)
        : null;

    const handleDeploy = async (name: string, changelog: string) => {
        await deploy({ workspaceId, agentId, name, changelog });
        onClose();
    };

    const deployLabel =
        data?.deploymentStatus === "DEVELOPMENT"
            ? "Déployer en Production"
            : "Redéployer";

    return (
        <>
            <Box
                borderRadius="12px"
                border="2px solid"
                borderColor={isDark ? "green.500" : "green.300"}
                bg={isDark ? "grey.950" : "white"}
                p={4}
            >
                <HStack justify="space-between" align="flex-start">
                    <VStack align="start">
                        <HStack spacing={3}>
                            <Skeleton isLoaded={!isLoading} borderRadius="4px">
                                <Badge colorScheme={isLive ? "green" : "gray"}>
                                    {STATUS_LABEL[data.deploymentStatus]}
                                </Badge>
                            </Skeleton>
                            {isLive && (
                                <HStack align="center">
                                    <LiveDot />
                                    <Text
                                        fontSize="sm"
                                        fontWeight={600}
                                        color="green.500"
                                        letterSpacing="0.06em"
                                        textTransform="uppercase"
                                    >
                                        EN DIRECT
                                    </Text>
                                </HStack>
                            )}
                        </HStack>
                        <HStack align="end">
                            <Skeleton isLoaded={!isLoading} borderRadius="4px">
                                <Text
                                    fontSize="xl"
                                    fontWeight={700}
                                    color={isDark ? "grey.50" : "grey.900"}
                                    fontFamily="mono"
                                >
                                    {data?.latestDeployment
                                        ? `v${data.latestDeployment.version}`
                                        : "—"}
                                </Text>
                            </Skeleton>
                            {days !== null && (
                                <Text
                                    fontSize="xs"
                                    color={isDark ? "grey.400" : "grey.400"}
                                >
                                    stable depuis {days} jour
                                    {days !== 1 ? "s" : ""}
                                </Text>
                            )}
                        </HStack>
                        <HStack spacing={1.5}>
                            <Text
                                fontSize="xs"
                                fontFamily="mono"
                                color={isDark ? "grey.600" : "grey.300"}
                            >
                                {data?.latestDeployment?.name ??
                                    data?.name ??
                                    "—"}
                            </Text>
                            <Box color={isDark ? "grey.600" : "grey.300"}>
                                <ExternalLink size={11} />
                            </Box>
                        </HStack>
                    </VStack>
                    <HStack spacing={2}>
                        <Button size="sm">Ouvrir l&apos;agent</Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onOpen}
                            isLoading={isDeploying}
                        >
                            {deployLabel}
                        </Button>
                    </HStack>
                </HStack>
            </Box>

            <DeployModal
                isOpen={isOpen}
                isLoading={isDeploying}
                onClose={onClose}
                onDeploy={handleDeploy}
                title={deployLabel}
            />
        </>
    );
};

export default HeaderCard;
