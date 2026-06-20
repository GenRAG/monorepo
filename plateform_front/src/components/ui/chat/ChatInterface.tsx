import React, { useRef, useEffect } from "react";
import { Box, Divider, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Bot, LucideIcon } from "lucide-react";
import { ChatMessage, UseChatOptions, useChat } from "hooks/chat";
import ChatMessageItem from "./ChatMessageItem";
import ChatInput from "./ChatInput";
import SuggestedQuestions from "./SuggestedQuestions";

interface ChatInterfaceProps {
    getResponse: UseChatOptions["getResponse"];
    onMessagesChange?: (messages: ChatMessage[]) => void;
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

    const { messages, sendMessage, isLoading } = useChat({ getResponse, initialMessages });

    const isDisabled = disabled || (maxMessages !== undefined && messages.length >= maxMessages);

    useEffect(() => {
        onMessagesChange?.(messages);
    }, [messages, onMessagesChange]);

    useEffect(() => {
        messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    return (
        <Box
            w="100%"
            h={fullHeight ? "100%" : height}
            minH={fullHeight && !compact ? "600px" : undefined}
            borderWidth="1px"
            borderStyle="solid"
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
                        borderWidth="1px"
                        borderStyle="solid"
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
                            <ChatMessageItem key={message.id} message={message} />
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
