import { Badge, Box, Card, Divider, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { useGetRecentQueriesQuery, type QueryLogEntry } from "services/analytics/analytics";
import { fmtDateTime } from "utils/analytics/dateUtils";
import { STATUS_COLOR_SCHEME, STATUS_LABEL } from "./types";
import { ChartInfoTooltip } from "./ChartInfoTooltip";
import Button from "components/ui/Button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";

const RecentQueryItem = ({ query }: { query: QueryLogEntry }) => (
    <Box p={3} bg="surfaceCard" borderBottomWidth="1px" borderStyle="solid" borderColor="borderDefault">
        <HStack justify="space-between" align="start" mb={2}>
            <Text fontSize="sm" color="textStrong" noOfLines={1} flex={1} minW={0} mr={2}>
                {query.query}
            </Text>
            <Badge colorScheme={STATUS_COLOR_SCHEME[query.status]} fontSize="9px" borderRadius="full" flexShrink={0}>
                {STATUS_LABEL[query.status]}
            </Badge>
        </HStack>
        <HStack spacing={4} flexWrap="wrap">
            <Text fontSize="xs" color="textFaint">
                {fmtDateTime(query.createdAt)}
            </Text>
            <HStack spacing={1}>
                <Text fontSize="xs" color="textFaint">
                    Durée :
                </Text>
                <Text fontSize="xs" fontWeight="600" color="textBody">
                    {(query.durationMs / 1000).toFixed(1)}s
                </Text>
            </HStack>
            <HStack spacing={1}>
                <Text fontSize="xs" color="textFaint">
                    Coût :
                </Text>
                <Text fontSize="xs" fontWeight="600" color="textBody">
                    {query.creditsUsed} crédit{query.creditsUsed !== 1 ? "s" : ""}
                </Text>
            </HStack>
        </HStack>
    </Box>
);

const MAX_PER_PAGE = 8;

interface RecentQueriesCardProps {
    workspaceId: string;
    agentId: string;
}

export const RecentQueriesCard = ({ workspaceId, agentId }: RecentQueriesCardProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { data } = useGetRecentQueriesQuery(
        { workspaceId, agentId, page: currentPage, limit: MAX_PER_PAGE },
        { skip: !workspaceId || !agentId },
    );
    const queries = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / MAX_PER_PAGE));

    const isEmpty = useMemo(() => !data || total === 0, [data, total]);

    return (
        <Stack spacing={0} h="100%">
            <Card size="sm" variant="attachedTop">
                <VStack align="flex-start" spacing={0}>
                    <HStack spacing={1.5}>
                        <Text variant="body-md-semibold">Requêtes récentes</Text>
                        <ChartInfoTooltip label="Dernières requêtes envoyées à l'agent, avec leur statut, durée et coût en crédits." />
                    </HStack>
                    <Text variant="body-xs-muted">Vous permet de suivre l&apos;activité récente de votre agent</Text>
                </VStack>
            </Card>
            <Divider borderColor="borderStrong" />
            <Card size="none" variant="attachedBottom" flex={1} minH={0} display="flex" flexDirection="column">
                {isEmpty ? (
                    <CardEmptyState
                        icon={Clock}
                        title="Aucune requête récente"
                        description="Les requêtes envoyées à votre agent apparaîtront ici."
                    />
                ) : (
                    <VStack spacing={0} align="stretch" flex={1} overflowY="auto">
                        {queries.map((query) => (
                            <RecentQueryItem key={query.id} query={query} />
                        ))}
                    </VStack>
                )}
                {total > MAX_PER_PAGE && (
                    <HStack justify="space-between" px={4} pb={3}>
                        <Text fontSize="xs">
                            {total} requête{total !== 1 ? "s" : ""} au total
                        </Text>
                        <HStack spacing={2}>
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setCurrentPage((p) => p - 1)}
                                isDisabled={currentPage === 1}
                            >
                                <ChevronLeft size={14} />
                            </Button>
                            <Text fontSize="xs">
                                {currentPage} / {totalPages}
                            </Text>
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setCurrentPage((p) => p + 1)}
                                isDisabled={currentPage === totalPages}
                            >
                                <ChevronRight size={14} />
                            </Button>
                        </HStack>
                    </HStack>
                )}
            </Card>
        </Stack>
    );
};
