import { ChatMessage } from "hooks/useChat";

export interface AssistantPreview {
    id: string;
    title: string;
}

export interface ConversationPreview {
    id: string;
    title?: string;
    lastMessage?: string;
    updatedAt?: string;
}

export interface DeployedChatInterfaceProps {
    messages: ChatMessage[];
    assistants: AssistantPreview[];
    currentAssistantId: string;
    onAssistantSelect: (assistantId: string) => void;
    conversations: ConversationPreview[];
    currentConversationId: string | null;
    onConversationSelect: (conversationId: string) => void;
    onNewConversation?: () => void;
    onSendMessage: (question: string) => void;
    onUpdateMessage?: (
        messageId: string,
        updates: { question?: string; response?: string[] },
    ) => void;
    isLoading?: boolean;
    placeholder?: string;
    welcomeMessage?: string;
    title?: string;
    showOnlineBadge?: boolean;
}
