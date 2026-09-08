import { useCallback } from "react";
import { useStreamQuery } from "./useStreamQuery";
import { BACKEND_URL, InsufficientCreditsError } from "./useSSEStream";
import { RagSource, ThinkingEvent } from "./types";

export { InsufficientCreditsError };

export const useAssistantQuery = (assistantId: string) => {
    const { query, isOutOfCredits } = useStreamQuery();

    const sendQuery = useCallback(
        async (
            question: string,
            conversationId: string | null,
            onChunk?: (text: string) => void,
            onSources?: (sources: RagSource[]) => void,
            onThinking?: (event: ThinkingEvent) => void,
        ): Promise<{ text: string; conversationId: string; durationMs?: number }> => {
            const params = new URLSearchParams({ query: question });

            if (conversationId) {
                params.set("conversationId", conversationId);
            }

            const result = await query(
                `${BACKEND_URL}/assistants/${assistantId}/stream?${params}`,
                onChunk,
                onSources,
                onThinking,
            );
            return { text: result.text, conversationId: result.conversationId!, durationMs: result.durationMs };
        },
        [assistantId, query],
    );

    return { sendQuery, isOutOfCredits };
};
