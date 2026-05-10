import React, { useRef, useEffect, useCallback } from "react";
import {
    Box,
    Divider,
    Text,
    VStack,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
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
    icon?: LucideIcon;
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
    icon: IconComponent = Bot,
}) => {
    const { colorMode } = useColorMode();
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, isLoading } = useChat({ getResponse });

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
            borderColor={borderColor}
            borderRadius="12px"
            bg={colorMode === "dark" ? "grey.900" : "white"}
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            {messages.length === 0 ? (
                <VStack
                    flex={1}
                    justify="center"
                    align="center"
                    spacing={5}
                    p={6}
                >
                    <Box
                        p={4}
                        bg={
                            colorMode === "dark"
                                ? "rgba(72, 187, 120, 0.12)"
                                : "rgba(40, 158, 87, 0.1)"
                        }
                        border="1px solid"
                        borderRadius="8px"
                        borderColor={
                            colorMode === "dark" ? "green.700" : "green.300"
                        }
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <Box
                            as={IconComponent}
                            boxSize={8}
                            color={
                                colorMode === "dark" ? "green.400" : "green.500"
                            }
                        />
                    </Box>

                    <VStack spacing={1}>
                        <Text
                            fontWeight="bold"
                            fontSize="md"
                            color={colorMode === "dark" ? "white" : "grey.900"}
                            textAlign="center"
                        >
                            {title}
                        </Text>
                        {welcomeMessage && (
                            <Text
                                fontSize="sm"
                                color={
                                    colorMode === "dark"
                                        ? "grey.400"
                                        : "grey.500"
                                }
                                textAlign="center"
                                maxW="320px"
                            >
                                {welcomeMessage}
                            </Text>
                        )}
                    </VStack>

                    <SuggestedQuestions
                        questions={suggestedQuestions ?? []}
                        onQuestionClick={sendMessage}
                    />
                </VStack>
            ) : (
                <Box
                    ref={messagesContainerRef}
                    flex={1}
                    overflowY="auto"
                    p={4}
                    pb={0}
                    display="flex"
                    flexDirection="column"
                >
                    <VStack align="stretch" spacing={4} w="100%">
                        {messages.map((message) => (
                            <ChatMessageItem
                                key={message.id}
                                message={message}
                                onResponseSelect={
                                    onResponseSelect
                                        ? handleResponseSelect
                                        : undefined
                                }
                            />
                        ))}
                    </VStack>
                </Box>
            )}

            <Divider
                borderColor={colorMode === "dark" ? "grey.700" : "grey.100"}
            />
            <ChatInput
                placeholder={placeholder}
                isLoading={isLoading}
                disabled={disabled}
                onSend={sendMessage}
            />
        </Box>
    );
};
