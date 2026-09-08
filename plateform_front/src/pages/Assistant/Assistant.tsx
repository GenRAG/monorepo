import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat, useAssistantQuery, RagSource, ChatResponseMeta, ThinkingEvent } from "hooks/chat";
import {
    useGetChatHistoryQuery,
    useGetAssistantMetadataQuery,
    useGetConversationsForAssistantQuery,
} from "services/chat/chat";
import AssistantHome from "./AssistantHome";
import AssistantChatLayout from "components/Assistant/AssistantChatLayout";

export const Assistant = () => {
    const { assistantId, conversationId: conversationIdParam } = useParams<{
        assistantId: string;
        conversationId?: string;
    }>();
    const navigate = useNavigate();

    const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationIdParam ?? null);
    const currentConversationIdRef = useRef<string | null>(null);

    useEffect(() => {
        currentConversationIdRef.current = currentConversationId;
    }, [currentConversationId]);

    const { sendQuery, isOutOfCredits } = useAssistantQuery(assistantId ?? "");

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
        async (
            question: string,
            onChunk: (partial: string) => void,
            onSources?: (sources: RagSource[]) => void,
            onMeta?: (meta: ChatResponseMeta) => void,
            onThinking?: (event: ThinkingEvent) => void,
        ) => {
            if (!assistantId) {
                throw new Error("ID assistant manquant.");
            }

            const wasNewConversation = currentConversationIdRef.current === null;

            const {
                text,
                conversationId: newConvId,
                durationMs,
            } = await sendQuery(question, currentConversationIdRef.current, onChunk, onSources, onThinking);
            onMeta?.({ durationMs });
            currentConversationIdRef.current = newConvId;
            setCurrentConversationId(newConvId);

            if (wasNewConversation) {
                void refetchConversations();
            }
            return text;
        },
        [assistantId, sendQuery, refetchConversations],
    );

    const { messages, setMessages, sendMessage, isLoading } = useChat({ getResponse });

    useEffect(() => {
        if (!isHistoryFetching && historyData) {
            setMessages(historyData.map((m) => ({ ...m, error: false })));
        }
    }, [historyData, isHistoryFetching, setMessages]);

    const handleConversationSelect = (convId: string) => {
        if (convId === currentConversationId) return;
        setMessages([]);
        setCurrentConversationId(convId);
        void navigate(`/assistants/${assistantId}/conversations/${convId}`);
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
    const agentVersion = metadata?.version !== undefined ? `v${metadata.version}` : undefined;

    if (showChat) {
        return (
            <AssistantChatLayout
                assistantId={assistantId}
                agentVersion={agentVersion}
                title={title}
                sharedBy={sharedBy}
                messages={messages}
                conversations={conversationsData}
                currentConversationId={currentConversationId}
                isLoading={isLoading}
                isHistoryLoading={isHistoryFetching}
                onSend={sendMessage}
                onSelectConversation={handleConversationSelect}
                onNewConversation={handleNewConversation}
                disabled={isOutOfCredits}
                disabledMessage="Crédits épuisés"
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
            disabled={isOutOfCredits}
            disabledMessage="Crédits épuisés — contactez l'administrateur pour continuer"
        />
    );
};
