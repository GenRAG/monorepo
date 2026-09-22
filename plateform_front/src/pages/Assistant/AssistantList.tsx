import { useMemo, useState } from "react";
import { HStack, Icon, Input, InputGroup, InputLeftElement, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { Clock, Search, SortAsc } from "lucide-react";
import { AssistantsTable } from "components/Assistant/AssistantsTable";
import { useGetAssistantsListQuery } from "services/chat/chat";
import { MainLayoutContainer } from "components/ui/MainLayoutContainer";
import MultiOptionButtons from "components/ui/MultiOptionButtons";

export type SortKey = string;

const SKELETON_ROWS = 4;

export const AssistantsList = () => {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("recent");

    const { data: assistants = [], isLoading } = useGetAssistantsListQuery();

    const filtered = useMemo(() => {
        let list = [...assistants];
        if (search) list = list.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
        if (sort === "az") list = list.sort((a, b) => a.title.localeCompare(b.title));
        return list;
    }, [assistants, search, sort]);

    return (
        <MainLayoutContainer
            header={
                <VStack align="start" spacing={0.5}>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="textStrong">
                        Assistants
                    </Text>
                    <Text fontSize="sm" color="textLabel">
                        Agents déployés accessibles, vous avez {assistants.length} assistant(s) au total
                    </Text>
                </VStack>
            }
            body={
                <>
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                        <MultiOptionButtons
                            options={[
                                { value: "recent", label: "Récent", icon: Clock },
                                { value: "az", label: "A→Z", icon: SortAsc },
                            ]}
                            value={sort}
                            onChange={setSort}
                            size="sm"
                        />

                        <InputGroup maxW="260px">
                            <InputLeftElement pointerEvents="none" h="full">
                                <Icon as={Search} boxSize={4} color="textLabel" />
                            </InputLeftElement>
                            <Input
                                placeholder="Rechercher un assistant..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="sm"
                            />
                        </InputGroup>
                    </HStack>

                    {isLoading ? (
                        <Stack spacing={2}>
                            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                                <Skeleton key={i} h="64px" borderRadius="12px" />
                            ))}
                        </Stack>
                    ) : (
                        <AssistantsTable
                            assistants={filtered}
                            hasAnyAssistant={assistants.length > 0}
                            isSearching={search.trim().length > 0}
                        />
                    )}
                </>
            }
        />
    );
};
