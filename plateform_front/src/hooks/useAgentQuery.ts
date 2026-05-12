import { useState, useCallback } from "react";
import { useSendMockQueryMutation } from "services/chat/chat";

export class InsufficientCreditsError extends Error {
    constructor() {
        super("Pas de crédits disponibles.");
        this.name = "InsufficientCreditsError";
    }
}

interface AgentQueryState {
    text: string;
    isStreaming: boolean;
    error: string | null;
    isOutOfCredits: boolean;
    conversationId: string | null;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? "";

export const useAgentQuery = (
    workspaceId: string,
    agentId: string,
    useMock = false,
    streamUrlOverride?: string,
    streamStepId?: string,
) => {
    const [state, setState] = useState<AgentQueryState>({
        text: "",
        isStreaming: false,
        error: null,
        isOutOfCredits: false,
        conversationId: null,
    });

    const [sendMockQuery] = useSendMockQueryMutation();

    const sendQuery = useCallback(
        async (query: string, onChunk?: (partialText: string) => void): Promise<string> => {
            setState((prev) => ({
                text: "",
                isStreaming: true,
                error: null,
                isOutOfCredits: false,
                conversationId: prev.conversationId,
            }));

            if (useMock) {
                try {
                    const result = await sendMockQuery({ query }).unwrap();
                    const answer = result.response[0] ?? "";
                    setState((prev) => ({ ...prev, text: answer }));
                    return answer;
                } catch (err: any) {
                    setState((prev) => ({ ...prev, error: String(err) }));
                    throw err;
                } finally {
                    setState((prev) => ({ ...prev, isStreaming: false }));
                }
            }

            const baseUrl =
                streamUrlOverride ?? `${BACKEND_URL}/workspaces/${workspaceId}/agents/${agentId}/runtime/stream`;
            const params = new URLSearchParams({ query });
            if (streamUrlOverride) {
                params.set("agentId", agentId);
                if (streamStepId) params.set("stepId", streamStepId);
            } else if (state.conversationId) {
                params.set("conversationId", state.conversationId);
            }
            const url = `${baseUrl}?${params.toString()}`;

            return new Promise<string>((resolve, reject) => {
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
                            setState((prev) => ({
                                ...prev,
                                isStreaming: false,
                                conversationId: parsed.conversationId ?? prev.conversationId,
                            }));
                            resolve(fullText);
                            return;
                        }

                        if (parsed.error) {
                            es.close();
                            const err = parsed.isOutOfCredits
                                ? new InsufficientCreditsError()
                                : new Error(parsed.error);
                            setState((prev) => ({
                                ...prev,
                                error: parsed.error!,
                                isOutOfCredits: parsed.isOutOfCredits ?? false,
                                isStreaming: false,
                            }));
                            reject(err);
                            return;
                        }

                        if (parsed.chunk) {
                            fullText += parsed.chunk;
                            onChunk?.(fullText);
                            setState((prev) => ({ ...prev, text: fullText }));
                        }
                    } catch {
                        // ignore parse errors for malformed SSE data
                    }
                };

                es.onerror = () => {
                    es.close();
                    setState((prev) => ({
                        ...prev,
                        error: "Erreur de connexion au serveur.",
                        isStreaming: false,
                    }));
                    reject(new Error("Erreur de connexion au serveur."));
                };
            });
        },
        [workspaceId, agentId, sendMockQuery, useMock, streamUrlOverride, streamStepId, state.conversationId],
    );

    return { ...state, sendQuery };
};
