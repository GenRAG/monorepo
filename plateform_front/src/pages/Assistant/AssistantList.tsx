import React, { useMemo, useState } from "react";
import {
    Badge,
    Box,
    Grid,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Stack,
    Text,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import {
    BarChart3,
    BookMarked,
    BookOpen,
    Clock,
    MessageCircle,
    Scale,
    Search,
    SortAsc,
    TrendingUp,
    Users,
    type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type SortKey = "recent" | "az" | "unread";
type Category =
    | "Tous"
    | "Juridique"
    | "Marketing"
    | "RH"
    | "Tech"
    | "Analytics";

const CATEGORIES: Category[] = [
    "Tous",
    "Juridique",
    "Marketing",
    "RH",
    "Tech",
    "Analytics",
];

interface Assistant {
    id: string;
    title: string;
    lastMessage: string;
    sharedBy: string;
    sharedByInitial: string;
    sharedByColor: string;
    category: string;
    messageCount: number;
    unreadCount: number;
    time: string;
    pinned: boolean;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
}

const MOCK_ASSISTANTS: Assistant[] = [
    {
        id: "1",
        title: "Contract Risk Analysis",
        lastMessage:
            "Here are the main clauses that require your attention in the Dupont agreement...",
        sharedBy: "Quentin",
        sharedByInitial: "Q",
        sharedByColor: "#22C55E",
        category: "Juridique",
        messageCount: 14,
        unreadCount: 2,
        time: "5 h",
        pinned: true,
        icon: Scale,
        iconBg: "#1E1B4B",
        iconColor: "#818CF8",
    },
    {
        id: "2",
        title: "Marketing Strategy Q1",
        lastMessage:
            "We should focus on increasing inbound through SEO and LinkedIn...",
        sharedBy: "Sophie",
        sharedByInitial: "S",
        sharedByColor: "#3B82F6",
        category: "Marketing",
        messageCount: 8,
        unreadCount: 0,
        time: "Hier",
        pinned: false,
        icon: TrendingUp,
        iconBg: "#451A03",
        iconColor: "#FBBF24",
    },
    {
        id: "3",
        title: "HR Policy Navigator",
        lastMessage:
            "According to the current policy, remote work can be requested after 6 months...",
        sharedBy: "David",
        sharedByInitial: "D",
        sharedByColor: "#8B5CF6",
        category: "RH",
        messageCount: 5,
        unreadCount: 1,
        time: "6 mai",
        pinned: false,
        icon: Users,
        iconBg: "#064E3B",
        iconColor: "#34D3A9",
    },
    {
        id: "4",
        title: "Technical Documentation AI",
        lastMessage:
            "The API endpoint /v2/agents now accepts a filter parameter for workflow status...",
        sharedBy: "Amara",
        sharedByInitial: "A",
        sharedByColor: "#F97316",
        category: "Tech",
        messageCount: 22,
        unreadCount: 0,
        time: "5 mai",
        pinned: false,
        icon: BookOpen,
        iconBg: "#1A2E1A",
        iconColor: "#4ADE80",
    },
    {
        id: "5",
        title: "Customer Insights",
        lastMessage:
            "Churn risk is highest in accounts with fewer than 3 active users in the last 30 days...",
        sharedBy: "Léa",
        sharedByInitial: "L",
        sharedByColor: "#EC4899",
        category: "Analytics",
        messageCount: 11,
        unreadCount: 3,
        time: "4 mai",
        pinned: false,
        icon: BarChart3,
        iconBg: "#3B0764",
        iconColor: "#C084FC",
    },
    {
        id: "6",
        title: "Legal Research Assistant",
        lastMessage:
            "The 2024 reform introduced new compliance requirements for data processing...",
        sharedBy: "Martin",
        sharedByInitial: "M",
        sharedByColor: "#14B8A6",
        category: "Juridique",
        messageCount: 3,
        unreadCount: 0,
        time: "3 mai",
        pinned: false,
        icon: BookMarked,
        iconBg: "#1E3A5F",
        iconColor: "#60A5FA",
    },
];

interface AssistantCardProps {
    assistant: Assistant;
    onClick: () => void;
}

const AssistantCard: React.FC<AssistantCardProps> = ({
    assistant,
    onClick,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const sub = isDark ? "grey.400" : "grey.500";

    return (
        <Box
            bg={isDark ? "grey.900" : "white"}
            border="1px solid"
            borderColor={isDark ? "grey.700" : "grey.200"}
            borderRadius="12px"
            p={4}
            cursor="pointer"
            transition="all 0.15s"
            _hover={{
                borderColor: isDark ? "grey.600" : "grey.300",
                transform: "translateY(-1px)",
            }}
            onClick={onClick}
            position="relative"
        >
            {assistant.unreadCount > 0 && (
                <Badge
                    position="absolute"
                    top={3}
                    right={3}
                    bg="green.500"
                    color="white"
                    borderRadius="full"
                    fontSize="11px"
                    fontWeight="bold"
                    minW="20px"
                    textAlign="center"
                >
                    {assistant.unreadCount}
                </Badge>
            )}

            <HStack spacing={3} align="flex-start" mb={3}>
                <Box
                    w="44px"
                    h="44px"
                    borderRadius="10px"
                    bg={assistant.iconBg}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    <Icon
                        as={assistant.icon}
                        boxSize={5}
                        color={assistant.iconColor}
                    />
                </Box>
                <VStack align="start" spacing={1} flex={1} minW={0} pr={6}>
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={isDark ? "white" : "grey.900"}
                        noOfLines={1}
                    >
                        {assistant.title}
                    </Text>
                    <Text
                        fontSize="xs"
                        color={sub}
                        noOfLines={2}
                        lineHeight="1.4"
                    >
                        {assistant.lastMessage}
                    </Text>
                </VStack>
            </HStack>

            <HStack
                justify="space-between"
                mt={2}
                pt={2}
                borderTop="1px solid"
                borderColor={isDark ? "grey.800" : "grey.100"}
            >
                <HStack spacing={2}>
                    <Box
                        w="26px"
                        h="26px"
                        borderRadius="full"
                        bg={assistant.sharedByColor}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <Text fontSize="10px" fontWeight="bold" color="white">
                            {assistant.sharedByInitial}
                        </Text>
                    </Box>
                    <Text
                        fontSize="xs"
                        color={isDark ? "grey.300" : "grey.700"}
                    >
                        {assistant.sharedBy}
                    </Text>
                    <Box
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        bg={isDark ? "grey.800" : "grey.100"}
                        border="1px solid"
                        borderColor={isDark ? "grey.700" : "grey.200"}
                    >
                        <Text fontSize="10px" color={sub}>
                            {assistant.category}
                        </Text>
                    </Box>
                </HStack>
                <HStack spacing={3}>
                    <HStack spacing={1}>
                        <Icon as={MessageCircle} boxSize={3} color={sub} />
                        <Text fontSize="10px" color={sub}>
                            {assistant.messageCount}
                        </Text>
                    </HStack>
                    <HStack spacing={1}>
                        <Icon as={Clock} boxSize={3} color={sub} />
                        <Text fontSize="10px" color={sub}>
                            {assistant.time}
                        </Text>
                    </HStack>
                </HStack>
            </HStack>
        </Box>
    );
};

export const AssistantsList = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<Category>("Tous");
    const [sort, setSort] = useState<SortKey>("recent");

    const sub = isDark ? "grey.400" : "grey.500";
    const border = isDark ? "grey.700" : "grey.200";

    const filtered = useMemo(() => {
        let list = [...MOCK_ASSISTANTS];
        if (search)
            list = list.filter((a) =>
                a.title.toLowerCase().includes(search.toLowerCase()),
            );
        if (category !== "Tous")
            list = list.filter((a) => a.category === category);
        if (sort === "az")
            list = list.sort((a, b) => a.title.localeCompare(b.title));
        if (sort === "unread")
            list = list.sort((a, b) => b.unreadCount - a.unreadCount);
        return list;
    }, [search, category, sort]);

    const pinned = filtered.filter((a) => a.pinned);
    const regular = filtered.filter((a) => !a.pinned);

    const sortButton = (key: SortKey, label: string, icon: LucideIcon) => (
        <HStack
            as="button"
            px={3}
            py={1.5}
            spacing={1.5}
            borderRadius="8px"
            cursor="pointer"
            bg={
                sort === key
                    ? isDark
                        ? "grey.700"
                        : "grey.100"
                    : "transparent"
            }
            onClick={() => setSort(key)}
            transition="background 0.15s"
        >
            <Icon
                as={icon}
                boxSize={3.5}
                color={sort === key ? (isDark ? "white" : "grey.900") : sub}
            />
            <Text
                fontSize="sm"
                fontWeight={sort === key ? "600" : "400"}
                color={sort === key ? (isDark ? "white" : "grey.900") : sub}
                whiteSpace="nowrap"
            >
                {label}
            </Text>
        </HStack>
    );

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={5} overflow="auto" maxH="100vh">
            <HStack
                justify="space-between"
                align="flex-start"
                flexWrap="wrap"
                gap={3}
            >
                <VStack align="start" spacing={0.5}>
                    <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="bold"
                        color={isDark ? "white" : "grey.900"}
                    >
                        Assistants
                    </Text>
                    <Text fontSize="sm" color={sub}>
                        Assistants partagés avec vous · {MOCK_ASSISTANTS.length}{" "}
                        au total
                    </Text>
                </VStack>
                <InputGroup maxW="260px">
                    <InputLeftElement pointerEvents="none" h="full">
                        <Icon as={Search} boxSize={4} color={sub} />
                    </InputLeftElement>
                    <Input
                        placeholder="Rechercher un assistant..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="sm"
                        bg={isDark ? "grey.800" : "white"}
                        border="1px solid"
                        borderColor={border}
                        borderRadius="8px"
                        fontSize="sm"
                        _placeholder={{ color: sub }}
                        _focus={{ borderColor: "green.400", boxShadow: "none" }}
                    />
                </InputGroup>
            </HStack>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
                <HStack
                    spacing={1}
                    bg={isDark ? "grey.900" : "grey.50"}
                    border="1px solid"
                    borderColor={border}
                    borderRadius="10px"
                    p={1}
                    flexWrap="wrap"
                >
                    {CATEGORIES.map((c) => (
                        <Box
                            key={c}
                            as="button"
                            px={3}
                            py={1}
                            borderRadius="7px"
                            cursor="pointer"
                            bg={
                                category === c
                                    ? isDark
                                        ? "grey.700"
                                        : "white"
                                    : "transparent"
                            }
                            boxShadow={
                                category === c
                                    ? "0 1px 4px rgba(0,0,0,0.12)"
                                    : "none"
                            }
                            onClick={() => setCategory(c)}
                            transition="all 0.15s"
                        >
                            <Text
                                fontSize="sm"
                                fontWeight={category === c ? "600" : "400"}
                                color={
                                    category === c
                                        ? isDark
                                            ? "white"
                                            : "grey.900"
                                        : sub
                                }
                            >
                                {c}
                            </Text>
                        </Box>
                    ))}
                </HStack>

                <HStack
                    spacing={0}
                    bg={isDark ? "grey.900" : "grey.50"}
                    border="1px solid"
                    borderColor={border}
                    borderRadius="10px"
                    p={1}
                >
                    {sortButton("recent", "Récent", Clock)}
                    {sortButton("az", "A→Z", SortAsc)}
                    {sortButton("unread", "Non lus", MessageCircle)}
                </HStack>
            </HStack>

            {pinned.length > 0 && (
                <VStack align="stretch" spacing={3}>
                    <HStack spacing={2}>
                        <Text
                            fontSize="10px"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            color={sub}
                            fontWeight="semibold"
                        >
                            📌 Épinglés
                        </Text>
                    </HStack>
                    <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                        gap={3}
                    >
                        {pinned.map((a) => (
                            <AssistantCard
                                key={a.id}
                                assistant={a}
                                onClick={() => navigate(`/assistants/${a.id}`)}
                            />
                        ))}
                    </Grid>
                </VStack>
            )}

            {regular.length > 0 && (
                <VStack align="stretch" spacing={3}>
                    <Text
                        fontSize="10px"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color={sub}
                        fontWeight="semibold"
                    >
                        Tous les assistants
                    </Text>
                    <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                        gap={3}
                    >
                        {regular.map((a) => (
                            <AssistantCard
                                key={a.id}
                                assistant={a}
                                onClick={() => navigate(`/assistants/${a.id}`)}
                            />
                        ))}
                    </Grid>
                </VStack>
            )}

            {filtered.length === 0 && (
                <VStack py={16} spacing={2}>
                    <Icon as={Search} boxSize={8} color={sub} />
                    <Text fontSize="sm" color={sub}>
                        Aucun assistant trouvé
                    </Text>
                </VStack>
            )}
        </Stack>
    );
};
