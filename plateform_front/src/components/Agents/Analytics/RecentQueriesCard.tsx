import { Badge, Box, Card, Divider, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { fmtDateTime, mockRecentQueries } from "./mockData";
import { STATUS_COLOR_SCHEME, STATUS_LABEL, type RecentQuery } from "./types";
import { ChartInfoTooltip } from "./ChartInfoTooltip";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const RecentQueryItem = ({ query }: { query: RecentQuery }) => (
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

export const RecentQueriesCard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(mockRecentQueries.length / MAX_PER_PAGE);

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
                <VStack spacing={0} align="stretch" flex={1} overflowY="auto">
                    {mockRecentQueries.slice(0, MAX_PER_PAGE).map((query) => (
                        <RecentQueryItem key={query.id} query={query} />
                    ))}
                </VStack>
                {mockRecentQueries.length > MAX_PER_PAGE && (
                    <HStack justify="space-between" px={4} pb={3}>
                        <Text fontSize="xs">10 requêtes au total</Text>
                        <HStack spacing={2}>
                            <Button
                                size="xs"
                                variant="ghost"
                                //onClick={() => setPage((p) => p - 1)}
                                //isDisabled={page === 1}
                            >
                                <ChevronLeft size={14} />
                            </Button>
                            <Text fontSize="xs">
                                {currentPage} / {totalPages}
                            </Text>
                            <Button
                                size="xs"
                                variant="ghost"
                                //</HStack>onClick={() => setPage((p) => p + 1)}
                                //isDisabled={page === totalPages}
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
