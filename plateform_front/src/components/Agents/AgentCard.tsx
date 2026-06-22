import { Box, HStack, Icon, IconButton, Text, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AgentPreview } from "types/agent/agent";
import { AgentStatus } from "types/deployment/deployment";
import { Trash2 } from "lucide-react";
import { DeleteAgentModal } from "components/Agents/DeleteAgentModal";
import { EntityCard } from "components/ui/EntityCard";

interface AgentCardProps {
    agent: AgentPreview;
    workspaceId: string;
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string }> = {
    [AgentStatus.DEVELOPMENT]: { label: "Développement", color: "#F59E0B" },
    [AgentStatus.PRODUCTION]: { label: "Production", color: "#10B981" },
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, workspaceId }) => {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const descColor = useColorModeValue("grey.500", "grey.400");
    const deleteColor = useColorModeValue("grey.400", "grey.600");

    const statusStyle = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG[AgentStatus.DEVELOPMENT];

    return (
        <>
            <EntityCard
                title={agent.name}
                description={agent.description ?? ""}
                onClick={() => navigate(`/workspaces/${workspaceId}/agents/${agent.id}/playground`)}
                footer={
                    <>
                        <HStack spacing="6px">
                            <Box w="6px" h="6px" borderRadius="full" bg={statusStyle.color} flexShrink={0} />
                            <Text fontSize="xs" fontWeight="500" color={descColor}>
                                {statusStyle.label}
                            </Text>
                        </HStack>

                        <IconButton
                            aria-label="Supprimer l'agent"
                            icon={<Icon as={Trash2} boxSize={3.5} />}
                            size="xs"
                            variant="ghost"
                            color={deleteColor}
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            _hover={{ color: "red.500", bg: "red.50" }}
                            transition="all 0.15s"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen();
                            }}
                        />
                    </>
                }
            />

            <DeleteAgentModal
                agentId={agent.id}
                workspaceId={workspaceId}
                agentName={agent.name}
                isOpen={isOpen}
                onClose={onClose}
            />
        </>
    );
};
