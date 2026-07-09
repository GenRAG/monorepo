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
    useColorMode,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { Clock, Plus, Search, SortAsc } from "lucide-react";
import React, { useMemo, useState } from "react";
import { AgentCard } from "components/Agents/AgentCard";
import { CreateAgentModal } from "components/Agents/CreateAgentModal";
import { useGetWorkspaceAgentsQuery } from "services/agent/agent";
import { useParams } from "react-router-dom";
import { SortKey } from "pages/Assistant/AssistantList";
import BoxIcon from "components/ui/BoxIcon";
import MultiOptionButtons from "components/ui/MultiOptionButtons";

const CardSkeleton: React.FC = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    return (
        <Skeleton
            height="110px"
            borderRadius="12px"
            startColor={isDark ? "grey.800" : "grey.100"}
            endColor={isDark ? "grey.700" : "grey.200"}
        />
    );
};

export const AgentsList = () => {
    const { workspaceId = "default" } = useParams<{ workspaceId: string }>();
    const { data: agents = [], isLoading } = useGetWorkspaceAgentsQuery(workspaceId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [sort, setSort] = useState<SortKey>("recent");
    const { colorMode } = useColorMode();

    const textSecondary = useColorModeValue("grey.500", "white");
    const borderColor = useColorModeValue("grey.100", "grey.500");
    const bgColor = useColorModeValue("grey.25", "grey.900");

    const visibleAgents = useMemo(() => {
        const normalizedQuery = searchValue.trim().toLowerCase();
        const filtered = agents.filter(
            (agent) => normalizedQuery.length === 0 || agent.name.toLowerCase().includes(normalizedQuery),
        );
        return filtered.sort((a, b) => {
            if (sort === "az") return a.name.localeCompare(b.name);
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [agents, searchValue, sort]);

    const sub = useColorModeValue("grey.500", "grey.400");
    const titleColor = useColorModeValue("grey.900", "white");

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={5} overflow="auto">
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                <VStack align="start" spacing={0.5}>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={titleColor}>
                        Agents
                    </Text>
                    <Text fontSize="sm" color={sub}>
                        Creez et gérez vos agents, vous avez {agents.length} agent(s) au total
                    </Text>
                </VStack>

                <InputGroup maxW="260px">
                    <InputLeftElement pointerEvents="none" h="full">
                        <Icon as={Search} boxSize={4} color={sub} />
                    </InputLeftElement>
                    <Input
                        placeholder="Rechercher un assistant..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        size="sm"
                    />
                </InputGroup>
            </HStack>

            <MultiOptionButtons
                options={[
                    { value: "recent", label: "Récent", icon: Clock },
                    { value: "az", label: "A→Z", icon: SortAsc },
                ]}
                value={sort}
                onChange={setSort}
                size="sm"
            />

            {isLoading ? (
                <SimpleGrid spacing={3} columns={{ base: 1, sm: 2, xl: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </SimpleGrid>
            ) : (
                <SimpleGrid spacing={3} columns={{ base: 1, sm: 2, xl: 4 }}>
                    <Box
                        w="100%"
                        minH="160px"
                        borderRadius="12px"
                        border="2px dashed"
                        bg={bgColor}
                        borderColor={borderColor}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                        cursor="pointer"
                        onClick={() => setIsCreateModalOpen(true)}
                        _hover={{
                            borderColor: colorMode === "dark" ? "green.500" : "grey.200",
                        }}
                        transition="all 0.15s"
                    >
                        <BoxIcon icon={Plus} />
                        <Text fontSize="13px" color={textSecondary}>
                            Créer un nouvel agent
                        </Text>
                    </Box>

                    {visibleAgents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} workspaceId={workspaceId} />
                    ))}
                </SimpleGrid>
            )}

            <CreateAgentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspaceId={workspaceId}
            />
        </Stack>
    );
};
