import { Box, HStack, Icon, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue, VStack } from "@chakra-ui/react";
import { Bot, Clock, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AssistantPreview } from "services/chat/chat";
import BoxIcon from "components/ui/BoxIcon";
import { getAgentAvatar } from "utils/agentAvatar";

const thProps = { fontSize: "12px", fontWeight: "700", color: "textMuted", py: 3 };

const formatRecentDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

interface AssistantsTableProps {
    assistants: AssistantPreview[];
    hasAnyAssistant: boolean;
    isSearching: boolean;
}

export const AssistantsTable = ({ assistants, hasAnyAssistant, isSearching }: AssistantsTableProps) => {
    const navigate = useNavigate();
    // Overlay alpha plutôt qu'un token de fond opaque : secondBackgroundDefault résout à la même
    // couleur que surfaceCard en dark mode (grey.950 des deux côtés), rendant le hover invisible.
    const rowHoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

    return (
        <Box borderRadius="12px" border="1px solid" borderColor="borderDefault" bg="surfacePrimary" overflow="hidden">
            {assistants.length > 0 ? (
                <Box overflowX="auto">
                    <Table size="sm">
                        <Thead bg="secondBackgroundDefault">
                            <Tr>
                                <Th sx={{ fontSize: "12px !important" }} {...thProps}>
                                    Assistant
                                </Th>
                                <Th sx={{ fontSize: "12px !important" }} {...thProps}>
                                    Partagé par
                                </Th>
                                <Th sx={{ fontSize: "12px !important" }} {...thProps}>
                                    Modifié
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {assistants.map((assistant) => {
                                const avatarStyle = getAgentAvatar(assistant.title);

                                return (
                                    <Tr
                                        key={assistant.id}
                                        cursor="pointer"
                                        _hover={{ bg: rowHoverBg }}
                                        onClick={() => navigate(`/assistants/${assistant.id}`)}
                                    >
                                        <Td maxW="360px">
                                            <HStack spacing={3}>
                                                <BoxIcon
                                                    size="md"
                                                    letters={assistant.title.charAt(0).toUpperCase()}
                                                    color={avatarStyle.color}
                                                    bg={avatarStyle.bg}
                                                />
                                                <VStack align="start" spacing={0} minW={0}>
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="600"
                                                        color="textStrong"
                                                        noOfLines={1}
                                                    >
                                                        {assistant.title}
                                                    </Text>
                                                    {assistant.lastMessage && (
                                                        <Text fontSize="xs" color="textLabel" noOfLines={1}>
                                                            {assistant.lastMessage}
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </HStack>
                                        </Td>
                                        <Td>
                                            {assistant.sharedBy ? (
                                                <HStack spacing={2}>
                                                    <BoxIcon
                                                        size="sm"
                                                        letters={assistant.sharedBy.charAt(0).toUpperCase()}
                                                    />
                                                    <Text fontSize="sm" color="textBody" noOfLines={1}>
                                                        {assistant.sharedBy}
                                                    </Text>
                                                </HStack>
                                            ) : (
                                                <Text fontSize="sm" color="textMuted">
                                                    —
                                                </Text>
                                            )}
                                        </Td>
                                        <Td>
                                            <HStack spacing={1.5}>
                                                <Icon as={Clock} boxSize={3} color="textLabel" />
                                                <Text fontSize="sm" color="textMuted">
                                                    {assistant.updatedAt ? formatRecentDate(assistant.updatedAt) : "—"}
                                                </Text>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            ) : (
                <VStack py={10} spacing={2}>
                    <Icon as={isSearching ? Search : Bot} boxSize={8} color="textLabel" />
                    <Text fontSize="sm" color="textLabel">
                        {hasAnyAssistant
                            ? "Aucun assistant ne correspond à ta recherche."
                            : "Aucun agent déployé pour l'instant."}
                    </Text>
                    {!hasAnyAssistant && (
                        <Text fontSize="xs" color="textLabel" textAlign="center" maxW="300px">
                            Déployez un agent en production pour le voir apparaître ici.
                        </Text>
                    )}
                </VStack>
            )}
        </Box>
    );
};
