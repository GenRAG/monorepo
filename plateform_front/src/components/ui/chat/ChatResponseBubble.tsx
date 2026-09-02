import React from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { getMarkdownStyles } from "./markdownStyles";

interface ChatResponseBubbleProps {
    response: string;
    isError?: boolean;
}

const ChatResponseBubble: React.FC<ChatResponseBubbleProps> = ({ response, isError }) => {
    const { colorMode } = useColorMode();
    const bg = isError ? "bubbleErrorBg" : "surfaceSubtle";
    const borderColor = isError ? "borderError" : "borderDivider";
    const textColor = isError ? "textError" : "textSecondary";

    return (
        <Box
            p={4}
            borderRadius="12px"
            borderBottomLeftRadius="2px"
            borderWidth="1px"
            borderStyle="solid"
            borderColor={borderColor}
            bg={bg}
        >
            <Box fontSize="sm" color={textColor} sx={isError ? undefined : getMarkdownStyles(colorMode)}>
                {isError ? response : <ReactMarkdown>{response}</ReactMarkdown>}
            </Box>
        </Box>
    );
};

export default ChatResponseBubble;
