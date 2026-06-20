import { useState, useCallback } from "react";
import { useSSEStream, InsufficientCreditsError } from "./useSSEStream";
import type { SSEResult } from "./useSSEStream";

export function useStreamQuery() {
    const { stream } = useSSEStream();
    const [isOutOfCredits, setIsOutOfCredits] = useState(false);

    const query = useCallback(
        async (url: string, onChunk?: (text: string) => void): Promise<SSEResult> => {
            setIsOutOfCredits(false);
            try {
                return await stream(url, onChunk);
            } catch (err) {
                if (err instanceof InsufficientCreditsError) setIsOutOfCredits(true);
                throw err;
            }
        },
        [stream],
    );

    return { query, isOutOfCredits };
}
