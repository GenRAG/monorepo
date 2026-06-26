import React from "react";
import { Box, Circle, HStack, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Bot, Edit3 } from "lucide-react";
import { ConversationPreview } from "services/chat/chat";
import { useGroupedConversations } from "hooks/useGroupedConversations";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";

const formatDateShort = (iso: string) => {
    const date = new Date(iso);
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days < 1) return "";
    if (days < 7) return `${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "short" })}`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

interface ConversationSidebarProps {
    title: string;
    sharedBy?: string;
    conversations: ConversationPreview[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
    title,
    sharedBy,
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
    const groups = useGroupedConversations(conversations);

    return (
        <Box
            w="260px"
            minW="260px"
            h="100%"
            bg={isDark ? "grey.950" : "grey.25"}
            borderRight={`1px solid ${borderColor}`}
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            <Box px={3} pt={4} pb={3} borderBottom={`1px solid ${borderColor}`}>
                <HStack justify="space-between" mb={3}>
                    <HStack spacing={2.5}>
                        <BoxIcon icon={Bot} />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="600" color={isDark ? "white" : "grey.900"} noOfLines={1}>
                                {title}
                            </Text>
                            {sharedBy && (
                                <Text fontSize="10px" color="grey.500">
                                    partagé par {sharedBy}
                                </Text>
                            )}
                        </VStack>
                    </HStack>
                    <Button
                        aria-label="Nouvelle conversation"
                        btnType="icon"
                        icon={Edit3}
                        size="sm"
                        onClick={onNewConversation}
                    />
                </HStack>
            </Box>

            <Box flex={1} overflowY="auto" py={2}>
                {groups.map((group) => (
                    <Box key={group.label} mb={3}>
                        <Text
                            fontSize="9px"
                            fontWeight="700"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            color={isDark ? "grey.500" : "grey.400"}
                            px={4}
                            mb={2}
                        >
                            {group.label}
                        </Text>
                        {group.items.map((conv) => {
                            const isActive = conv.id === currentConversationId;
                            return (
                                <HStack
                                    key={conv.id}
                                    as="button"
                                    w="100%"
                                    justify="space-between"
                                    p={2}
                                    cursor="pointer"
                                    bg={
                                        isActive
                                            ? isDark
                                                ? "rgba(255,255,255,0.08)"
                                                : "rgba(0,0,0,0.05)"
                                            : "transparent"
                                    }
                                    borderLeft={isActive ? "2px solid #34D3A9" : "2px solid transparent"}
                                    _hover={{ bg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
                                    transition="all 0.12s"
                                    onClick={() => onSelectConversation(conv.id)}
                                >
                                    <HStack spacing={2} flex={1} minW={0}>
                                        <Circle
                                            size="6px"
                                            bg={isActive ? "#34D3A9" : isDark ? "grey.700" : "grey.300"}
                                            flexShrink={0}
                                        />
                                        <Text
                                            fontSize="xs"
                                            noOfLines={1}
                                            textAlign="left"
                                            color={
                                                isActive
                                                    ? isDark
                                                        ? "white"
                                                        : "grey.900"
                                                    : isDark
                                                      ? "grey.400"
                                                      : "grey.600"
                                            }
                                            fontWeight={isActive ? "500" : "400"}
                                        >
                                            {conv.title ?? conv.lastMessage ?? `Conversation ${conv.id.slice(0, 8)}`}
                                        </Text>
                                    </HStack>
                                    {conv.updatedAt && (
                                        <Text fontSize="9px" color="grey.400" flexShrink={0}>
                                            {formatDateShort(conv.updatedAt)}
                                        </Text>
                                    )}
                                </HStack>
                            );
                        })}
                    </Box>
                ))}
                {conversations.length === 0 && (
                    <Text fontSize="xs" color={isDark ? "grey.600" : "grey.400"} px={2} py={4}>
                        Aucune conversation
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default ConversationSidebar;
