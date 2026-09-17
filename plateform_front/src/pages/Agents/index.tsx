import {
    Box,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Skeleton,
    SimpleGrid,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AgentCard } from "components/Agents/AgentCard";
import { AgentsStatsRow } from "components/Agents/AgentsStatsRow";
import { CreateAgentModal } from "components/Agents/CreateAgentModal";
import { useGetWorkspaceAgentsQuery } from "services/agent/agent";
import { useParams } from "react-router-dom";
import { AgentPreview } from "types/agent/agent";
import { AgentStatus } from "types/deployment/deployment";
import BoxIcon from "components/ui/BoxIcon";
import { getGlassInk } from "components/ui/GlassNav";
import { useAppResponsive } from "hooks/useAppResponsive";

const BOARD_COLUMNS: Array<{ status: AgentStatus; title: string; subtitle: string; tint: string }> = [
    { status: AgentStatus.PRODUCTION, title: "Production", subtitle: "Agents déployés et actifs", tint: "#1c2527" },
    {
        status: AgentStatus.DEVELOPMENT,
        title: "Développement",
        subtitle: "Agents en cours de configuration",
        tint: "#281e1f",
    },
];

const COLUMN_BREAKPOINTS = { base: 1, sm: 2, xl: 4 };

const SKELETON_CARD_HEIGHT = 160;
const GRID_GAP = 12;

const useSkeletonCount = (columns: number) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(columns * 2);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(([entry]) => {
            const rows = Math.max(
                1,
                Math.round((entry.contentRect.height + GRID_GAP) / (SKELETON_CARD_HEIGHT + GRID_GAP)),
            );
            setCount(Math.min(columns * rows, 60));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [columns]);

    return { containerRef, count };
};

const CardSkeleton: React.FC = () => (
    <Skeleton
        height={`${SKELETON_CARD_HEIGHT}px`}
        borderRadius="12px"
        startColor="skeletonStart"
        endColor="skeletonEnd"
    />
);

interface AgentBoardColumnProps {
    status: AgentStatus;
    title: string;
    subtitle: string;
    tint: string;
    agents: AgentPreview[];
    workspaceId: string;
    onCreateAgent?: () => void;
}

const AgentBoardColumn: React.FC<AgentBoardColumnProps> = ({
    title,
    subtitle,
    tint,
    agents,
    workspaceId,
    onCreateAgent,
}) => {
    const ink = getGlassInk("dark");
    const isEmpty = agents.length === 0 && !onCreateAgent;

    return (
        <Stack flex={1} spacing={3} w="100%" h="100%" bg={tint} borderRadius="16px" overflow="hidden" p={6}>
            <Box flexShrink={0} mb={4}>
                <HStack spacing={2}>
                    <Text variant="body-xl">{title}</Text>
                    <Box
                        as="span"
                        fontSize="xs"
                        fontWeight="600"
                        color={ink.muted}
                        bg={ink.pillBg}
                        borderRadius="full"
                        px={2}
                    >
                        {agents.length}
                    </Box>
                </HStack>
                <Text variant="body-sm" color={ink.muted}>
                    {subtitle}
                </Text>
            </Box>

            <VStack align="stretch" spacing={3} flex={1} minH={0} overflow="auto">
                {onCreateAgent && (
                    <Box
                        w="100%"
                        minH="72px"
                        borderRadius="16px"
                        border="2px dashed"
                        borderColor="rgba(255, 255, 255, 0.18)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        cursor="pointer"
                        onClick={onCreateAgent}
                        _hover={{ borderColor: "rgba(255, 255, 255, 0.35)" }}
                        transition="border-color 0.15s"
                    >
                        <BoxIcon icon={Plus} />
                        <Text fontSize="13px" color={ink.text}>
                            Créer un nouvel agent
                        </Text>
                    </Box>
                )}

                {isEmpty && (
                    <Text fontSize="sm" color={ink.muted} textAlign="center" py={6}>
                        Aucun agent ici pour le moment.
                    </Text>
                )}

                {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} workspaceId={workspaceId} columnTint={tint} />
                ))}
            </VStack>
        </Stack>
    );
};

export const AgentsList = () => {
    const { workspaceId = "default" } = useParams<{ workspaceId: string }>();
    const { data: agents = [], isLoading } = useGetWorkspaceAgentsQuery(workspaceId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const visibleAgents = useMemo(() => {
        const normalizedQuery = searchValue.trim().toLowerCase();
        const filtered = agents.filter(
            (agent) => normalizedQuery.length === 0 || agent.name.toLowerCase().includes(normalizedQuery),
        );
        return filtered;
    }, [agents, searchValue]);

    const stats = useMemo(
        () => ({
            total: agents.length,
            production: agents.filter((agent) => agent.status === AgentStatus.PRODUCTION).length,
            development: agents.filter((agent) => agent.status === AgentStatus.DEVELOPMENT).length,
            totalDocuments: agents.reduce((sum, agent) => sum + (agent.documentsCount ?? 0), 0),
        }),
        [agents],
    );

    const columns = useAppResponsive(COLUMN_BREAKPOINTS) ?? COLUMN_BREAKPOINTS.xl;
    const { containerRef, count: skeletonCount } = useSkeletonCount(columns);

    return (
        <Stack
            py={{ base: 4, lg: 6 }}
            pl={{ base: 20, lg: 28 }}
            pr={{ base: 28, lg: 40 }}
            gap={4}
            overflow="auto"
            h="100%"
        >
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                <VStack align="start" spacing={0.5}>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textStrong">
                        Agents
                    </Text>
                    <Text fontSize="sm" color="textLabel">
                        Creez et gérez vos agents, vous avez {agents.length} agent(s) au total
                    </Text>
                </VStack>

                <InputGroup maxW="260px">
                    <InputLeftElement pointerEvents="none" h="full">
                        <Icon as={Search} boxSize={4} color="textLabel" />
                    </InputLeftElement>
                    <Input
                        placeholder="Rechercher un assistant..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        size="sm"
                    />
                </InputGroup>
            </HStack>

            {!isLoading && (
                <AgentsStatsRow
                    total={stats.total}
                    production={stats.production}
                    development={stats.development}
                    totalDocuments={stats.totalDocuments}
                />
            )}

            {isLoading ? (
                <Box ref={containerRef} flex={1} minH={0} overflow="hidden">
                    <SimpleGrid spacing={3} columns={COLUMN_BREAKPOINTS}>
                        {Array.from({ length: skeletonCount }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </SimpleGrid>
                </Box>
            ) : (
                <Stack direction={{ base: "column", lg: "row" }} spacing={4} align="stretch" flex={1} minH={0} h="100%">
                    {BOARD_COLUMNS.map((column) => (
                        <AgentBoardColumn
                            key={column.status}
                            {...column}
                            agents={visibleAgents.filter((agent) => agent.status === column.status)}
                            workspaceId={workspaceId}
                            onCreateAgent={
                                column.status === AgentStatus.DEVELOPMENT ? () => setIsCreateModalOpen(true) : undefined
                            }
                        />
                    ))}
                </Stack>
            )}

            <CreateAgentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspaceId={workspaceId}
            />
        </Stack>
    );
};
