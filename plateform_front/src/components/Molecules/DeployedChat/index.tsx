import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    Box,
    Flex,
    IconButton,
    useColorMode,
    useDisclosure,
} from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { useAppResponsive } from "hooks/useAppResponsive";
import useThemedToast from "hooks/useThemedToast";
import { ChatMessage } from "hooks/useChat";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessagesList } from "./ChatMessagesList";
import { DeployedChatSidebar } from "./DeployedChatSidebar";
import type { DeployedChatInterfaceProps } from "./types";

export { type AssistantPreview, type ConversationPreview } from "./types";

export const DeployedChatInterface: React.FC<DeployedChatInterfaceProps> = ({
    messages,
    assistants,
    currentAssistantId,
    onAssistantSelect,
    conversations,
    currentConversationId,
    onConversationSelect,
    onNewConversation,
    onSendMessage,
    onUpdateMessage,
    isLoading = false,
    placeholder = "Posez votre question...",
    welcomeMessage,
    title = "Assistant",
    showOnlineBadge = true,
}) => {
    const { colorMode } = useColorMode();
    const toast = useThemedToast();
    const [question, setQuestion] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isMobile = useAppResponsive({ base: true, lg: false });
    const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({
        defaultIsOpen: !isMobile,
    });

    const [editingMessageId, setEditingMessageId] = useState<string | null>(
        null,
    );
    const [editContent, setEditContent] = useState("");
    const [editType, setEditType] = useState<"question" | "response">(
        "question",
    );

    const lastMessage = messages[messages.length - 1];
    const canEditMessage = (messageId: string) =>
        onUpdateMessage && lastMessage?.id === messageId;

    const scrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, []);

    useEffect(() => {
        void scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (question.trim() && !isLoading) {
            onSendMessage(question);
            setQuestion("");
        }
    };

    const copyToClipboard = useCallback(
        (text: string) => {
            void navigator.clipboard.writeText(text);
            void toast({
                title: "Copié",
                description: "Le contenu a été copié dans le presse-papiers.",
                status: "success",
            });
        },
        [toast],
    );

    const startEdit = (message: ChatMessage, type: "question" | "response") => {
        if (!canEditMessage(message.id)) return;
        setEditingMessageId(message.id);
        setEditType(type);
        setEditContent(
            type === "question"
                ? message.question
                : message.response.join("\n"),
        );
    };

    const saveEdit = () => {
        if (!editingMessageId || !onUpdateMessage) return;
        if (editType === "question") {
            onUpdateMessage(editingMessageId, { question: editContent });
        } else {
            onUpdateMessage(editingMessageId, {
                response: [editContent.trim()],
            });
        }
        setEditingMessageId(null);
        setEditContent("");
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditContent("");
    };

    return (
        <Flex
            w="100%"
            maxW="100%"
            minW={0}
            h="100%"
            minH="600px"
            border={`1px solid ${colorMode === "dark" ? "grey.600" : "#E7E7E7"}`}
            borderRadius="12px"
            bg={colorMode === "dark" ? "grey.800" : "white"}
            overflow="hidden"
            position="relative"
        >
            {isSidebarOpen && isMobile && (
                <Box
                    position="absolute"
                    inset={0}
                    bg="blackAlpha.500"
                    zIndex={1}
                    onClick={toggleSidebar}
                />
            )}
            <DeployedChatSidebar
                assistants={assistants}
                currentAssistantId={currentAssistantId}
                onAssistantSelect={onAssistantSelect}
                conversations={conversations}
                currentConversationId={currentConversationId}
                onConversationSelect={onConversationSelect}
                onNewConversation={onNewConversation}
                onClose={toggleSidebar}
                isOpen={isSidebarOpen}
            />

            {!isSidebarOpen && (
                <Box
                    position="absolute"
                    left={0}
                    top={0}
                    bottom={0}
                    w="32px"
                    display="flex"
                    alignItems="center"
                    zIndex={2}
                    borderRight={`1px solid`}
                    borderColor={colorMode === "dark" ? "grey.600" : "grey.100"}
                    bg={colorMode === "dark" ? "grey.800" : "white"}
                    _hover={{
                        bg: colorMode === "dark" ? "grey.700" : "grey.100",
                    }}
                    onClick={toggleSidebar}
                    cursor="pointer"
                >
                    <IconButton
                        aria-label="Ouvrir les assistants"
                        icon={<ChevronRight size={16} />}
                        size="xs"
                        variant="ghost"
                    />
                </Box>
            )}

            <Flex flex={1} flexDirection="column" minW={0}>
                <ChatHeader
                    title={title}
                    showOnlineBadge={showOnlineBadge}
                    isMobile={isMobile}
                />
                <ChatMessagesList
                    messages={messages}
                    welcomeMessage={welcomeMessage}
                    isLoading={isLoading}
                    isMobile={isMobile}
                    editingMessageId={editingMessageId}
                    editType={editType}
                    editContent={editContent}
                    //canEditMessage={canEditMessage}
                    canEditMessage={() => false}
                    onEditContentChange={setEditContent}
                    onCopy={copyToClipboard}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    messagesContainerRef={messagesContainerRef}
                />
                <ChatInput
                    value={question}
                    onChange={setQuestion}
                    onSubmit={handleSubmit}
                    placeholder={placeholder}
                    isLoading={isLoading}
                    isMobile={isMobile}
                />
            </Flex>
        </Flex>
    );
};
