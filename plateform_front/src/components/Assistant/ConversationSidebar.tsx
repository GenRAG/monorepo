import React from "react";
import { Box, Circle, HStack, Text, VStack } from "@chakra-ui/react";
import { Bot, Edit3 } from "lucide-react";
import { ConversationPreview } from "services/chat/chat";
import { useGroupedConversations } from "hooks/useGroupedConversations";
import BoxIcon from "components/ui/BoxIcon";
import Button from "components/ui/Button";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

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
    const groups = useGroupedConversations(conversations);

    return (
        <Box
            w="260px"
            minW="260px"
            h="100%"
            bg="secondBackgroundDefault"
            borderRight="1px solid var(--chakra-colors-sidebarBorder)"
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            <Box px={3} pt={4} pb={3} borderBottom="1px solid var(--chakra-colors-sidebarBorder)">
                <HStack justify="space-between" mb={3}>
                    <HStack spacing={2.5}>
                        <BoxIcon icon={Bot} />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="600" color="textStrong" noOfLines={1}>
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
                            color="textFaint"
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
                                    bg={isActive ? "listItemActiveBg" : "transparent"}
                                    borderLeft={
                                        isActive ? `2px solid ${currentDarkTheme.hex.primary}` : "2px solid transparent"
                                    }
                                    _hover={{ bg: "listItemHoverBg" }}
                                    transition="all 0.12s"
                                    onClick={() => onSelectConversation(conv.id)}
                                >
                                    <HStack spacing={2} flex={1} minW={0}>
                                        <Circle
                                            size="6px"
                                            bg={isActive ? currentDarkTheme.hex.primary : "dotInactive"}
                                            flexShrink={0}
                                        />
                                        <Text
                                            fontSize="xs"
                                            noOfLines={1}
                                            textAlign="left"
                                            color={isActive ? "textStrong" : "textDescription"}
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
                    <Text fontSize="xs" color="textDescription" px={2} py={4}>
                        Aucune conversation
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default ConversationSidebar;
