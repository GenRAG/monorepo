import React from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { ChatMessage } from "hooks/chat";
import ChatResponseBubble from "./ChatResponseBubble";

interface ChatMessageItemProps {
    message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
    return (
        <React.Fragment>
            <VStack align="flex-end" spacing={1} alignSelf="flex-end" maxW="80%">
                <Text fontSize="xs" color="textLabel">
                    Vous
                </Text>
                <Box p={3} bg="bubbleAccentBg" borderRadius="12px" borderBottomRightRadius="2px">
                    <Text fontSize="sm" color="bubbleAccentText">
                        {message.question}
                    </Text>
                </Box>
            </VStack>

            {message.response !== "" && (
                <VStack align="flex-start" spacing={1} maxW="80%">
                    <Text fontSize="xs" color="textLabel">
                        Assistant
                    </Text>
                    <ChatResponseBubble response={message.response} isError={message.error} />
                    {message.sources && message.sources.length > 0 && (
                        <HStack spacing={2} flexWrap="wrap">
                            {message.sources.map((source) => (
                                <Box key={source.index} px={2} py={1} borderRadius="4px" bg="surfaceSubtle">
                                    <Text fontSize="xs" color="textBody">
                                        {source.title}
                                    </Text>
                                </Box>
                            ))}
                        </HStack>
                    )}
                </VStack>
            )}
        </React.Fragment>
    );
};

export default ChatMessageItem;
