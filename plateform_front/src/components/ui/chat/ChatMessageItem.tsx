import React from "react";
import { Box, Text, VStack, useColorMode } from "@chakra-ui/react";
import { ChatMessage } from "hooks/chat";
import ChatResponseBubble from "./ChatResponseBubble";

interface ChatMessageItemProps {
    message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const labelColor = isDark ? "grey.500" : "grey.400";

    return (
        <React.Fragment>
            <VStack align="flex-end" spacing={1} alignSelf="flex-end" maxW="80%">
                <Text fontSize="xs" color={labelColor}>
                    Vous
                </Text>
                <Box p={3} bg={isDark ? "green.700" : "green.100"} borderRadius="12px" borderBottomRightRadius="2px">
                    <Text fontSize="sm" color={isDark ? "grey.100" : "green.800"}>
                        {message.question}
                    </Text>
                </Box>
            </VStack>

            <VStack align="flex-start" spacing={1} maxW="80%">
                <Text fontSize="xs" color={labelColor}>
                    Assistant
                </Text>
                <ChatResponseBubble response={message.response} isError={message.error} />
            </VStack>
        </React.Fragment>
    );
};

export default ChatMessageItem;
