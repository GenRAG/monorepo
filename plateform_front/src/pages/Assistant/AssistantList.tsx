import React, { useMemo, useState } from "react";
import {
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
import BoxIcon from "components/ui/BoxIcon";
import { EntityCard } from "components/ui/EntityCard";
import MultiOptionButtons from "components/ui/MultiOptionButtons";

export type SortKey = string;

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

    return (
        <EntityCard
            title={assistant.title}
            onClick={onClick}
            footer={
                <>
                    <HStack spacing={2}>
                        <BoxIcon letters={assistant.sharedBy ? assistant.sharedBy.charAt(0).toUpperCase() : "?"} />
                        <Text fontSize="xs" color={isDark ? "grey.300" : "grey.700"}>
                            {assistant.sharedBy}
                        </Text>
                    </HStack>

                    {assistant.updatedAt && (
                        <HStack spacing={1}>
                            <Icon as={Clock} boxSize={3} color={sub} />
                            <Text fontSize="10px" color={sub}>
                                Dernière modification : {formatDate(assistant.updatedAt)}
                            </Text>
                        </HStack>
                    )}
                </>
            }
        />
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

export const AssistantsList = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("recent");

    const sub = isDark ? "grey.400" : "grey.500";

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
                        Agents déployés accessibles, vous avez {assistants.length} assistant(s) au total
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
