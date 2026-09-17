import React, { useEffect, useRef } from "react";
import { Box, HStack, useColorMode } from "@chakra-ui/react";
import { ChatMessage } from "hooks/chat";
import { ConversationPreview } from "services/chat/chat";
import AssistantInput from "./AssistantInput";
import ConversationSidebar from "./ConversationSidebar";
import HistoryLoadingSkeleton from "./HistoryLoadingSkeleton";
import MessageItem from "./MessageItem";

interface AssistantChatLayoutProps {
    assistantId: string;
    agentVersion?: string;
    title: string;
    sharedBy?: string;
    messages: ChatMessage[];
    conversations: ConversationPreview[];
    currentConversationId: string | null;
    isLoading: boolean;
    isHistoryLoading?: boolean;
    onSend: (question: string) => void;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
    disabled?: boolean;
    disabledMessage?: string;
}

const AssistantChatLayout: React.FC<AssistantChatLayoutProps> = ({
    assistantId,
    agentVersion,
    title,
    sharedBy,
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isHistoryLoading,
    onSend,
    onSelectConversation,
    onNewConversation,
    disabled,
    disabledMessage,
}) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mainBg = isDark
        ? "grey.975"
        : "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 25%, color-mix(in oklch, var(--chakra-colors-grey-50) 75%, transparent) 100%), white";

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
                        {isHistoryLoading ? (
                            <HistoryLoadingSkeleton />
                        ) : (
                            messages.map((msg) => (
                                <MessageItem
                                    key={msg.id}
                                    assistantId={assistantId}
                                    agentVersion={agentVersion}
                                    msg={msg}
                                    agentTitle={title}
                                    isLoading={isLoading}
                                />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </Box>
                </Box>
                <Box w="60%" alignSelf="center" px={4} pb={4} pt={2} flexShrink={0}>
                    <AssistantInput
                        onSubmit={onSend}
                        isLoading={isLoading}
                        compact
                        disabled={disabled}
                        disabledMessage={disabledMessage}
                    />
                </Box>
            </Box>
        </HStack>
    );
};

export default AssistantChatLayout;
