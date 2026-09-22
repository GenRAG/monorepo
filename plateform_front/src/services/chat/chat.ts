import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import type {
    ChatResponse,
    ChatMessageHistory,
    ChatMetadata,
    AssistantPreview,
    ConversationPreview,
} from "types/chat/chat";

export type { ChatResponse, ChatMessageHistory, ChatMetadata, AssistantPreview, ConversationPreview };

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

        getSourceUrl: builder.query<{ url: string }, { assistantId: string; title: string }>({
            query: ({ assistantId, title }) => ({
                url: `/assistants/${assistantId}/sources/url`,
                method: "GET",
                params: { title },
            }),
        }),
    }),
});

export const {
    useGetAssistantMetadataQuery,
    useGetChatHistoryQuery,
    useGetAssistantsListQuery,
    useGetConversationsForAssistantQuery,
    useGetSourceUrlQuery,
} = extendedChatApi;
