import { backendApi } from "services/api";

export interface ChatResponse {
    response: string[];
    isImproved?: boolean;
}

export interface ChatMessageHistory {
    id: string;
    question: string;
    response: string[];
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

interface SendChatMessageParams {
    assistantId: string;
    conversationId?: string;
    question: string;
}

export const extendedChatApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        sendChatMessage: builder.mutation<ChatResponse, SendChatMessageParams>({
            query: ({ assistantId, conversationId, question }) => ({
                url: conversationId
                    ? `/v1/assistants/${assistantId}/conversations/${conversationId}/messages`
                    : `/v1/assistants/${assistantId}/chat`,
                method: "POST",
                body: { question },
            }),
            transformResponse: (response: {
                response?: string[];
                answer?: string;
                isImproved?: boolean;
            }) => ({
                response: Array.isArray(response.response)
                    ? response.response
                    : [response.response ?? response.answer ?? ""],
                isImproved: response.isImproved,
            }),
        }),

        getChatMetadata: builder.query<ChatMetadata | null, string>({
            query: (id) => ({
                url: `/v1/chats/${id}`,
                method: "GET",
            }),
            transformResponse: (response: ChatMetadata | null) => response,
            providesTags: (_result, _error, id) => [{ type: "Chat", id }],
        }),

        getAssistantMetadata: builder.query<ChatMetadata | null, string>({
            query: (assistantId) => ({
                url: `/v1/assistants/${assistantId}`,
                method: "GET",
            }),
            transformResponse: (response: ChatMetadata | null) => response,
            providesTags: (_result, _error, assistantId) => [
                { type: "Chat", id: assistantId },
            ],
        }),

        getAssistantsList: builder.query<AssistantPreview[], void>({
            query: () => ({
                url: "/v1/assistants",
                method: "GET",
            }),
            transformResponse: (
                response:
                    | AssistantPreview[]
                    | { assistants: AssistantPreview[] },
            ) => {
                if (Array.isArray(response)) return response;
                return response.assistants ?? [];
            },
            providesTags: [{ type: "Chat", id: "ASSISTANTS" }],
        }),

        getConversationsForAssistant: builder.query<
            ConversationPreview[],
            string
        >({
            query: (assistantId) => ({
                url: `/v1/assistants/${assistantId}/conversations`,
                method: "GET",
            }),
            transformResponse: (
                response:
                    | ConversationPreview[]
                    | { conversations: ConversationPreview[] },
            ) => {
                if (Array.isArray(response)) return response;
                return response.conversations ?? [];
            },
            providesTags: (_result, _error, assistantId) => [
                { type: "Chat", id: `${assistantId}-conversations` },
            ],
        }),

        getChatHistory: builder.query<
            ChatMessageHistory[],
            { assistantId: string; conversationId: string }
        >({
            query: ({ assistantId, conversationId }) => ({
                url: `/v1/assistants/${assistantId}/conversations/${conversationId}/messages`,
                method: "GET",
            }),
            transformResponse: (
                response:
                    | ChatMessageHistory[]
                    | { messages: ChatMessageHistory[] },
            ) => {
                if (Array.isArray(response)) return response;
                return response.messages ?? [];
            },
            providesTags: (
                _result,
                _error,
                { assistantId, conversationId },
            ) => [
                {
                    type: "Chat",
                    id: `${assistantId}-${conversationId}-messages`,
                },
            ],
        }),
    }),
});

export const {
    useSendChatMessageMutation,
    useGetChatMetadataQuery,
    useGetAssistantMetadataQuery,
    useGetChatHistoryQuery,
    useGetAssistantsListQuery,
    useGetConversationsForAssistantQuery,
} = extendedChatApi;
