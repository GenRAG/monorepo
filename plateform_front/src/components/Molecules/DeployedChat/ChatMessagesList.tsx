import { Box, Text, VStack, useColorMode } from "@chakra-ui/react";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatMessage } from "hooks/useChat";

interface ChatMessagesListProps {
    messages: ChatMessage[];
    welcomeMessage?: string;
    isLoading: boolean;
    isMobile: boolean;
    editingMessageId: string | null;
    editType: "question" | "response";
    editContent: string;
    canEditMessage: (messageId: string) => boolean;
    onEditContentChange: (value: string) => void;
    onCopy: (text: string) => void;
    onStartEdit: (message: ChatMessage, type: "question" | "response") => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
    messages,
    welcomeMessage,
    isLoading,
    isMobile,
    editingMessageId,
    editType,
    editContent,
    canEditMessage,
    onEditContentChange,
    onCopy,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    messagesContainerRef,
}: ChatMessagesListProps) => {
    const { colorMode } = useColorMode();
    const showWelcome = messages.length === 0 && welcomeMessage;
    const lastMessage = messages[messages.length - 1];

    return (
        <Box
            ref={messagesContainerRef}
            flex={1}
            minW={0}
            overflowY="auto"
            overflowX="hidden"
            px={{ base: 3, md: 6 }}
            py={{ base: 3, md: 5 }}
            display="flex"
            flexDirection="column"
        >
            <VStack
                align="stretch"
                spacing={5}
                w="100%"
                minW={0}
                maxW="920px"
                mx="auto"
            >
                {showWelcome && (
                    <Box
                        p={4}
                        bg={colorMode === "dark" ? "grey.700" : "grey.50"}
                        borderRadius="12px"
                        alignSelf="flex-start"
                        maxW="80%"
                    >
                        <Text
                            fontSize="sm"
                            color={
                                colorMode === "dark" ? "grey.200" : "grey.700"
                            }
                        >
                            {welcomeMessage}
                        </Text>
                    </Box>
                )}

                {messages.map((message) => (
                    <ChatMessageItem
                        key={message.id}
                        message={message}
                        isLastMessage={message.id === lastMessage?.id}
                        isLoading={isLoading}
                        isMobile={isMobile}
                        canEdit={canEditMessage(message.id)}
                        editingMessageId={editingMessageId}
                        editType={editType}
                        editContent={editContent}
                        onEditContentChange={onEditContentChange}
                        onCopy={onCopy}
                        onStartEdit={onStartEdit}
                        onSaveEdit={onSaveEdit}
                        onCancelEdit={onCancelEdit}
                    />
                ))}
            </VStack>
        </Box>
    );
};
