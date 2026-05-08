import { Box, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AgentPreview } from "types/agent/agent";
import { AgentStatus } from "types/deployment/deployment";

interface AgentCardProps {
    agent: AgentPreview;
    workspaceId: string;
}

const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; bg: string; textColor: string }
> = {
    development: {
        label: "Développement",
        color: "#F59E0B",
        bg: "#FEF3C7",
        textColor: "#92400E",
    },
    production: {
        label: "Production",
        color: "#10B981",
        bg: "#D1FAE5",
        textColor: "#065F46",
    },
};

const AVATAR_COLORS = [
    { bg: "#E0E7FF", color: "#3730A3" },
    { bg: "#FCE7F3", color: "#9D174D" },
    { bg: "#DCFCE7", color: "#166534" },
    { bg: "#FEF3C7", color: "#92400E" },
    { bg: "#FDE8D8", color: "#9A3412" },
    { bg: "#F3E8FF", color: "#6B21A8" },
];

const getAvatarColor = (name: string) => {
    const index = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, workspaceId }) => {
    const navigate = useNavigate();

    const cardBg = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.100", "grey.700");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const descColor = useColorModeValue("grey.500", "grey.400");
    const dividerColor = useColorModeValue("grey.100", "grey.700");
    const shadowColor = useColorModeValue(
        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "0 1px 3px rgba(0,0,0,0.3)",
    );
    console.log(agent);
    const deploymentStatus = (
        agent.deploymentStatus ?? AgentStatus.DEVELOPMENT
    ).toLowerCase();
    const description = agent.description ?? "";
    const statusStyle =
        STATUS_CONFIG[deploymentStatus] ?? STATUS_CONFIG.development;
    const avatarStyle = getAvatarColor(agent.name);

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="12px"
            boxShadow={shadowColor}
            cursor="pointer"
            transition="all 0.15s"
            overflow="hidden"
            _hover={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transform: "translateY(-1px)",
            }}
            onClick={() =>
                navigate(
                    `/workspaces/${workspaceId}/agents/${agent.id}/playground`,
                )
            }
        >
            <VStack align="start" spacing={0} h="100%">
                <VStack align="start" spacing={3} p={4} flex="1" w="100%">
                    <HStack spacing={3}>
                        <Box
                            w="32px"
                            h="32px"
                            borderRadius="8px"
                            bg={avatarStyle.bg}
                            color={avatarStyle.color}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="600"
                        >
                            {agent.name.charAt(0).toUpperCase()}
                        </Box>
                        <Text fontSize="sm" fontWeight="600" color={titleColor}>
                            {agent.name}
                        </Text>
                    </HStack>
                    <Text
                        fontSize="sm"
                        color={descColor}
                        lineHeight="1.5"
                        noOfLines={3}
                    >
                        {description || "Aucune description renseignée."}
                    </Text>
                </VStack>

                <HStack
                    w="100%"
                    p={4}
                    borderTop="1px solid"
                    borderColor={dividerColor}
                    justify="space-between"
                >
                    <HStack spacing="6px">
                        <Box
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            bg={statusStyle.color}
                            flexShrink={0}
                        />
                        <Text fontSize="xs" fontWeight="500" color={descColor}>
                            {statusStyle.label}
                        </Text>
                    </HStack>
                </HStack>
            </VStack>
        </Box>
    );
};
