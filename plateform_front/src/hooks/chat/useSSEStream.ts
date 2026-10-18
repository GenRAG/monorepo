import { useCallback, useEffect, useRef } from "react";
import { RagSource, ThinkingEvent } from "./types";

const makeEventId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL ?? "").replace(/\/$/, "");

export class InsufficientCreditsError extends Error {
    constructor() {
        super("Pas de crédits disponibles.");
        this.name = "InsufficientCreditsError";
    }
}

interface SSEEvent {
    chunk?: string;
    sources?: RagSource[];
    citedSources?: RagSource[];
    status?: string;
    error?: string;
    isOutOfCredits?: boolean;
    done?: boolean;
    conversationId?: string;
    durationMs?: number;
}

export interface SSEResult {
    text: string;
    conversationId?: string;
    durationMs?: number;
}

export interface SSEStreamOptions {
    /**
     * Close the streams still open when the screen unmounts, so the server stops generating an answer nobody will read.
     * Only for answers that are not kept: a persisted conversation keeps streaming, and the user finds the answer back.
     */
    closeOnUnmount?: boolean;
}

export function useSSEStream({ closeOnUnmount = false }: SSEStreamOptions = {}) {
    const openStreams = useRef(new Set<EventSource>());

    useEffect(() => {
        const streams = openStreams.current;
        return () => {
            if (!closeOnUnmount) return;
            // The pending promises stay unsettled: rejecting them would show an error toast on the next screen.
            streams.forEach((es) => es.close());
            streams.clear();
        };
    }, [closeOnUnmount]);

    const stream = useCallback(
        (
            url: string,
            onChunk?: (text: string) => void,
            onSources?: (sources: RagSource[]) => void,
            onThinking?: (event: ThinkingEvent) => void,
        ): Promise<SSEResult> => {
            return new Promise((resolve, reject) => {
                const es = new EventSource(url, { withCredentials: true });
                openStreams.current.add(es);
                const close = () => {
                    es.close();
                    openStreams.current.delete(es);
                };
                let fullText = "";

                es.onmessage = (e: MessageEvent) => {
                    try {
                        const parsed = JSON.parse(e.data as string) as SSEEvent;
                        if (parsed.done) {
                            close();
                            resolve({
                                text: fullText,
                                conversationId: parsed.conversationId,
                                durationMs: parsed.durationMs,
                            });
                            return;
                        }
                        if (parsed.error) {
                            close();
                            if (parsed.isOutOfCredits) {
                                reject(new InsufficientCreditsError());
                            } else {
                                reject(new Error(parsed.error));
                            }
                            return;
                        }
                        if (parsed.citedSources) {
                            onSources?.(parsed.citedSources);
                            return;
                        }
                        if (parsed.status) {
                            onThinking?.({ kind: "status", id: makeEventId(), text: parsed.status });
                            return;
                        }
                        if (parsed.sources) {
                            onThinking?.({ kind: "sources", id: makeEventId(), sources: parsed.sources });
                            return;
                        }
                        if (parsed.chunk) {
                            fullText += parsed.chunk;
                            onChunk?.(fullText);
                        }
                    } catch {
                        // ignore malformed SSE frames
                    }
                };

                es.onerror = () => {
                    close();
                    reject(new Error("Erreur de connexion au serveur."));
                };
            });
        },
        [],
    );

    return { stream };
}
