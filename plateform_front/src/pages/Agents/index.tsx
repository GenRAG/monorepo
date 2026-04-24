import {
    Box,
    Heading,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Stack,
    Text,
    useColorMode,
    useColorModeValue,
    VStack,
    Button,
} from "@chakra-ui/react";
import { ActionMenu } from "components/System/Molecules/ActionMenu/ActionMenu";
import { ArrowUpDown, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AgentCard } from "pages/Agents/AgentCard";
import { CreateAgentModal } from "pages/Agents/CreateAgentModal";
import { useGetWorkspaceAgentsQuery } from "services/agent/agent";
import { useParams } from "react-router-dom";

export const AgentsList = () => {
    const { workspaceId = "default" } = useParams<{ workspaceId: string }>();
    const { data: agents = [], isLoading } =
        useGetWorkspaceAgentsQuery(workspaceId);
    console.log(agents);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [sortBy, setSortBy] = useState<
        "lastEdited" | "nameAsc" | "nameDesc" | "documentsDesc"
    >("lastEdited");
    const { colorMode } = useColorMode();

    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const searchBarBg = useColorModeValue("grey.50", "grey.800");
    const toolbarBorder = useColorModeValue("grey.100", "grey.400");
    const filterBtnColor = useColorModeValue("grey.600", "grey.200");
    const categoryPillBg = useColorModeValue("grey.100", "#1f1f1d");

    const sortLabel: Record<typeof sortBy, string> = {
        lastEdited: "Dernière modification",
        nameAsc: "Nom (A–Z)",
        nameDesc: "Nom (Z–A)",
        documentsDesc: "Documents (du plus grand au plus petit)",
    };

    const visibleAgents = useMemo(() => {
        const normalizedQuery = searchValue.trim().toLowerCase();
        const filtered = agents.filter(
            (agent) =>
                normalizedQuery.length === 0 ||
                agent.name.toLowerCase().includes(normalizedQuery),
        );
        return filtered.sort((a, b) => {
            if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
            if (sortBy === "nameDesc") return b.name.localeCompare(a.name);
            if (sortBy === "documentsDesc")
                return (b.documentsCount ?? 0) - (a.documentsCount ?? 0);
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [agents, searchValue, sortBy]);

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={5} overflow="auto">
            <VStack align="stretch">
                <Heading
                    variant="heading-md"
                    color="grey.400"
                    fontWeight="md"
                    fontSize={{ base: "sm", md: "md" }}
                >
                    {new Date().toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </Heading>
                <Heading
                    variant="heading-3xl"
                    color={textPrimary}
                    fontWeight="semibold"
                    fontSize={{ base: "xl", md: "3xl" }}
                >
                    Librarie d&apos;agents
                </Heading>
                <Text color={textSecondary} variant="body-md">
                    Créez et gérez vos agents ici. Cliquez sur un agent pour le
                    consulter et le personnaliser.
                </Text>
            </VStack>

            <HStack spacing={2} align="center" flexWrap="wrap">
                <InputGroup flex="1" minW="160px" size="sm" bg="transparent">
                    <InputLeftElement pointerEvents="none">
                        <Icon as={Search} color={textSecondary} boxSize={3.5} />
                    </InputLeftElement>
                    <Input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Rechercher des agents..."
                        bg={searchBarBg}
                        fontSize="13px"
                        borderRadius="4px"
                        borderColor="transparent"
                        color={textPrimary}
                        _placeholder={{ color: textSecondary }}
                    />
                </InputGroup>

                <Box w="0.5px" h="40px" bg={toolbarBorder} flexShrink={0} />

                <ActionMenu
                    items={[
                        {
                            label: "Dernière modification",
                            onClick: () => setSortBy("lastEdited"),
                        },
                        {
                            label: "Nom (A–Z)",
                            onClick: () => setSortBy("nameAsc"),
                        },
                        {
                            label: "Nom (Z–A)",
                            onClick: () => setSortBy("nameDesc"),
                        },
                        {
                            label: "Documents (du plus grand au plus petit)",
                            onClick: () => setSortBy("documentsDesc"),
                        },
                    ]}
                    trigger={
                        <Button
                            size="md"
                            variant="ghost"
                            rightIcon={<ArrowUpDown size={12} />}
                            color={filterBtnColor}
                            fontWeight="400"
                            fontSize="13px"
                            bg={searchBarBg}
                            borderRadius="4px"
                            border="0.5px solid"
                            borderColor="transparent"
                            px={3}
                            _hover={{ bg: categoryPillBg }}
                        >
                            {sortLabel[sortBy]}
                        </Button>
                    }
                />
            </HStack>

            {isLoading ? (
                <Text color={textSecondary} fontSize="13px">
                    Chargement...
                </Text>
            ) : (
                <SimpleGrid spacing={3} columns={{ base: 1, sm: 2, xl: 4 }}>
                    <Box
                        w="100%"
                        minH="160px"
                        borderRadius="12px"
                        border="1.5px dashed"
                        borderColor={borderColor}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                        cursor="pointer"
                        onClick={() => setIsCreateModalOpen(true)}
                        _hover={{
                            borderColor:
                                colorMode === "dark" ? "grey.500" : "grey.400",
                            bg: colorMode === "dark" ? "grey.900" : "grey.50",
                        }}
                        transition="all 0.15s"
                    >
                        <Box
                            w="28px"
                            h="28px"
                            border="1.5px solid"
                            borderColor={borderColor}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color={textSecondary}
                        >
                            <Icon as={Plus} boxSize={3.5} />
                        </Box>
                        <Text fontSize="13px" color={textSecondary}>
                            Créer un nouvel agent
                        </Text>
                    </Box>

                    {visibleAgents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            workspaceId={workspaceId}
                        />
                    ))}

                    {visibleAgents.length === 0 && (
                        <Text color={textSecondary} fontSize="13px">
                            Aucun agent ne correspond à votre recherche.
                        </Text>
                    )}
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
