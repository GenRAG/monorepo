import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "hooks/useChat";
import { useUserInfo } from "hooks/useUserInfo";
import {
    useGetChatHistoryQuery,
    useGetAssistantMetadataQuery,
    useGetConversationsForAssistantQuery,
} from "services/chat/chat";
import { useAssistantQuery } from "hooks/useAssistantQuery";
import AssistantHome from "./AssistantHome";
import AssistantChatLayout from "./AssistantChatLayout";

export const Assistant = () => {
    const { assistantId } = useParams<{ assistantId: string }>();
    const navigate = useNavigate();
    const { name } = useUserInfo();

    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const currentConversationIdRef = useRef<string | null>(null);

    useEffect(() => {
        currentConversationIdRef.current = currentConversationId;
    }, [currentConversationId]);

    const { sendQuery } = useAssistantQuery(assistantId ?? "");

    const { data: metadata } = useGetAssistantMetadataQuery(assistantId ?? "", { skip: !assistantId });
    const { data: conversationsData = [], refetch: refetchConversations } = useGetConversationsForAssistantQuery(
        assistantId ?? "",
        { skip: !assistantId },
    );
    const { data: historyData, isFetching: isHistoryFetching } = useGetChatHistoryQuery(
        { assistantId: assistantId ?? "", conversationId: currentConversationId ?? "" },
        { skip: !assistantId || !currentConversationId },
    );

    const getResponse = useCallback(
        async (question: string, onChunk: (partial: string) => void) => {
            if (!assistantId) return { response: ["Erreur : ID assistant manquant."] };
            const wasNewConversation = currentConversationIdRef.current === null;
            const { text, conversationId: newConvId } = await sendQuery(
                question,
                currentConversationIdRef.current,
                onChunk,
            );
            currentConversationIdRef.current = newConvId;
            setCurrentConversationId(newConvId);
            if (wasNewConversation) void refetchConversations();
            return { response: [text] };
        },
        [assistantId, sendQuery, refetchConversations],
    );

    const { messages, setMessages, sendMessage, isLoading } = useChat({ getResponse });

    useEffect(() => {
        if (!isHistoryFetching && historyData) {
            setMessages(historyData);
        }
    }, [historyData, isHistoryFetching, setMessages]);

    const handleConversationSelect = (convId: string) => {
        if (convId === currentConversationId) return;
        setMessages([]);
        setCurrentConversationId(convId);
    };

    const handleNewConversation = () => {
        setCurrentConversationId(null);
        setMessages([]);
    };

    if (!assistantId) {
        void navigate("/assistants");
        return null;
    }

    const showChat = messages.length > 0 || currentConversationId !== null || isHistoryFetching;
    const title = metadata?.title ?? "Assistant";
    const sharedBy = metadata?.sharedBy;

    if (showChat) {
        return (
            <AssistantChatLayout
                title={title}
                sharedBy={sharedBy}
                userName={name}
                messages={messages}
                conversations={conversationsData}
                currentConversationId={currentConversationId}
                isLoading={isLoading || isHistoryFetching}
                onSend={sendMessage}
                onSelectConversation={handleConversationSelect}
                onNewConversation={handleNewConversation}
            />
        );
    }

    return (
        <AssistantHome
            title={title}
            sharedBy={sharedBy}
            conversations={conversationsData}
            isLoading={isLoading}
            onSend={sendMessage}
            onSelectConversation={handleConversationSelect}
        />
    );
};
