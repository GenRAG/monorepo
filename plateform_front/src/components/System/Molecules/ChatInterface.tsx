import React, { useRef, useEffect, useCallback } from "react";
import { Box, Divider, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Bot, LucideIcon } from "lucide-react";
import { ChatMessage, UseChatOptions, useChat } from "hooks/useChat";
import ChatMessageItem from "./Chat/ChatMessageItem";
import ChatInput from "./Chat/ChatInput";
import SuggestedQuestions from "./Chat/SuggestedQuestions";

interface ChatInterfaceProps {
    getResponse: UseChatOptions["getResponse"];
    onMessagesChange?: (messages: ChatMessage[]) => void;
    onResponseSelect?: (responseIndex: number, messageId: string) => void;
    suggestedQuestions?: string[];
    placeholder?: string;
    title?: string;
    welcomeMessage?: string;
    height?: string;
    fullHeight?: boolean;
    compact?: boolean;
    disabled?: boolean;
    disabledMessage?: string;
    icon?: LucideIcon;
    initialMessages?: ChatMessage[];
    maxMessages?: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    getResponse,
    onMessagesChange,
    onResponseSelect,
    suggestedQuestions,
    placeholder = "Posez votre question...",
    title = "Votre assistant est prêt",
    welcomeMessage,
    height = "500px",
    fullHeight = false,
    compact = false,
    disabled = false,
    disabledMessage,
    icon: IconComponent = Bot,
    initialMessages,
    maxMessages,
}) => {
    const iconBoxBg = useColorModeValue("rgba(40, 158, 87, 0.1)", "rgba(72, 187, 120, 0.12)");
    const iconBoxBorderColor = useColorModeValue("green.300", "green.700");
    const iconColor = useColorModeValue("green.500", "green.400");
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, isLoading } = useChat({
        getResponse,
        initialMessages,
    });

    const limitReached = maxMessages !== undefined && messages.length >= maxMessages;
    const isDisabled = disabled || limitReached;

    useEffect(() => {
        onMessagesChange?.(messages);
    }, [messages, onMessagesChange]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const handleResponseSelect = useCallback(
        (responseIndex: number, messageId: string) => {
            onResponseSelect?.(responseIndex, messageId);
        },
        [onResponseSelect],
    );

    return (
        <Box
            w="100%"
            h={fullHeight ? "100%" : height}
            minH={fullHeight && !compact ? "600px" : undefined}
            border="1px solid"
            borderColor="borderDivider"
            borderRadius="12px"
            bg="surfaceModal"
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            {messages.length === 0 ? (
                <VStack flex={1} justify="center" align="center" spacing={5} p={6}>
                    <Box
                        p={4}
                        bg={iconBoxBg}
                        border="1px solid"
                        borderRadius="8px"
                        borderColor={iconBoxBorderColor}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <Box as={IconComponent} boxSize={8} color={iconColor} />
                    </Box>

                    <VStack spacing={1}>
                        <Text variant="body-md-semibold" textAlign="center">
                            {title}
                        </Text>
                        {welcomeMessage && (
                            <Text variant="body-sm" color="textLabel" textAlign="center" maxW="320px">
                                {welcomeMessage}
                            </Text>
                        )}
                    </VStack>

                    <SuggestedQuestions questions={suggestedQuestions ?? []} onQuestionClick={sendMessage} />
                </VStack>
            ) : (
                <Box
                    ref={messagesContainerRef}
                    flex={1}
                    overflowY="auto"
                    p={4}
                    pb={5}
                    display="flex"
                    flexDirection="column"
                >
                    <VStack align="stretch" spacing={4} w="100%">
                        {messages.map((message) => (
                            <ChatMessageItem
                                key={message.id}
                                message={message}
                                onResponseSelect={onResponseSelect ? handleResponseSelect : undefined}
                            />
                        ))}
                    </VStack>
                </Box>
            )}

            <Divider borderColor="borderSubtle" />
            <ChatInput
                placeholder={isDisabled && disabledMessage ? disabledMessage : placeholder}
                isLoading={isLoading}
                disabled={isDisabled}
                onSend={sendMessage}
            />
        </Box>
    );
};
