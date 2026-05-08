import React, { useState } from "react";
import {
    Box,
    HStack,
    Icon,
    IconButton,
    Text,
    Textarea,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { Copy, Pencil, Sparkles } from "lucide-react";
import Button from "components/System/Atoms/Button";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { ChatMessage } from "hooks/useChat";

interface ChatMessageItemProps {
    message: ChatMessage;
    isLastMessage: boolean;
    isLoading: boolean;
    isMobile: boolean;
    canEdit: boolean;
    editingMessageId: string | null;
    editType: "question" | "response";
    editContent: string;
    onEditContentChange: (value: string) => void;
    onCopy: (text: string) => void;
    onStartEdit: (message: ChatMessage, type: "question" | "response") => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
    message,
    isLastMessage,
    isLoading,
    isMobile,
    canEdit,
    editingMessageId,
    editType,
    editContent,
    onEditContentChange,
    onCopy,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
}) => {
    const { colorMode } = useColorMode();
    const [isHovering, setIsHovering] = useState(false);
    const [hoveredResponseIndex, setHoveredResponseIndex] = useState<
        number | null
    >(null);

    return (
        <React.Fragment>
            <Box
                position="relative"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                w="max-content"
                maxW="400px"
                minW={0}
                ml="auto"
            >
                <Box
                    p={isMobile ? 2 : 4}
                    bg={currentDarkTheme.primary}
                    borderRadius="12px"
                    alignSelf="flex-end"
                    maxW="100%"
                    overflow="hidden"
                >
                    {editingMessageId === message.id &&
                    editType === "question" ? (
                        <VStack align="stretch" spacing={2}>
                            <Textarea
                                value={editContent}
                                onChange={(e) =>
                                    onEditContentChange(e.target.value)
                                }
                                size="sm"
                                bg="white"
                                color="grey.900"
                                minH="60px"
                                maxW="100%"
                                resize="none"
                            />
                            <HStack justify="flex-end">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onCancelEdit}
                                >
                                    Annuler
                                </Button>
                                <Button size="sm" onClick={onSaveEdit}>
                                    Enregistrer
                                </Button>
                            </HStack>
                        </VStack>
                    ) : (
                        <Text
                            fontSize="sm"
                            color="white"
                            textAlign="right"
                            wordBreak="break-all"
                            overflowWrap="anywhere"
                        >
                            {message.question}
                        </Text>
                    )}
                </Box>
                {editingMessageId !== message.id && isHovering && (
                    <HStack
                        spacing={1}
                        justify="flex-end"
                        mt={1}
                        color={colorMode === "dark" ? "grey.400" : "grey.500"}
                    >
                        <IconButton
                            aria-label="Copier"
                            icon={<Copy size={14} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => onCopy(message.question)}
                        />
                        {canEdit && (
                            <IconButton
                                aria-label="Modifier"
                                icon={<Pencil size={14} />}
                                size="xs"
                                variant="ghost"
                                onClick={() => onStartEdit(message, "question")}
                            />
                        )}
                    </HStack>
                )}
            </Box>

            {message.response.length > 0 && (
                <VStack align="flex-start" maxW="400px" minW={0} spacing={2}>
                    {message.response.map((response, responseIndex) => (
                        <Box
                            key={responseIndex}
                            position="relative"
                            w="max-content"
                            maxW="100%"
                            minW={0}
                            onMouseEnter={() =>
                                setHoveredResponseIndex(responseIndex)
                            }
                            onMouseLeave={() => setHoveredResponseIndex(null)}
                        >
                            <Box
                                p={4}
                                bg={
                                    colorMode === "dark"
                                        ? "grey.700"
                                        : "grey.50"
                                }
                                borderRadius="12px"
                                position="relative"
                                maxW="100%"
                                overflow="hidden"
                            >
                                <Text
                                    fontSize="sm"
                                    color={
                                        colorMode === "dark"
                                            ? "grey.200"
                                            : "grey.700"
                                    }
                                    wordBreak="break-all"
                                    overflowWrap="anywhere"
                                >
                                    {response}
                                </Text>
                            </Box>
                            <HStack
                                px="2"
                                justify="space-between"
                                align="center"
                                mt={1}
                                spacing={2}
                                color={
                                    colorMode === "dark"
                                        ? "grey.400"
                                        : "grey.500"
                                }
                            >
                                <Text fontSize="xs">
                                    {new Date().toLocaleTimeString()}
                                </Text>
                                {hoveredResponseIndex === responseIndex && (
                                    <IconButton
                                        aria-label="Copier"
                                        icon={<Copy size={14} />}
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => onCopy(response)}
                                    />
                                )}
                            </HStack>
                        </Box>
                    ))}
                </VStack>
            )}

            {message.response.length === 0 && isLoading && isLastMessage && (
                <HStack align="flex-start" spacing={2} maxW="400px" minW={0}>
                    <Box
                        p={2}
                        bg={currentDarkTheme.primary}
                        borderRadius="12px"
                        flexShrink={0}
                    >
                        <Icon as={Sparkles} boxSize={4} color="white" />
                    </Box>
                    <Box
                        p={4}
                        bg={colorMode === "dark" ? "grey.700" : "grey.50"}
                        borderRadius="12px"
                        minW={0}
                    >
                        <Text
                            fontSize="sm"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.500"
                            }
                            fontStyle="italic"
                        >
                            Thinking...
                        </Text>
                    </Box>
                </HStack>
            )}
        </React.Fragment>
    );
};
