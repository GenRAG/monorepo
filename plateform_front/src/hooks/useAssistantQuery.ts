import { useCallback } from "react";
import { InsufficientCreditsError } from "./useAgentQuery";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? "";

export const useAssistantQuery = (assistantId: string) => {
    const sendQuery = useCallback(
        async (
            question: string,
            conversationId: string | null,
            onChunk?: (partialText: string) => void,
        ): Promise<{ text: string; conversationId: string }> => {
            const params = new URLSearchParams({ query: question });
            if (conversationId) params.set("conversationId", conversationId);
            const url = `${BACKEND_URL}/v1/assistants/${assistantId}/stream?${params.toString()}`;

            return new Promise((resolve, reject) => {
                const es = new EventSource(url, { withCredentials: true });
                let fullText = "";

                es.onmessage = (e: MessageEvent) => {
                    try {
                        const parsed = JSON.parse(e.data as string) as {
                            chunk?: string;
                            error?: string;
                            isOutOfCredits?: boolean;
                            done?: boolean;
                            conversationId?: string;
                        };

                        if (parsed.done) {
                            es.close();
                            resolve({
                                text: fullText,
                                conversationId: parsed.conversationId!,
                            });
                            return;
                        }

                        if (parsed.error) {
                            es.close();
                            reject(
                                parsed.isOutOfCredits
                                    ? new InsufficientCreditsError()
                                    : new Error(parsed.error),
                            );
                            return;
                        }

                        if (parsed.chunk) {
                            fullText += parsed.chunk;
                            onChunk?.(fullText);
                        }
                    } catch {
                        // ignore malformed SSE data
                    }
                };

                es.onerror = () => {
                    es.close();
                    reject(new Error("Erreur de connexion au serveur."));
                };
            });
        },
        [assistantId],
    );

    return { sendQuery };
};
