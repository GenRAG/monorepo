import React from "react";
import { Box, Text, VStack, useColorMode } from "@chakra-ui/react";
import { ChatMessage } from "hooks/useChat";
import ChatResponseBubble from "./ChatResponseBubble";

interface ChatMessageItemProps {
    message: ChatMessage;
    onResponseSelect?: (responseIndex: number, messageId: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
    message,
    onResponseSelect,
}) => {
    const { colorMode } = useColorMode();
    const labelColor = colorMode === "dark" ? "grey.500" : "grey.400";

    return (
        <React.Fragment>
            <VStack
                align="flex-end"
                spacing={1}
                alignSelf="flex-end"
                maxW="80%"
            >
                <Text fontSize="xs" color={labelColor}>
                    Vous
                </Text>
                <Box
                    p={3}
                    bg={colorMode === "dark" ? "green.700" : "green.100"}
                    borderRadius="12px"
                    borderBottomRightRadius="2px"
                >
                    <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "grey.100" : "green.800"}
                    >
                        {message.question}
                    </Text>
                </Box>
            </VStack>

            {message.response.length > 1 && (
                <Text fontSize="sm" color="textmuted">
                    Choisis la réponse qui correspond le mieux à ta question
                    pour nous aider à améliorer l&apos;assistant.
                </Text>
            )}

            <VStack align="flex-start" spacing={1} maxW="80%">
                <Text fontSize="xs" color={labelColor}>
                    Assistant
                </Text>
                <VStack
                    align="flex-start"
                    w="100%"
                    spacing={2}
                    border={
                        message.response.length > 1
                            ? "3px solid rgba(230, 230, 230, 0.46)"
                            : "none"
                    }
                    p={message.response.length > 1 ? 2 : 0}
                    borderRadius="12px"
                >
                    {message.response.map((response, responseIndex) => (
                        <ChatResponseBubble
                            key={responseIndex}
                            response={response}
                            responseIndex={responseIndex}
                            messageId={message.id}
                            onSelect={onResponseSelect}
                        />
                    ))}
                </VStack>
            </VStack>
        </React.Fragment>
    );
};

export default ChatMessageItem;
