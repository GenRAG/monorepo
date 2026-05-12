import React, { useMemo, useState } from "react";
import {
    Box,
    Grid,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Skeleton,
    Stack,
    Text,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { Bot, Clock, Search, SortAsc } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetAssistantsListQuery, AssistantPreview } from "services/chat/chat";
import { useIsDark } from "hooks/useIsDark";

export type SortKey = string;

const AVATAR_COLORS = ["#22C55E", "#3B82F6", "#8B5CF6", "#F97316", "#EC4899", "#14B8A6", "#EF4444", "#F59E0B"];

const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

interface AssistantCardProps {
    assistant: AssistantPreview;
    onClick: () => void;
}

const AssistantCard: React.FC<AssistantCardProps> = ({ assistant, onClick }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const sub = isDark ? "grey.400" : "grey.500";
    const avatarColor = getAvatarColor(assistant.title);

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
        >
            <HStack spacing={3} align="flex-start" mb={3}>
                <Box
                    w="44px"
                    h="44px"
                    borderRadius="10px"
                    bg={avatarColor + "22"}
                    border="1px solid"
                    borderColor={avatarColor + "44"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                >
                    <Text fontSize="lg" fontWeight="bold" color={avatarColor}>
                        {assistant.title.charAt(0).toUpperCase()}
                    </Text>
                </Box>
                <VStack align="start" spacing={1} flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight="semibold" color={isDark ? "white" : "grey.900"} noOfLines={1}>
                        {assistant.title}
                    </Text>
                    {assistant.lastMessage && (
                        <Text fontSize="xs" color={sub} noOfLines={2} lineHeight="1.4">
                            {assistant.lastMessage}
                        </Text>
                    )}
                </VStack>
            </HStack>

            <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor={isDark ? "grey.800" : "grey.100"}>
                <HStack spacing={2}>
                    <Box
                        w="22px"
                        h="22px"
                        borderRadius="full"
                        bg={getAvatarColor(assistant.sharedBy ?? "") + "33"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <Text fontSize="9px" fontWeight="bold" color={getAvatarColor(assistant.sharedBy ?? "")}>
                            {(assistant.sharedBy ?? "?").charAt(0).toUpperCase()}
                        </Text>
                    </Box>
                    <Text fontSize="xs" color={isDark ? "grey.300" : "grey.700"}>
                        {assistant.sharedBy}
                    </Text>
                </HStack>

                {assistant.updatedAt && (
                    <HStack spacing={1}>
                        <Icon as={Clock} boxSize={3} color={sub} />
                        <Text fontSize="10px" color={sub}>
                            {formatDate(assistant.updatedAt)}
                        </Text>
                    </HStack>
                )}
            </HStack>
        </Box>
    );
};

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

export const SortButton = (
    key: SortKey,
    label: string,
    icon: React.ElementType,
    sort: SortKey,
    setSort: (key: SortKey) => void,
) => {
    const isDark = useIsDark();

    const sub = isDark ? "grey.400" : "grey.500";
    return (
        <HStack
            as="button"
            px={3}
            py={1.5}
            spacing={1.5}
            borderRadius="8px"
            cursor="pointer"
            bg={sort === key ? (isDark ? "grey.700" : "grey.100") : "transparent"}
            onClick={() => setSort(key)}
            transition="background 0.15s"
        >
            <Icon as={icon} boxSize={3.5} color={sort === key ? (isDark ? "white" : "grey.900") : sub} />
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
};

export const AssistantsList = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("recent");

    const sub = isDark ? "grey.400" : "grey.500";
    const border = isDark ? "grey.700" : "grey.200";

    const { data: assistants = [], isLoading } = useGetAssistantsListQuery();

    const filtered = useMemo(() => {
        let list = [...assistants];
        if (search) list = list.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
        if (sort === "az") list = list.sort((a, b) => a.title.localeCompare(b.title));
        return list;
    }, [assistants, search, sort]);

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={5} overflow="auto" maxH="100vh">
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
                <VStack align="start" spacing={0.5}>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={isDark ? "white" : "grey.900"}>
                        Assistants
                    </Text>
                    <Text fontSize="sm" color={sub}>
                        Agents déployés accessibles · {assistants.length} au total
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

            <HStack
                spacing={0}
                bg={isDark ? "grey.900" : "grey.50"}
                border="1px solid"
                borderColor={border}
                borderRadius="10px"
                p={1}
                w="fit-content"
            >
                {SortButton("recent", "Récent", Clock, sort, setSort)}
                {SortButton("az", "A→Z", SortAsc, sort, setSort)}
            </HStack>

            {isLoading ? (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <CardSkeleton key={i} />
                    ))}
                </Grid>
            ) : filtered.length > 0 ? (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={3}>
                    {filtered.map((a) => (
                        <AssistantCard key={a.id} assistant={a} onClick={() => navigate(`/assistants/${a.id}`)} />
                    ))}
                </Grid>
            ) : (
                <VStack py={16} spacing={3}>
                    <Icon as={search ? Search : Bot} boxSize={10} color={sub} />
                    <Text fontSize="sm" color={sub}>
                        {search ? "Aucun assistant trouvé" : "Aucun agent déployé pour l'instant"}
                    </Text>
                    {!search && (
                        <Text fontSize="xs" color={sub} textAlign="center" maxW="300px">
                            Déployez un agent en production pour le voir apparaître ici
                        </Text>
                    )}
                </VStack>
            )}
        </Stack>
    );
};
