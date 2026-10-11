import {
    Box,
    HStack,
    Icon,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentPreview } from "types/agent/agent";
import { AgentStatus } from "types/deployment/deployment";
import BoxIcon from "components/ui/BoxIcon";
import { DeleteAgentModal } from "components/Agents/DeleteAgentModal";
import { getAgentAvatar } from "utils/agentAvatar";
import { formatRelativeDate } from "utils/date";

const thProps = {
    fontSize: "12px",
    fontWeight: "700",
    color: "textMuted",
    py: 3,
};

const STATUS_SECTIONS: Array<{
    status: AgentStatus;
    label: string;
    accent: string;
}> = [
    { status: AgentStatus.PRODUCTION, label: "Production", accent: "green.500" },
    {
        status: AgentStatus.DEVELOPMENT,
        label: "Développement",
        accent: "orange.500",
    },
];

interface AgentsTableProps {
    agents: AgentPreview[];
    groupByStatus: boolean;
    workspaceId: string;
    hasAnyAgent: boolean;
    isSearching: boolean;
    onCreateAgent: () => void;
}

export const AgentsTable = ({
    agents,
    groupByStatus,
    workspaceId,
    hasAnyAgent,
    isSearching,
    onCreateAgent,
}: AgentsTableProps) => {
    const navigate = useNavigate();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [agentToDelete, setAgentToDelete] = useState<AgentPreview | null>(null);
    const rowHoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");

    const handleDeleteClick = (agent: AgentPreview) => {
        setAgentToDelete(agent);
        onDeleteOpen();
    };

    const renderRow = (agent: AgentPreview) => {
        const avatarStyle = getAgentAvatar(agent.name);
        const datasetsCount = agent.datasetsCount ?? 0;

        return (
            <Tr
                key={agent.id}
                cursor="pointer"
                _hover={{ bg: rowHoverBg }}
                onClick={() => navigate(`/workspaces/${workspaceId}/agents/${agent.id}/playground`)}
            >
                <Td maxW="320px">
                    <HStack spacing={3}>
                        <BoxIcon
                            size="md"
                            letters={agent.name.charAt(0).toUpperCase()}
                            color={avatarStyle.color}
                            bg={avatarStyle.bg}
                        />
                        <VStack align="start" spacing={0} minW={0}>
                            <Text fontSize="sm" fontWeight="600" color="textStrong" noOfLines={1}>
                                {agent.name}
                            </Text>
                            <Text fontSize="xs" color="textLabel" noOfLines={1}>
                                {agent.description || "Aucune description renseignée."}
                            </Text>
                        </VStack>
                    </HStack>
                </Td>
                <Td>
                    <Text fontSize="sm" color="textBody">
                        {datasetsCount} base{datasetsCount !== 1 ? "s" : ""}
                    </Text>
                </Td>
                <Td>
                    <Text fontSize="sm" color="textMuted">
                        {agent.updatedAt ? formatRelativeDate(agent.updatedAt) : "Jamais"}
                    </Text>
                </Td>
                <Td onClick={(e) => e.stopPropagation()}>
                    <BoxIcon
                        icon={Trash2}
                        size="sm"
                        bg="transparent"
                        color="textLabel"
                        onClick={() => handleDeleteClick(agent)}
                    />
                </Td>
            </Tr>
        );
    };

    const sections = groupByStatus
        ? STATUS_SECTIONS.map((section) => ({
              ...section,
              agents: agents.filter((agent) => agent.status === section.status),
          })).filter((section) => section.agents.length > 0)
        : null;

    return (
        <Box borderRadius="12px" border="1px solid" borderColor="borderDefault" bg="surfacePrimary" overflow="hidden">
            {agents.length > 0 && (
                <Box overflowX="auto">
                    <Table size="sm">
                        <Thead bg="secondBackgroundDefault">
                            <Tr>
                                <Th sx={{ fontSize: "12px !important" }} {...thProps}>
                                    Agent
                                </Th>
                                <Th sx={{ fontSize: "12px !important" }} {...thProps}>
                                    Connaissance
                                </Th>
                                <Th sx={{ fontSize: "12px !important" }} {...thProps}>
                                    Modifié
                                </Th>
                                <Th sx={{ fontSize: "12px !important" }} {...thProps} w="1px" />
                            </Tr>
                        </Thead>
                        {sections ? (
                            sections.map((section) => (
                                <Tbody key={section.status}>
                                    <Tr>
                                        <Td colSpan={4} py={2} bg="surfaceModal">
                                            <HStack spacing={2}>
                                                <Box w="8px" h="8px" borderRadius="full" bg={section.accent} />
                                                <Text
                                                    fontSize="xs"
                                                    fontWeight="700"
                                                    color="textMuted"
                                                    letterSpacing="0.02em"
                                                >
                                                    {section.label.toUpperCase()} ({section.agents.length})
                                                </Text>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                    {section.agents.map(renderRow)}
                                </Tbody>
                            ))
                        ) : (
                            <Tbody>{agents.map(renderRow)}</Tbody>
                        )}
                    </Table>
                </Box>
            )}

            {agents.length === 0 && (
                <VStack py={10} spacing={2}>
                    <Icon as={isSearching ? Search : Plus} boxSize={8} color="textLabel" />
                    <Text fontSize="sm" color="textLabel">
                        {hasAnyAgent ? "Aucun agent ne correspond à ta recherche." : "Aucun agent pour le moment."}
                    </Text>
                </VStack>
            )}

            <HStack
                spacing={2}
                p={4}
                justify="center"
                cursor="pointer"
                borderTop={agents.length > 0 ? "1px solid" : undefined}
                borderColor="borderDefault"
                onClick={onCreateAgent}
                _hover={{ bg: rowHoverBg }}
            >
                <BoxIcon icon={Plus} size="sm" />
                <Text fontSize="sm" color="textLabel">
                    Créer un nouvel agent
                </Text>
            </HStack>

            {agentToDelete && (
                <DeleteAgentModal
                    agentId={agentToDelete.id}
                    workspaceId={workspaceId}
                    agentName={agentToDelete.name}
                    isOpen={isDeleteOpen}
                    onClose={onDeleteClose}
                />
            )}
        </Box>
    );
};
