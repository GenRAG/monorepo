import { useState, useCallback } from "react";
import { useSSEStream, InsufficientCreditsError } from "./useSSEStream";
import type { SSEResult } from "./useSSEStream";
import { RagSource, ThinkingEvent } from "./types";

export function useStreamQuery() {
    const { stream } = useSSEStream();
    const [isOutOfCredits, setIsOutOfCredits] = useState(false);

    const query = useCallback(
        async (
            url: string,
            onChunk?: (text: string) => void,
            onSources?: (sources: RagSource[]) => void,
            onThinking?: (event: ThinkingEvent) => void,
        ): Promise<SSEResult> => {
            setIsOutOfCredits(false);
            try {
                return await stream(url, onChunk, onSources, onThinking);
            } catch (err) {
                if (err instanceof InsufficientCreditsError) setIsOutOfCredits(true);
                throw err;
            }
        },
        [stream],
    );

    return { query, isOutOfCredits };
}
