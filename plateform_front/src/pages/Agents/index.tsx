import { HStack, Icon, Input, InputGroup, InputLeftElement, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AgentsTable } from "components/Agents/AgentsTable";
import { CreateAgentModal } from "components/Agents/CreateAgentModal";
import { useGetWorkspaceAgentsQuery } from "services/agent/agent";
import { useParams } from "react-router-dom";
import { AgentStatus } from "types/deployment/deployment";
import Button from "components/ui/Button";
import { MainLayoutContainer } from "components/ui/MainLayoutContainer";
import MultiOptionButtons from "components/ui/MultiOptionButtons";

type StatusFilter = "all" | AgentStatus;

const SKELETON_ROWS = 4;

export const AgentsList = () => {
    const { workspaceId = "default" } = useParams<{ workspaceId: string }>();
    const { data: agents = [], isLoading } = useGetWorkspaceAgentsQuery(workspaceId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const stats = useMemo(
        () => ({
            total: agents.length,
            production: agents.filter((agent) => agent.status === AgentStatus.PRODUCTION).length,
            development: agents.filter((agent) => agent.status === AgentStatus.DEVELOPMENT).length,
        }),
        [agents],
    );

    const visibleAgents = useMemo(() => {
        const normalizedQuery = searchValue.trim().toLowerCase();
        return agents.filter((agent) => {
            const matchesSearch = normalizedQuery.length === 0 || agent.name.toLowerCase().includes(normalizedQuery);
            const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [agents, searchValue, statusFilter]);

    return (
        <MainLayoutContainer
            header={
                <VStack align="start" spacing={0.5}>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textStrong">
                        Agents
                    </Text>
                    <Text fontSize="sm" color="textLabel">
                        Creez et gérez vos agents, vous avez {agents.length} agent(s) au total
                    </Text>
                </VStack>
            }
            body={
                <>
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                        <MultiOptionButtons
                            options={[
                                { value: "all", label: `Tous (${stats.total})` },
                                { value: AgentStatus.PRODUCTION, label: `Prod (${stats.production})` },
                                { value: AgentStatus.DEVELOPMENT, label: `Dév (${stats.development})` },
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            size="sm"
                        />

                        <HStack spacing={3}>
                            <InputGroup maxW="260px">
                                <InputLeftElement pointerEvents="none" h="full">
                                    <Icon as={Search} boxSize={4} color="textLabel" />
                                </InputLeftElement>
                                <Input
                                    variant="glass"
                                    placeholder="Rechercher un agent..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    size="sm"
                                />
                            </InputGroup>
                            <Button
                                size="sm"
                                variant="superPrimary"
                                leftIcon={Plus}
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                Nouvel agent
                            </Button>
                        </HStack>
                    </HStack>

                    {isLoading ? (
                        <Stack spacing={2}>
                            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                                <Skeleton key={i} h="64px" borderRadius="12px" />
                            ))}
                        </Stack>
                    ) : (
                        <AgentsTable
                            agents={visibleAgents}
                            groupByStatus={statusFilter === "all"}
                            workspaceId={workspaceId}
                            hasAnyAgent={agents.length > 0}
                            isSearching={searchValue.trim().length > 0}
                            onCreateAgent={() => setIsCreateModalOpen(true)}
                        />
                    )}

                    <CreateAgentModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        workspaceId={workspaceId}
                    />
                </>
            }
        />
    );
};
