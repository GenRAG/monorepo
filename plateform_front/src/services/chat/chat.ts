import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";

export interface ChatResponse {
    response: string;
    isImproved?: boolean;
}

export interface ChatMessageHistory {
    id: string;
    question: string;
    response: string;
    timestamp: number;
    isImproved?: boolean;
}

export interface ChatMetadata {
    id: string;
    title: string;
    sharedBy: string;
}

export interface AssistantPreview {
    id: string;
    title: string;
    lastMessage?: string;
    updatedAt?: string;
    sharedBy?: string;
}

export interface ConversationPreview {
    id: string;
    title?: string;
    lastMessage?: string;
    updatedAt?: string;
}

export const extendedChatApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getAssistantMetadata: builder.query<ChatMetadata | null, string>({
            query: (assistantId) => ({
                url: `/assistants/${assistantId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, assistantId) => [{ type: Tag.Chat, id: assistantId }],
        }),

        getAssistantsList: builder.query<AssistantPreview[], void>({
            query: () => ({
                url: "/assistants",
                method: "GET",
            }),
            providesTags: [{ type: Tag.Chat, id: "ASSISTANTS" }],
        }),

        getConversationsForAssistant: builder.query<ConversationPreview[], string>({
            query: (assistantId) => ({
                url: `/assistants/${assistantId}/conversations`,
                method: "GET",
            }),
            providesTags: (_result, _error, assistantId) => [{ type: Tag.Chat, id: `${assistantId}-conversations` }],
        }),

        getChatHistory: builder.query<ChatMessageHistory[], { assistantId: string; conversationId: string }>({
            query: ({ assistantId, conversationId }) => ({
                url: `/assistants/${assistantId}/conversations/${conversationId}/messages`,
                method: "GET",
            }),
            providesTags: (_result, _error, { assistantId, conversationId }) => [
                { type: Tag.Chat, id: `${assistantId}-${conversationId}-messages` },
            ],
        }),
    }),
});

export const {
    useGetAssistantMetadataQuery,
    useGetChatHistoryQuery,
    useGetAssistantsListQuery,
    useGetConversationsForAssistantQuery,
} = extendedChatApi;
