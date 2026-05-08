import { Box, Text, VStack, useColorMode } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DeployedChatInterface } from "components/System/Molecules/DeployedChatInterface";
import { useChat } from "hooks/useChat";
import { useUserInfo } from "hooks/useUserInfo";
import {
    useGetChatHistoryQuery,
    useGetAssistantMetadataQuery,
    useGetAssistantsListQuery,
    useGetConversationsForAssistantQuery,
    useSendChatMessageMutation,
} from "services/chat/chat";

const MOCK_ASSISTANTS = [
    { id: "1", title: "Contract Risk Analysis" },
    { id: "2", title: "Marketing Strategy Q1" },
];

const MOCK_CONVERSATIONS: {
    id: string;
    title?: string;
    lastMessage?: string;
    updatedAt?: string;
}[] = [
    {
        id: "conv-1",
        title: "Analyse des clauses",
        lastMessage: "Here are the main clauses...",
        updatedAt: "2026-02-20T14:30:00",
    },
    {
        id: "conv-2",
        title: "Questions sur le contrat",
        lastMessage: "According to the agreement...",
        updatedAt: "2026-02-19T10:00:00",
    },
];

const MOCK_ASSISTANT_TITLES: Record<string, string> = {
    "1": "Contract Risk Analysis",
    "2": "Marketing Strategy Q1",
};

export const Assistant = () => {
    const { assistantId } = useParams<{ assistantId: string }>();
    const navigate = useNavigate();
    const { colorMode } = useColorMode();
    const { name } = useUserInfo();
    const hasAddedHistory = useRef(false);

    const [currentConversationId, setCurrentConversationId] = useState<
        string | null
    >(null);

    const [sendChatMessage] = useSendChatMessageMutation();
    const { data: metadata } = useGetAssistantMetadataQuery(assistantId ?? "", {
        skip: !assistantId,
    });
    const { data: historyData } = useGetChatHistoryQuery(
        {
            assistantId: assistantId ?? "",
            conversationId: currentConversationId ?? "",
        },
        {
            skip: !assistantId || !currentConversationId,
        },
    );
    const { data: assistantsData } = useGetAssistantsListQuery(undefined, {
        skip: false,
    });
    const { data: conversationsData } = useGetConversationsForAssistantQuery(
        assistantId ?? "",
        { skip: !assistantId },
    );

    const assistants = (
        assistantsData && assistantsData.length > 0
            ? assistantsData
            : MOCK_ASSISTANTS
    ).map((a) => ({ id: a.id, title: a.title }));

    const conversations =
        conversationsData && conversationsData.length > 0
            ? conversationsData
            : MOCK_CONVERSATIONS;

    const title =
        metadata?.title ??
        (assistantId
            ? (MOCK_ASSISTANT_TITLES[assistantId] ?? "Assistant")
            : "Assistant");
    const getResponse = useCallback(
        async (question: string) => {
            if (!assistantId) return { response: ["Error: No assistant ID."] };
            const result = await sendChatMessage({
                assistantId,
                conversationId: currentConversationId ?? undefined,
                question,
            }).unwrap();
            return result;
        },
        [assistantId, currentConversationId, sendChatMessage],
    );

    const {
        messages,
        sendMessage,
        isLoading,
        addMessages,
        updateMessage,
        clearMessages,
    } = useChat({
        getResponse,
        initialMessages: [],
    });

    const handleUpdateMessage = useCallback(
        (
            messageId: string,
            updates: { question?: string; response?: string[] },
        ) => {
            updateMessage(messageId, updates);
        },
        [updateMessage],
    );

    const handleConversationSelect = useCallback(
        (conversationId: string) => {
            setCurrentConversationId(conversationId);
            clearMessages();
            hasAddedHistory.current = false;
        },
        [clearMessages],
    );

    const handleNewConversation = useCallback(() => {
        setCurrentConversationId(null);
        clearMessages();
        hasAddedHistory.current = false;
    }, [clearMessages]);

    useEffect(() => {
        if (
            currentConversationId &&
            historyData &&
            historyData.length > 0 &&
            !hasAddedHistory.current
        ) {
            hasAddedHistory.current = true;
            addMessages(
                historyData.map((msg) => ({
                    id: msg.id,
                    question: msg.question,
                    response: msg.response,
                    timestamp: msg.timestamp,
                    isImproved: msg.isImproved,
                })),
            );
        }
    }, [currentConversationId, historyData, addMessages]);

    if (!assistantId) {
        return (
            <Box p={6}>
                <Text color="red.500">Assistant ID manquant.</Text>
            </Box>
        );
    }

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
            bg={colorMode === "dark" ? "grey.950" : "grey.50"}
        >
            <Box
                flex={1}
                minH={0}
                p={4}
                w="100%"
                display="flex"
                flexDirection="column"
                overflow="hidden"
            >
                <Box
                    flex={1}
                    minH={0}
                    display="flex"
                    flexDirection="column"
                    w="100%"
                    alignSelf="center"
                >
                    <DeployedChatInterface
                        title={title}
                        emptyStateTitle={
                            name
                                ? `What's on your mind, ${name}?`
                                : "What's on your mind?"
                        }
                        messages={messages}
                        assistants={assistants}
                        currentAssistantId={assistantId}
                        onAssistantSelect={(id) =>
                            navigate(`/assistants/${id}`)
                        }
                        conversations={conversations}
                        currentConversationId={currentConversationId}
                        onConversationSelect={handleConversationSelect}
                        onNewConversation={handleNewConversation}
                        onSendMessage={sendMessage}
                        onUpdateMessage={handleUpdateMessage}
                        isLoading={isLoading}
                        placeholder="Ask me anything..."
                        welcomeMessage={
                            name
                                ? `Hello ${name} ! Ask me anything about this assistant.`
                                : "Hello ! Ask me anything about this assistant."
                        }
                    />
                </Box>
            </Box>
        </VStack>
    );
};
