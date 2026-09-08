import { useState, useCallback } from "react";
import { RagSource, ThinkingEvent } from "./types";

export interface ChatMessage {
    id: string;
    question: string;
    response: string;
    timestamp: number;
    error: boolean;
    sources?: RagSource[];
    durationMs?: number;
    // Transient live-progress log for the in-flight request — never persisted, dropped once the answer arrives.
    thinkingEvents?: ThinkingEvent[];
}

export interface ChatResponseMeta {
    durationMs?: number;
}

export interface UseChatOptions {
    getResponse: (
        question: string,
        onChunk: (partial: string) => void,
        onSources?: (sources: RagSource[]) => void,
        onMeta?: (meta: ChatResponseMeta) => void,
        onThinking?: (event: ThinkingEvent) => void,
    ) => Promise<string>;
    initialMessages?: ChatMessage[];
}

export const useChat = ({ getResponse, initialMessages = [] }: UseChatOptions) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(
        async (question: string) => {
            if (!question.trim()) return;

            const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const base: ChatMessage = { id, question, response: "", timestamp: Date.now(), error: false };

            setMessages((prev) => [...prev, base]);
            setIsLoading(true);

            let meta: ChatResponseMeta = {};
            try {
                const response = await getResponse(
                    question,
                    (partial) => {
                        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, response: partial } : m)));
                    },
                    (sources) => {
                        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, sources } : m)));
                    },
                    (m) => {
                        meta = m;
                    },
                    (event) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === id
                                    ? { ...m, thinkingEvents: [...(m.thinkingEvents ?? []), event] }
                                    : m,
                            ),
                        );
                    },
                );
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === id ? { ...base, response, sources: m.sources, durationMs: meta.durationMs } : m,
                    ),
                );
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Une erreur est survenue.";
                setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, response: msg, error: true } : m)));
            } finally {
                setIsLoading(false);
            }
        },
        [getResponse],
    );

    return { messages, setMessages, sendMessage, isLoading };
};
