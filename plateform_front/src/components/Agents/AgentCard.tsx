import { Box, HStack, Icon, IconButton, Text, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AgentPreview } from "types/agent/agent";
import { Clock, FileText } from "lucide-react";
import { DeleteAgentModal } from "components/Agents/DeleteAgentModal";
import { EntityCard } from "components/ui/EntityCard";
import { getGlassInk, lightenHex } from "components/ui/GlassNav";
import { formatDate } from "utils/documentFormatters";

interface AgentCardProps {
    agent: AgentPreview;
    workspaceId: string;
    columnTint: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, workspaceId, columnTint }) => {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const ink = getGlassInk("dark");
    const cardBg = lightenHex(columnTint, 0.05);

    const hasMeta = typeof agent.documentsCount === "number" || Boolean(agent.updatedAt);

    return (
        <>
            <EntityCard
                variant="tinted"
                bg={cardBg}
                title={agent.name}
                description={agent.description ?? ""}
                meta={
                    hasMeta && (
                        <HStack spacing={3}>
                            {typeof agent.documentsCount === "number" && (
                                <HStack spacing={1} borderRadius="4px" px={2} py={1} bg={lightenHex(columnTint, 0.1)}>
                                    <Icon as={FileText} boxSize={3} color={ink.muted} />
                                    <Text fontSize="xs" color={ink.muted}>
                                        {agent.documentsCount} document{agent.documentsCount !== 1 ? "s" : ""}
                                    </Text>
                                </HStack>
                            )}
                            {agent.updatedAt && (
                                <HStack spacing={1} borderRadius="4px" px={2} py={1} bg={lightenHex(columnTint, 0.1)}>
                                    <Icon as={Clock} boxSize={3} color={ink.muted} />
                                    <Text fontSize="xs" color={ink.muted}>
                                        {formatDate(agent.updatedAt)}
                                    </Text>
                                </HStack>
                            )}
                        </HStack>
                    )
                }
                onClick={() => navigate(`/workspaces/${workspaceId}/agents/${agent.id}/playground`)}
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
