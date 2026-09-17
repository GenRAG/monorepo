import { Badge, Box, HStack, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import SectionHeader from "components/Deployment/SectionHeader";
import Button from "components/ui/Button";
import { useGetQueryLogsQuery, type QueryLogStatus } from "services/agentRuntime/agentRuntime";

const STATUS_COLOR: Record<QueryLogStatus, string> = {
    SUCCESS: "green",
    ERROR: "red",
    OUT_OF_CREDITS: "orange",
};

const STATUS_LABEL: Record<QueryLogStatus, string> = {
    SUCCESS: "Succès",
    ERROR: "Erreur",
    OUT_OF_CREDITS: "Crédits insuffisants",
};

const formatDuration = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`);

const formatLogDateTime = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

const LIMIT = 8;

export const QueryLogsTable = () => {
    const { workspaceId = "", agentId = "" } = useParams<{ workspaceId: string; agentId: string }>();
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useGetQueryLogsQuery(
        { workspaceId, agentId, page, limit: LIMIT },
        { skip: !workspaceId || !agentId },
    );

    const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

    return (
        <Box borderRadius="12px" border="1px solid" borderColor="borderDefault" bg="surfaceCard">
            <SectionHeader
                title="Logs API"
                subtitle="Historique des requêtes envoyées à cet agent par les utilisateurs finaux"
            />
            {isLoading ? (
                <VStack py={8}>
                    <Spinner size="sm" />
                </VStack>
            ) : isError ? (
                <VStack py={8}>
                    <Text fontSize="sm" color="textMuted">
                        Impossible de charger les logs.
                    </Text>
                </VStack>
            ) : !data?.data.length ? (
                <VStack py={8}>
                    <Text fontSize="sm" color="textMuted">
                        Aucune requête enregistrée
                    </Text>
                </VStack>
            ) : (
                <>
                    <Box overflowX="auto">
                        <Table size="sm">
                            <Thead bg="secondBackgroundDefault">
                                <Tr>
                                    <Th sx={{ fontSize: "12px !important" }} fontWeight="700" color="textMuted" py={2}>
                                        Requête
                                    </Th>
                                    <Th
                                        sx={{ fontSize: "12px !important" }}
                                        fontWeight="700"
                                        color="textMuted"
                                        py={2}
                                        isNumeric
                                    >
                                        Durée
                                    </Th>
                                    <Th
                                        sx={{ fontSize: "12px !important" }}
                                        fontWeight="700"
                                        color="textMuted"
                                        py={2}
                                        isNumeric
                                    >
                                        Crédits utilisés
                                    </Th>
                                    <Th sx={{ fontSize: "12px !important" }} fontWeight="700" color="textMuted" py={2}>
                                        Statut
                                    </Th>
                                    <Th sx={{ fontSize: "12px !important" }} fontWeight="700" color="textMuted" py={2}>
                                        Date
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data.data.map((log) => (
                                    <Tr key={log.id} _hover={{ bg: "secondBackgroundDefault" }} borderRadius="12px">
                                        <Td maxW="360px">
                                            <Text fontSize="xs" color="textBody" noOfLines={1}>
                                                {log.query}
                                            </Text>
                                        </Td>
                                        <Td isNumeric>
                                            <Text fontSize="xs" color="textBody">
                                                {formatDuration(log.durationMs)}
                                            </Text>
                                        </Td>
                                        <Td isNumeric>
                                            <Text fontSize="xs" color="textBody">
                                                {log.creditsUsed ?? "-"}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={STATUS_COLOR[log.status]} fontSize="xs" size="xs">
                                                {STATUS_LABEL[log.status]}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Text fontSize="xs" color="textMuted">
                                                {formatLogDateTime(log.createdAt)}
                                            </Text>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                    {totalPages > 1 && (
                        <HStack justify="space-between" px={4} py={3} borderTop="1px solid" borderColor="borderDefault">
                            <Text fontSize="xs" color="textMuted">
                                {data.total} requêtes au total
                            </Text>
                            <HStack spacing={2}>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => setPage((p) => p - 1)}
                                    isDisabled={page === 1}
                                >
                                    <ChevronLeft size={14} />
                                </Button>
                                <Text fontSize="xs" color="textBody">
                                    {page} / {totalPages}
                                </Text>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => setPage((p) => p + 1)}
                                    isDisabled={page === totalPages}
                                >
                                    <ChevronRight size={14} />
                                </Button>
                            </HStack>
                        </HStack>
                    )}
                </>
            )}
        </Box>
    );
};
