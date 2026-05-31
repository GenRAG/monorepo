import { Box, HStack, Icon, Skeleton, Text, VStack, type BoxProps } from "@chakra-ui/react";
import { Bot, Zap } from "lucide-react";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { AgentStatus } from "types/deployment/deployment";
import { WorkspaceStatsAgentItem } from "types/workspace";
import BoxIcon from "components/System/Atoms/BoxIcon";
import RowContainer from "components/System/Atoms/RowContainer";

const STATUS_DOT: Record<string, string> = {
    PRODUCTION: "#12B98C",
    DEVELOPMENT: "#6B7280",
};

const STATUS_LABEL: Record<string, string> = {
    PRODUCTION: "Production",
    DEVELOPMENT: "Dev",
};

const AgentRow = ({ agent }: { agent: WorkspaceStatsAgentItem }) => {
    const initials = agent.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const metrics = [
        { val: agent.conversationCount.toLocaleString("fr-FR"), label: "CONV" },
        { val: String(agent.documentCount), label: "DOCS" },
    ];

    return (
        <RowContainer>
            <BoxIcon letters={initials} />
            <VStack align="start" spacing={0} flex={1} minW={0}>
                <Text fontSize="13px" fontWeight="600" color="textPrimary" noOfLines={1}>
                    {agent.name}
                </Text>
                <HStack spacing={1.5}>
                    <Box
                        w="5px"
                        h="5px"
                        borderRadius="full"
                        bg={STATUS_DOT[agent.status] ?? "#6B7280"}
                        flexShrink={0}
                    />
                    <Text fontSize="11px" color="textLabel">
                        {STATUS_LABEL[agent.status] ?? agent.status}
                        {agent.latestVersion != null ? ` · v${agent.latestVersion}` : ""}
                    </Text>
                </HStack>
            </VStack>
            {metrics.map(({ val, label }) => (
                <VStack key={label} align="center" spacing={0} minW="38px">
                    <Text variant="body-2xs">{val}</Text>
                    <Text variant="body-2xs">{label}</Text>
                </VStack>
            ))}
        </RowContainer>
    );
};

interface AgentsCardProps extends BoxProps {
    agents?: WorkspaceStatsAgentItem[];
    isEmpty?: boolean;
    isLoading?: boolean;
}

export const AgentsCard = ({ agents = [], isEmpty = false, isLoading = false, ...props }: AgentsCardProps) => {
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    const activeCount = agents.filter(
        (a) => a.status === AgentStatus.PRODUCTION || a.status === AgentStatus.DEVELOPMENT,
    ).length;

    if (isLoading) {
        return (
            <Box bg="surfaceCard" border="1px solid" borderColor="borderDefault" borderRadius="12px" {...props}>
                <HStack justify="space-between" borderBottom="1px solid" borderColor="borderDefault" p={4}>
                    <HStack spacing={2}>
                        <Skeleton {...skeletonProps} h="14px" w="14px" borderRadius="3px" />
                        <Skeleton {...skeletonProps} h="14px" w="60px" borderRadius="4px" />
                    </HStack>
                </HStack>
                <VStack spacing={0} align="stretch" p={2}>
                    {[...Array(4)].map((_, i) => (
                        <HStack key={i} spacing={3} p={2}>
                            <Skeleton {...skeletonProps} w="32px" h="32px" borderRadius="6px" flexShrink={0} />
                            <VStack align="start" spacing={1} flex={1} minW={0}>
                                <Skeleton {...skeletonProps} h="13px" w="120px" borderRadius="4px" />
                                <Skeleton {...skeletonProps} h="11px" w="80px" borderRadius="4px" />
                            </VStack>
                            {[0, 1].map((j) => (
                                <VStack key={j} align="center" spacing={1} minW="38px">
                                    <Skeleton {...skeletonProps} h="13px" w="28px" borderRadius="4px" />
                                    <Skeleton {...skeletonProps} h="10px" w="22px" borderRadius="3px" />
                                </VStack>
                            ))}
                        </HStack>
                    ))}
                </VStack>
            </Box>
        );
    }

    return (
        <Box bg="surfaceCard" border="1px solid" borderColor="borderDefault" borderRadius="12px" {...props}>
            <HStack justify="space-between" borderBottom="1px solid" borderColor="borderDefault" p={4}>
                <HStack spacing={2}>
                    <Icon as={Zap} boxSize={3.5} color="textLabel" />
                    <Text fontSize="sm" fontWeight="600" color="textPrimary">
                        Agents
                    </Text>
                    <Text fontSize="sm" color="textLabel">
                        {activeCount} actifs
                    </Text>
                </HStack>
            </HStack>
            {isEmpty ? (
                <CardEmptyState
                    icon={Bot}
                    title="Aucun agent actif"
                    description="Créez votre premier agent pour commencer."
                />
            ) : (
                <VStack spacing={0} align="stretch">
                    {agents.map((agent) => (
                        <AgentRow key={agent.id} agent={agent} />
                    ))}
                </VStack>
            )}
        </Box>
    );
};
