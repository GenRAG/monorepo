import React from "react";
import { Box, VStack } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { getMarkdownStyles } from "./markdownStyles";
import { useIsDark } from "hooks/useIsDark";

interface ChatResponseBubbleProps {
    response: string;
    responseIndex: number;
    messageId: string;
    onSelect?: (responseIndex: number, messageId: string) => void;
}

const ChatResponseBubble: React.FC<ChatResponseBubbleProps> = ({ response, responseIndex, messageId, onSelect }) => {
    const isDark = useIsDark();
    const colorMode = isDark ? "dark" : "light";
    const containerStyles = {
        bg: isDark ? "grey.800" : "grey.25",
        borderColor: isDark ? "grey.700" : "grey.200",
    };

    const isSelectable = !!onSelect;

    return (
        <Box
            p={4}
            borderRadius="12px"
            borderBottomLeftRadius="2px"
            border="1px solid"
            onClick={isSelectable ? () => onSelect(responseIndex, messageId) : undefined}
            {...containerStyles}
        >
            <VStack align="flex-start" spacing={2}>
                <Box
                    fontSize="sm"
                    color={colorMode === "dark" ? "grey.200" : "grey.700"}
                    sx={getMarkdownStyles(colorMode)}
                >
                    <ReactMarkdown>{response}</ReactMarkdown>
                </Box>
            </VStack>
        </Box>
    );
};

export default ChatResponseBubble;
