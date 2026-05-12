import { useState, useCallback } from "react";
import { flushSync } from "react-dom";

export interface ChatMessage {
    id: string;
    question: string;
    response: string[];
    timestamp: number;
}

export interface UseChatOptions {
    getResponse: (
        question: string,
        onChunk: (partialText: string) => void,
    ) => { response: string[] } | Promise<{ response: string[] }>;
    initialMessages?: ChatMessage[];
}

export const useChat = ({ getResponse, initialMessages = [] }: UseChatOptions) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(
        async (question: string) => {
            if (!question.trim()) return;

            const id = `msg-${Date.now()}-${Math.random().toString(36)}`;
            const pending: ChatMessage = {
                id,
                question,
                response: [],
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, pending]);
            setIsLoading(true);

            try {
                const { response } = await Promise.resolve(
                    getResponse(question, (partialText) => {
                        flushSync(() => {
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === id
                                        ? {
                                              ...pending,
                                              response: [partialText],
                                          }
                                        : m,
                                ),
                            );
                        });
                    }),
                );
                setMessages((prev) => prev.map((m) => (m.id === id ? { ...pending, response } : m)));
            } catch (_error) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === id
                            ? {
                                  ...m,
                                  response: ["Désolé, une erreur est survenue lors de la récupération de la réponse."],
                              }
                            : m,
                    ),
                );
            } finally {
                setIsLoading(false);
            }
        },
        [getResponse],
    );

    return { messages, setMessages, sendMessage, isLoading };
};
