import { useState, useCallback } from "react";
import { useSSEStream, InsufficientCreditsError } from "./useSSEStream";
import type { SSEResult } from "./useSSEStream";
import { RagSource, ThinkingEvent } from "./types";
import { useAppDispatch } from "store";
import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";

export function useStreamQuery() {
    const { stream } = useSSEStream();
    const [isOutOfCredits, setIsOutOfCredits] = useState(false);
    const dispatch = useAppDispatch();

    const query = useCallback(
        async (
            url: string,
            onChunk?: (text: string) => void,
            onSources?: (sources: RagSource[]) => void,
            onThinking?: (event: ThinkingEvent) => void,
        ): Promise<SSEResult> => {
            setIsOutOfCredits(false);
            try {
                const result = await stream(url, onChunk, onSources, onThinking);
                // The SSE stream sits outside RTK Query — a successful query deducts credits and
                // creates/updates a conversation server-side, so nudge the cache to catch up.
                dispatch(backendApi.util.invalidateTags([Tag.Credits, Tag.Chat]));
                return result;
            } catch (err) {
                if (err instanceof InsufficientCreditsError) setIsOutOfCredits(true);
                throw err;
            }
        },
        [stream, dispatch],
    );

    return { query, isOutOfCredits };
}
