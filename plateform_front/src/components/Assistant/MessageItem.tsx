import React from "react";
import { Box, HStack, Text, useColorMode } from "@chakra-ui/react";
import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "hooks/chat";
import { getMarkdownStyles } from "components/ui/chat/markdownStyles";
import BoxIcon from "components/ui/BoxIcon";

const getInitials = (name: string) =>
    name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

interface MessageItemProps {
    msg: ChatMessage;
    agentTitle: string;
    userName: string;
    isLoading: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ msg, agentTitle, userName, isLoading }) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const userInitials = getInitials(userName || "U");

    return (
        <Box mb={6}>
            <HStack justify="flex-end" mb={4} align="flex-start">
                <Box
                    maxW="65%"
                    px={4}
                    py={3}
                    borderRadius="16px"
                    borderBottomRightRadius="4px"
                    bg={isDark ? "rgba(255,255,255,0.08)" : "grey.50"}
                >
                    <HStack spacing={2} mb={2} justify="flex-end">
                        <Text fontSize="10px" color={isDark ? "grey.600" : "grey.400"}>
                            {formatTime(msg.timestamp)}
                        </Text>
                        <Text fontSize="xs" fontWeight="600" color={isDark ? "grey.300" : "grey.700"}>
                            {userName}
                        </Text>
                    </HStack>
                    <Text fontSize="sm" color={isDark ? "grey.100" : "grey.800"} lineHeight="1.6">
                        {msg.question}
                    </Text>
                </Box>
                <BoxIcon letters={userInitials} />
            </HStack>

            {msg.response ? (
                <HStack align="flex-start" spacing={3}>
                    <BoxIcon icon={Bot} />
                    <Box
                        flex={1}
                        minW={0}
                        maxW="75%"
                        bg={isDark ? "grey.900" : "grey.50"}
                        px={4}
                        py={3}
                        borderRadius="16px"
                        borderBottomLeftRadius="4px"
                    >
                        <HStack spacing={2} mb={2}>
                            <Text fontSize="xs" fontWeight="600" color={isDark ? "grey.300" : "grey.700"}>
                                {agentTitle}
                            </Text>
                            <Text fontSize="10px" color={isDark ? "grey.600" : "grey.400"}>
                                {formatTime(msg.timestamp)}
                            </Text>
                        </HStack>
                        <Box fontSize="sm" color={isDark ? "grey.200" : "grey.700"} lineHeight="1.75" sx={getMarkdownStyles(colorMode)}>
                            <ReactMarkdown>{msg.response}</ReactMarkdown>
                        </Box>
                    </Box>
                </HStack>
            ) : isLoading ? (
                <HStack align="flex-start" spacing={3}>
                    <BoxIcon icon={Bot} />
                    <Box flex={1} pt={1}>
                        <HStack spacing={1.5}>
                            {[0, 1, 2].map((i) => (
                                <Box
                                    key={i}
                                    w="7px"
                                    h="7px"
                                    borderRadius="full"
                                    bg="#34D3A9"
                                    opacity={0.7}
                                    animation={`pulse 1.2s ease-in-out ${i * 0.2}s infinite`}
                                />
                            ))}
                        </HStack>
                    </Box>
                </HStack>
            ) : null}
        </Box>
    );
};

export default MessageItem;
