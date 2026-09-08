import { useCallback, useRef } from "react";
import { useStreamQuery } from "./useStreamQuery";
import { BACKEND_URL, InsufficientCreditsError } from "./useSSEStream";
import { RagSource, ThinkingEvent } from "./types";

export { InsufficientCreditsError };

export const useAgentQuery = (
    workspaceId: string,
    agentId: string,
    streamUrlOverride?: string,
    streamStepId?: string,
) => {
    const { query, isOutOfCredits } = useStreamQuery();
    const conversationIdRef = useRef<string | null>(null);

    const sendQuery = useCallback(
        async (
            q: string,
            onChunk?: (text: string) => void,
            onSources?: (sources: RagSource[]) => void,
            onThinking?: (event: ThinkingEvent) => void,
        ): Promise<string> => {
            const base =
                streamUrlOverride ?? `${BACKEND_URL}/workspaces/${workspaceId}/agents/${agentId}/runtime/stream`;

            const params = new URLSearchParams({ query: q });

            if (streamUrlOverride) {
                params.set("agentId", agentId);
                if (streamStepId) {
                    params.set("stepId", streamStepId);
                }
            } else if (conversationIdRef.current) {
                params.set("conversationId", conversationIdRef.current);
            }

            const { text, conversationId } = await query(`${base}?${params}`, onChunk, onSources, onThinking);

            if (conversationId) {
                conversationIdRef.current = conversationId;
            }
            return text;
        },
        [workspaceId, agentId, streamUrlOverride, streamStepId, query],
    );

    return { sendQuery, isOutOfCredits };
};
