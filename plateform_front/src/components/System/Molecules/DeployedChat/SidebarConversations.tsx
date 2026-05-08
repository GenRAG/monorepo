import {
    Box,
    HStack,
    Icon,
    IconButton,
    Text,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { MessageSquare, Plus } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import type { ConversationPreview } from "./types";

interface SidebarConversationsProps {
    conversations: ConversationPreview[];
    currentConversationId: string | null;
    onConversationSelect: (conversationId: string) => void;
    onNewConversation?: () => void;
}

export const SidebarConversations: React.FC<SidebarConversationsProps> = ({
    conversations,
    currentConversationId,
    onConversationSelect,
    onNewConversation,
}: SidebarConversationsProps) => {
    const { colorMode } = useColorMode();

    return (
        <VStack align="stretch" spacing={1}>
            <HStack spacing={2} mb={1} justify="space-between">
                <HStack spacing={2}>
                    <Icon
                        as={MessageSquare}
                        boxSize={4}
                        color={currentDarkTheme.primary}
                    />
                    <Text fontSize="xs" color="grey.500" fontWeight="medium">
                        Conversations
                    </Text>
                </HStack>
                {onNewConversation && (
                    <IconButton
                        aria-label="Nouvelle conversation"
                        icon={<Plus size={14} />}
                        size="xs"
                        variant="ghost"
                        onClick={onNewConversation}
                    />
                )}
            </HStack>
            {conversations.length === 0 ? (
                <Text fontSize="xs" color="grey.500" p={2}>
                    Aucune conversation
                </Text>
            ) : (
                conversations.map((conv) => (
                    <Box
                        key={conv.id}
                        p={2}
                        borderRadius="8px"
                        cursor="pointer"
                        bg={
                            conv.id === currentConversationId
                                ? colorMode === "dark"
                                    ? "grey.700"
                                    : "grey.100"
                                : "transparent"
                        }
                        _hover={{
                            bg: colorMode === "dark" ? "grey.700" : "grey.100",
                        }}
                        onClick={() => onConversationSelect(conv.id)}
                    >
                        <Text
                            fontSize="sm"
                            noOfLines={2}
                            color={
                                colorMode === "dark" ? "grey.300" : "grey.700"
                            }
                            fontWeight={
                                conv.id === currentConversationId
                                    ? "semibold"
                                    : "normal"
                            }
                        >
                            {conv.title ??
                                conv.lastMessage ??
                                `Conversation ${conv.id.slice(0, 8)}`}
                        </Text>
                        {conv.updatedAt && (
                            <Text fontSize="xs" color="grey.500" mt={1}>
                                {new Date(conv.updatedAt).toLocaleDateString()}
                            </Text>
                        )}
                    </Box>
                ))
            )}
        </VStack>
    );
};
