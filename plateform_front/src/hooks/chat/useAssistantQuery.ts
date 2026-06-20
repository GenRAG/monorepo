import { useCallback } from "react";
import { useStreamQuery } from "./useStreamQuery";
import { BACKEND_URL, InsufficientCreditsError } from "./useSSEStream";

export { InsufficientCreditsError };

export const useAssistantQuery = (assistantId: string) => {
    const { query } = useStreamQuery();

    const sendQuery = useCallback(
        async (
            question: string,
            conversationId: string | null,
            onChunk?: (text: string) => void,
        ): Promise<{ text: string; conversationId: string }> => {
            const params = new URLSearchParams({ query: question });

            if (conversationId) {
                params.set("conversationId", conversationId);
            }

            const result = await query(`${BACKEND_URL}/assistants/${assistantId}/stream?${params}`, onChunk);
            return { text: result.text, conversationId: result.conversationId! };
        },
        [assistantId, query],
    );

    return { sendQuery };
};
