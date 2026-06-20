import { useCallback } from "react";
import * as Sentry from "@sentry/react";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? "";

export class InsufficientCreditsError extends Error {
    constructor() {
        super("Pas de crédits disponibles.");
        this.name = "InsufficientCreditsError";
    }
}

interface SSEEvent {
    chunk?: string;
    error?: string;
    isOutOfCredits?: boolean;
    done?: boolean;
    conversationId?: string;
}

export interface SSEResult {
    text: string;
    conversationId?: string;
}

export function useSSEStream() {
    const stream = useCallback((url: string, onChunk?: (text: string) => void): Promise<SSEResult> => {
        return new Promise((resolve, reject) => {
            const es = new EventSource(url, { withCredentials: true });
            let fullText = "";

            es.onmessage = (e: MessageEvent) => {
                try {
                    const parsed = JSON.parse(e.data as string) as SSEEvent;
                    if (parsed.done) {
                        es.close();
                        resolve({ text: fullText, conversationId: parsed.conversationId });
                        return;
                    }
                    if (parsed.error) {
                        es.close();
                        if (parsed.isOutOfCredits) {
                            reject(new InsufficientCreditsError());
                        } else {
                            const err = new Error(parsed.error);
                            Sentry.captureException(err, { extra: { url } });
                            reject(err);
                        }
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
                es.close();
                const err = new Error("SSE connection error");
                Sentry.captureException(err, { extra: { url }, level: "warning" });
                reject(new Error("Erreur de connexion au serveur."));
            };
        });
    }, []);

    return { stream };
}
