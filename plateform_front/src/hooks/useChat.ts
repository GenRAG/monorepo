import { useState, useCallback, useRef } from "react";
import { useExecuteAgentRuntimeMutation } from "services/agentRuntime/agentRuntime";
import { useSendMockQueryMutation } from "services/chat/chat";

export interface ChatMessage {
    id: string;
    question: string;
    response: string[];
    timestamp: number;
    isImproved?: boolean;
}

type GetResponseResult =
    | string[]
    | { response: string[]; isImproved?: boolean };

export interface UseChatOptions {
    getResponse: (
        question: string,
    ) => GetResponseResult | Promise<GetResponseResult>;
    initialMessages?: ChatMessage[];
    onMessageUpdate?: (message: ChatMessage) => void;
}

interface HandleMessageUpdateProps {
    setValue: (
        name: string,
        value: string,
        options?: { shouldValidate?: boolean },
    ) => void;
    updateData: (data: Record<string, string>) => void;
    refQuestion: string;
    refResponse: string;
}

interface StreamingState {
    text: string;
    isStreaming: boolean;
    error: string | null;
}

export const useStreamingQuery = (
    workspaceId?: string | null,
    agentId?: string | null,
) => {
    const [state, setState] = useState<StreamingState>({
        text: "",
        isStreaming: false,
        error: null,
    });

    const [executeRuntime] = useExecuteAgentRuntimeMutation();
    const [sendMockQuery] = useSendMockQueryMutation();

    const sendQuery = useCallback(
        async (query: string): Promise<string> => {
            setState({ text: "", isStreaming: true, error: null });

            try {
                let answer: string;

                if (workspaceId && agentId) {
                    const result = await executeRuntime({
                        workspaceId,
                        agentId,
                        query,
                    }).unwrap();
                    answer = result.answer ?? "";
                } else {
                    const result = await sendMockQuery({ query }).unwrap();
                    answer = result.response[0] ?? "";
                }

                setState((prev) => ({ ...prev, text: answer }));
                return answer;
            } catch (err) {
                setState((prev) => ({ ...prev, error: String(err) }));
                throw err;
            } finally {
                setState((prev) => ({ ...prev, isStreaming: false }));
            }
        },
        [workspaceId, agentId, executeRuntime, sendMockQuery],
    );

    return { ...state, sendQuery };
};

export const useHandleMessageUpdate = ({
    setValue,
    updateData,
    refQuestion,
    refResponse,
}: HandleMessageUpdateProps) => {
    const lastKeyRef = useRef("");

    return useCallback(
        (message: ChatMessage) => {
            if (!message.response?.length) return;

            const responseText = message.response.join("\n");
            const key = `${message.question}-${responseText}`;
            if (lastKeyRef.current === key) return;
            lastKeyRef.current = key;

            setValue(refQuestion, message.question, { shouldValidate: true });
            setValue(refResponse, responseText, { shouldValidate: true });
            updateData({
                [refQuestion]: message.question,
                [refResponse]: responseText,
            });
        },
        [setValue, updateData, refQuestion, refResponse],
    );
};

export const useChat = ({
    getResponse,
    initialMessages = [],
    onMessageUpdate,
}: UseChatOptions) => {
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
                const result = await Promise.resolve(getResponse(question));
                const isArray = Array.isArray(result);
                const response = isArray
                    ? (result as string[])
                    : (result as { response: string[] }).response;
                const isImproved = isArray
                    ? false
                    : ((result as { isImproved?: boolean }).isImproved ??
                      false);

                const updated: ChatMessage = {
                    ...pending,
                    response,
                    isImproved,
                };
                setMessages((prev) =>
                    prev.map((m) => (m.id === id ? updated : m)),
                );
                onMessageUpdate?.(updated);
            } catch (error) {
                console.error("Error getting response:", error);
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === id
                            ? {
                                  ...m,
                                  response: [
                                      "Désolé, une erreur est survenue lors de la récupération de la réponse.",
                                  ],
                              }
                            : m,
                    ),
                );
            } finally {
                setIsLoading(false);
            }
        },
        [getResponse, onMessageUpdate],
    );

    return { messages, sendMessage, isLoading };
};
