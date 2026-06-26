import React from "react";
import { Box } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { getMarkdownStyles } from "./markdownStyles";
import { useIsDark } from "hooks/useIsDark";

interface ChatResponseBubbleProps {
    response: string;
    isError?: boolean;
}

const ChatResponseBubble: React.FC<ChatResponseBubbleProps> = ({ response, isError }) => {
    const isDark = useIsDark();

    const bg = isError ? (isDark ? "rgba(254,202,202,0.08)" : "red.50") : isDark ? "grey.800" : "grey.25";
    const borderColor = isError ? (isDark ? "red.800" : "red.200") : isDark ? "grey.700" : "grey.200";
    const textColor = isError ? (isDark ? "red.300" : "red.600") : isDark ? "grey.200" : "grey.700";

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
            <Box
                fontSize="sm"
                color={textColor}
                sx={isError ? undefined : getMarkdownStyles(isDark ? "dark" : "light")}
            >
                {isError ? response : <ReactMarkdown>{response}</ReactMarkdown>}
            </Box>
        </Box>
    );
};

export default ChatResponseBubble;
