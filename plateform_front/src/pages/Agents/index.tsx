import {
    Box,
    Button,
    Heading,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    SimpleGrid,
    Stack,
    Text,
    useColorMode,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { ArrowUpDown, Grid, List, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AgentCard } from "pages/Agents/AgentCard";
import { AgentPreview } from "types/agent";
import { useGetWorkspaceAgentsQuery } from "services/agent/agent";
import { useParams } from "react-router-dom";

export const AgentsList = () => {
    const { workspaceId = "default" } = useParams<{ workspaceId: string }>();
    const { data: agents = [], isLoading } =
        useGetWorkspaceAgentsQuery(workspaceId);
    const [searchValue, setSearchValue] = useState("");
    const [sortBy, setSortBy] = useState<
        "lastEdited" | "nameAsc" | "nameDesc" | "documentsDesc"
    >("lastEdited");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "withDocs" | "empty"
    >("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const { colorMode } = useColorMode();

    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const panelBg = useColorModeValue("white", "grey.900");
    const toolbarBg = useColorModeValue("white", "#1a1a18");
    const toolbarBorder = useColorModeValue("grey.100", "grey.400");
    const filterBtnColor = useColorModeValue("grey.600", "grey.400");
    const cardPreviewBg = useColorModeValue("grey.100", "#0d0d0c");
    const cardBorder = useColorModeValue("green.200", "green.600");
    const categoryPillBg = useColorModeValue("grey.100", "#1f1f1d");
    const categoryPillActiveBg = useColorModeValue("grey.50", "grey.800");

    const sortLabel: Record<typeof sortBy, string> = {
        lastEdited: "Last edited",
        nameAsc: "Name (A–Z)",
        nameDesc: "Name (Z–A)",
        documentsDesc: "Documents (high to low)",
    };

    const displayAgents = useMemo<AgentPreview[]>(
        () =>
            agents.length > 0
                ? agents
                : [
                      {
                          id: "1",
                          name: "Default Agent",
                          workspaceId,
                          documentsCount: 0,
                          updatedAt: new Date().toISOString(),
                      },
                  ],
        [agents, workspaceId],
    );

    const visibleAgents = useMemo(() => {
        const normalizedQuery = searchValue.trim().toLowerCase();

        const filtered = displayAgents.filter((agent) => {
            const matchesSearch =
                normalizedQuery.length === 0 ||
                agent.name.toLowerCase().includes(normalizedQuery);

            const docsCount = agent.documentsCount ?? 0;
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "withDocs" && docsCount > 0) ||
                (statusFilter === "empty" && docsCount === 0);

            return matchesSearch && matchesStatus;
        });

        return filtered.sort((a, b) => {
            if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
            if (sortBy === "nameDesc") return b.name.localeCompare(a.name);
            if (sortBy === "documentsDesc")
                return (b.documentsCount ?? 0) - (a.documentsCount ?? 0);
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
        });
    }, [displayAgents, searchValue, sortBy, statusFilter]);

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={5} overflow="auto">
            <VStack align="stretch">
                <Heading
                    variant="heading-md"
                    color={colorMode === "dark" ? "grey.400" : "grey.400"}
                    fontWeight="md"
                    fontSize={{ base: "sm", md: "md" }}
                >
                    {new Date().toLocaleDateString("en-US", {
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
                    Agent Library
                </Heading>
                <Text color={textSecondary} variant="body-md">
                    Create and manage your agents here. Click on an agent to
                    view and customize it.
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
                        placeholder="Search agents..."
                        bg="transparent"
                        fontSize="13px"
                        borderRadius="12px"
                        color={textPrimary}
                        _placeholder={{ color: textSecondary }}
                    />
                </InputGroup>

                <Box w="0.5px" h="40px" bg={toolbarBorder} flexShrink={0} />

                <Menu>
                    <MenuButton
                        as={Button}
                        size="md"
                        variant="ghost"
                        rightIcon={<ArrowUpDown size={12} />}
                        color={filterBtnColor}
                        fontWeight="400"
                        fontSize="13px"
                        bg="transparent"
                        borderRadius="4px"
                        border="0.5px solid"
                        borderColor={toolbarBorder}
                        px={3}
                        _hover={{ bg: categoryPillBg }}
                    >
                        {sortLabel[sortBy]}
                    </MenuButton>
                    <MenuList
                        bg={toolbarBg}
                        borderColor={toolbarBorder}
                        fontSize="13px"
                        minW="180px"
                    >
                        <MenuItem
                            onClick={() => setSortBy("lastEdited")}
                            bg="transparent"
                            _hover={{ bg: categoryPillBg }}
                        >
                            Last edited
                        </MenuItem>
                        <MenuItem
                            onClick={() => setSortBy("nameAsc")}
                            bg="transparent"
                            _hover={{ bg: categoryPillBg }}
                        >
                            Name (A–Z)
                        </MenuItem>
                        <MenuItem
                            onClick={() => setSortBy("nameDesc")}
                            bg="transparent"
                            _hover={{ bg: categoryPillBg }}
                        >
                            Name (Z–A)
                        </MenuItem>
                        <MenuItem
                            onClick={() => setSortBy("documentsDesc")}
                            bg="transparent"
                            _hover={{ bg: categoryPillBg }}
                        >
                            Documents (high to low)
                        </MenuItem>
                    </MenuList>
                </Menu>

                <Box w="0.5px" h="40px" bg={toolbarBorder} flexShrink={0} />

                <HStack
                    spacing={0}
                    border="0.5px solid"
                    borderColor={toolbarBorder}
                    borderRadius="4px"
                    overflow="hidden"
                >
                    <Box
                        as="button"
                        px={3}
                        py={3}
                        bg={
                            viewMode === "grid"
                                ? categoryPillActiveBg
                                : "transparent"
                        }
                        color={
                            viewMode === "grid" ? textPrimary : textSecondary
                        }
                        onClick={() => setViewMode("grid")}
                        transition="all 0.15s"
                        _hover={{ bg: categoryPillBg }}
                        display="flex"
                        alignItems="center"
                    >
                        <Icon as={Grid} boxSize={3.5} />
                    </Box>
                    <Box
                        as="button"
                        px={3}
                        py={3}
                        bg={
                            viewMode === "list"
                                ? categoryPillActiveBg
                                : "transparent"
                        }
                        color={
                            viewMode === "list" ? textPrimary : textSecondary
                        }
                        onClick={() => setViewMode("list")}
                        transition="all 0.15s"
                        _hover={{ bg: categoryPillBg }}
                        display="flex"
                        alignItems="center"
                    >
                        <Icon as={List} boxSize={3.5} />
                    </Box>
                </HStack>
            </HStack>

            {isLoading ? (
                <Text color={textSecondary} fontSize="13px">
                    Loading...
                </Text>
            ) : (
                <SimpleGrid
                    spacing={4}
                    columns={{
                        base: 1,
                        sm: viewMode === "list" ? 1 : 2,
                        xl: viewMode === "list" ? 1 : 3,
                    }}
                >
                    <Box
                        w="100%"
                        minH={viewMode === "list" ? "56px" : "260px"}
                        borderRadius="4px"
                        border="2px dashed"
                        borderColor={borderColor}
                        bg="transparent"
                        display="flex"
                        flexDirection={viewMode === "list" ? "row" : "column"}
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                        cursor="pointer"
                        transition="all 0.15s ease"
                        _hover={{
                            borderColor:
                                colorMode === "dark" ? "grey.600" : "grey.400",
                            bg: colorMode === "dark" ? "grey.800" : "grey.50",
                        }}
                        px={viewMode === "list" ? 4 : 0}
                    >
                        <Box
                            w="26px"
                            h="26px"
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
                            Create new project
                        </Text>
                    </Box>

                    {visibleAgents.map((agent) =>
                        viewMode === "list" ? (
                            <HStack
                                key={agent.id}
                                w="100%"
                                bg={panelBg}
                                border="1px solid"
                                borderColor={cardBorder}
                                borderRadius="4px"
                                px={4}
                                py={3}
                                spacing={3}
                                cursor="pointer"
                                transition="all 0.15s"
                                _hover={{
                                    bg:
                                        colorMode === "dark"
                                            ? "grey.800"
                                            : "green.50",
                                    transform: "translateY(-1px)",
                                }}
                            >
                                <Box
                                    w="36px"
                                    h="36px"
                                    borderRadius="8px"
                                    bg={cardPreviewBg}
                                    flexShrink={0}
                                />

                                <VStack align="start" spacing={0} flex={1}>
                                    <Text
                                        fontSize="13px"
                                        fontWeight="500"
                                        color={textPrimary}
                                    >
                                        {agent.name}
                                    </Text>

                                    <Text fontSize="11px" color={textSecondary}>
                                        {agent.updatedAt
                                            ? `Edited ${new Date(
                                                  agent.updatedAt,
                                              ).toLocaleDateString()}`
                                            : "Never edited"}
                                    </Text>
                                </VStack>

                                <Text fontSize="11px" color={textSecondary}>
                                    {agent.documentsCount ?? 0} docs
                                </Text>
                            </HStack>
                        ) : (
                            <Box key={agent.id} h="100%">
                                <AgentCard
                                    agent={agent}
                                    workspaceId={workspaceId}
                                />
                            </Box>
                        ),
                    )}

                    {visibleAgents.length === 0 && (
                        <Text color={textSecondary} fontSize="13px">
                            No agents match your current search and filters.
                        </Text>
                    )}
                </SimpleGrid>
            )}
        </Stack>
    );
};
