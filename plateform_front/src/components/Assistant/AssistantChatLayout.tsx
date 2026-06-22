import React, { useEffect, useRef } from "react";
import { Box, HStack, useColorMode } from "@chakra-ui/react";
import { ChatMessage } from "hooks/chat";
import { ConversationPreview } from "services/chat/chat";
import AssistantInput from "./AssistantInput";
import ConversationSidebar from "./ConversationSidebar";
import MessageItem from "./MessageItem";
import HistoryLoadingSkeleton from "./HistoryLoadingSkeleton";

interface AssistantChatLayoutProps {
    title: string;
    sharedBy?: string;
    userName: string;
    messages: ChatMessage[];
    conversations: ConversationPreview[];
    currentConversationId: string | null;
    isLoading: boolean;
    isHistoryLoading?: boolean;
    onSend: (question: string) => void;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
}

const AssistantChatLayout: React.FC<AssistantChatLayoutProps> = ({
    title,
    sharedBy,
    userName,
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isHistoryLoading,
    onSend,
    onSelectConversation,
    onNewConversation,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mainBg = isDark
        ? "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 25%, rgba(44, 44, 44, 0.65) 100%)"
        : "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 25%, rgba(247, 246, 246, 0.75) 100%)";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <HStack h="100vh" w="100%" spacing={0} align="stretch" overflow="hidden" bg={mainBg}>
            <ConversationSidebar
                title={title}
                sharedBy={sharedBy}
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={onSelectConversation}
                onNewConversation={onNewConversation}
            />

            <Box flex={1} h="100%" display="flex" flexDirection="column" minW={0} overflow="hidden">
                <Box flex={1} overflowY="auto" display="flex" flexDirection="column" alignItems="center">
                    <Box w="60%" px={6} py={6}>
                        {isHistoryLoading && <HistoryLoadingSkeleton />}
                        {messages.map((msg) => (
                            <MessageItem
                                key={msg.id}
                                msg={msg}
                                agentTitle={title}
                                userName={userName}
                                isLoading={isLoading}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>
                </Box>
                <Box w="60%" alignSelf="center" px={4} pb={4} pt={2} flexShrink={0}>
                    <AssistantInput onSubmit={onSend} isLoading={isLoading} compact />
                </Box>
            </Box>
        </HStack>
    );
};

export default AssistantChatLayout;
