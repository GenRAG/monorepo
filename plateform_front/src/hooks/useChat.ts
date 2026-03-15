import { useState, useCallback, useRef, useEffect } from "react";

//Usechat manage the life cycle of the chat removing the need to manage this part in higher level components

/**
 * Represents a single message in the chat conversation.
 */
export interface ChatMessage {
    /** Unique identifier for the message, generated at creation time. */
    id: string;
    /** The question asked by the user. */
    question: string;
    /**
     * The response from the assistant, stored as an array of strings.
     * Multiple strings can represent streamed chunks or paragraphs.
     */
    response: string[];
    /** Unix timestamp (ms) of when the message was created. */
    timestamp: number;
    /** Whether the response was improved by a post-processing step. */
    isImproved?: boolean;
}

/**
 * Options to configure the useChat hook.
 */
export interface UseChatOptions {
    /**
     * Function responsible for generating a response to a given question.
     * Can be synchronous or asynchronous.
     * Can return either:
     * - A plain `string[]` (simple response)
     * - An object `{ response: string[], isImproved?: boolean }` (enriched response)
     *
     * @example
     * // Simple synchronous usage
     * const getResponse = (question: string) => ["This is the answer"];
     *
     * @example
     * // Async API call
     * const getResponse = async (question: string) => {
     *     const data = await fetch('/api/chat', { body: question });
     *     return data.json(); // { response: string[], isImproved: boolean }
     * };
     */
    getResponse: (
        question: string,
    ) =>
        | Promise<string[] | { response: string[]; isImproved?: boolean }>
        | string[]
        | { response: string[]; isImproved?: boolean };
    /**
     * Optional list of messages to pre-populate the chat with.
     * Useful for restoring a previous session.
     */
    initialMessages?: ChatMessage[];
    /**
     * Optional callback fired after each message is fully resolved (question + response).
     * Useful for syncing the latest message with external state (e.g. a form or a parent component).
     *
     * @param message - The completed message with question and response.
     */
    onMessageUpdate?: (message: ChatMessage) => void;
}

interface HandleMessageUpdateProps {
    setValue: (
        name: string,
        value: string,
        options?: {
            shouldValidate?: boolean;
            shouldDirty?: boolean;
            shouldTouch?: boolean;
        },
    ) => void;
    updateData: (data: any) => void;
    refQuestion: string;
    refResponse: string;
}

interface StreamingState {
    text: string;
    isStreaming: boolean;
    error: string | null;
}

export const useStreamingQuery = () => {
    const [state, setState] = useState<StreamingState>({
        text: "",
        isStreaming: false,
        error: null,
    });

    const sendQuery = useCallback(
        async (
            query: string,
            onChunk?: (fullText: string) => void,
        ): Promise<string> => {
            setState({ text: "", isStreaming: true, error: null });
            let fullText = "";

            try {
                const response = await fetch(
                    "http://localhost:8000/rag/stream",
                    {
                        method: "POST",
                        headers: {
                            accept: "application/json",
                            "X-API-Key": "ee22f7e7503f478a87317781b0f589c3",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            pipeline: {
                                blocks: [
                                    { name: "query", type: "query" },
                                    {
                                        collection_name:
                                            "genrag_knowledge_base",
                                        name: "retrieve",
                                        top_k: 5,
                                        type: "retrieve",
                                    },
                                    {
                                        model: "google/gemini-2.5-flash",
                                        name: "answer",
                                        type: "answer",
                                    },
                                ],
                                pipeline_name: "custom_rag",
                            },
                            query,
                        }),
                    },
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const reader = response.body!.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullText += chunk;

                    setState((prev) => ({ ...prev, text: fullText }));
                    onChunk?.(fullText);
                }

                return fullText;
            } catch (err) {
                setState((prev) => ({ ...prev, error: String(err) }));
                throw err;
            } finally {
                setState((prev) => ({ ...prev, isStreaming: false }));
            }
        },
        [],
    );

    return { ...state, sendQuery };
};

export const useHandleMessageUpdate = (props: HandleMessageUpdateProps) => {
    const {
        setValue: _setValue,
        updateData: _updateData,
        refQuestion,
        refResponse,
    } = props;
    const setValueRef = useRef<typeof _setValue | null>(null);
    const updateDataRef = useRef<typeof _updateData | null>(null);
    const lastProcessedMessageRef = useRef<string>("");

    return useCallback(
        (message: ChatMessage) => {
            if (!message.response) return;

            const responseText = Array.isArray(message.response)
                ? message.response.join("\n")
                : message.response;
            const messageKey = `${message.question}-${responseText}`;
            if (lastProcessedMessageRef.current === messageKey) return;

            lastProcessedMessageRef.current = messageKey;

            if (setValueRef.current) {
                setValueRef.current(refQuestion, message.question, {
                    shouldValidate: false,
                });
                setValueRef.current(refResponse, responseText, {
                    shouldValidate: false,
                });
            }

            if (updateDataRef.current) {
                updateDataRef.current({
                    question: message.question,
                    response: responseText,
                });
            }
        },
        [refQuestion, refResponse],
    );
};

type ImprovedResult = {
    isImproved: boolean;
};

type ResponseResult = {
    response: string[];
};

function hasKeyOf<T extends object, K extends keyof T>(
    value: unknown,
    key: K,
    check: (v: unknown) => v is T[K],
): value is T & Record<K, T[K]> {
    return (
        typeof value === "object" &&
        value !== null &&
        key in value &&
        check((value as any)[key])
    );
}
/**
 * useChat: A generic hook for managing a question/answer chat conversation.
 *
 * Responsibilities:
 * - Maintaining the list of messages
 * - Orchestrating the request/response lifecycle (loading, success, error)
 * - Notifying the parent component when a message is updated
 *
 * This hook is intentionally agnostic about how responses are generated.
 * The caller provides a `getResponse` function, which can call an API,
 * return a hardcoded value, or do anything else.
 *
 * @example
 * const { messages, sendMessage, isLoading } = useChat({
 *     getResponse: async (question) => {
 *         const res = await myApi.ask(question);
 *         return res.answer;
 *     },
 *     onMessageUpdate: (message) => {
 *         saveToStore(message);
 *     },
 * });
 */
export const useChat = (options: UseChatOptions) => {
    const { getResponse, initialMessages = [], onMessageUpdate } = options;

    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Refs are used to always hold the latest version of these callbacks
     * without making them dependencies of `useCallback`.
     * This prevents `sendMessage` from being recreated on every render
     * while still using up-to-date function references internally.
     */
    const getResponseRef = useRef(getResponse);
    const onMessageUpdateRef = useRef(onMessageUpdate);

    useEffect(() => {
        getResponseRef.current = getResponse;
    }, [getResponse]);

    useEffect(() => {
        onMessageUpdateRef.current = onMessageUpdate;
    }, [onMessageUpdate]);

    /**
     * Sends a user question through the chat.
     *
     * Flow:
     * 1. Creates a message with an empty response and appends it to the list immediately (optimistic update)
     * 2. Calls `getResponse` to retrieve the answer (sync or async)
     * 3. Normalizes the response format (plain array vs enriched object)
     * 4. Updates the message in place with the resolved response
     * 5. Fires `onMessageUpdate` to notify the parent
     * 6. On error, replaces the response with a fallback error message
     *
     * @param question - The user's input string.
     */
    const currentMessageIdRef = useRef<string | null>(null);
    const sendMessage = useCallback(async (question: string) => {
        if (!question.trim()) return;

        const questionId = `msg-${Date.now()}-${Math.random().toString(36)}`;
        currentMessageIdRef.current = questionId;
        // Create the message immediately with an empty response so the UI
        // can show a loading state right away.
        const questionMessage: ChatMessage = {
            id: questionId,
            question,
            response: [],
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, questionMessage]);
        setIsLoading(true);

        try {
            // `Promise.resolve` normalizes both sync and async return values
            // so that `getResponse` can be either, without special casing here.
            const responseResult = await Promise.resolve(
                getResponseRef.current(question),
            );

            // Normalize the response: `getResponse` can return either a plain string[]
            // or an object { response: string[], isImproved?: boolean }.
            console.log("responseResult", responseResult);
            const isImproved = hasKeyOf<ImprovedResult, "isImproved">(
                responseResult,
                "isImproved",
                (v) => typeof v === "boolean",
            )
                ? responseResult.isImproved
                : false;
            console.log("isImproved", isImproved);

            const responseText = hasKeyOf<ResponseResult, "response">(
                responseResult,
                "response",
                (v) => Array.isArray(v),
            )
                ? responseResult.response
                : responseResult;

            const updatedMessage: ChatMessage = {
                ...questionMessage,
                response: Array.isArray(responseText)
                    ? responseText
                    : [responseText],
                isImproved: isImproved || false,
            };

            // Replace the placeholder message (empty response) with the resolved one.
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === questionId ? updatedMessage : msg,
                ),
            );

            // Notify the parent that a message has been fully resolved.
            if (onMessageUpdateRef.current) {
                onMessageUpdateRef.current(updatedMessage);
            }
        } catch (error) {
            console.error("Error getting response:", error);

            // On failure, update the message with a user-facing error string.
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === questionId
                        ? {
                              ...msg,
                              response: [
                                  "Sorry, an error occurred while processing your question.",
                              ],
                          }
                        : msg,
                ),
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Clears all messages from the conversation.
     * Useful for resetting the chat to its initial state.
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    /**
     * Manually appends a message to the conversation.
     * Useful for injecting messages programmatically (e.g. restoring history).
     *
     * @param message - A fully formed ChatMessage object to add.
     */
    const addMessage = useCallback((message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    /**
     * Manually appends multiple messages to the conversation.
     * Useful for restoring chat history.
     *
     * @param newMessages - Array of ChatMessage objects to add.
     */
    const addMessages = useCallback((newMessages: ChatMessage[]) => {
        setMessages((prev) => [...prev, ...newMessages]);
    }, []);

    /**
     * Updates an existing message by id.
     * Useful for editing questions or responses.
     *
     * @param messageId - The id of the message to update.
     * @param updates - Partial updates (question and/or response).
     */
    const updateMessage = useCallback(
        (
            messageId: string,
            updates: Partial<Pick<ChatMessage, "question" | "response">>,
        ) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg,
                ),
            );
        },
        [],
    );

    return {
        /** The current list of messages in the conversation. */
        messages,
        /** Send a new question and trigger the response cycle. */
        sendMessage,
        /** Reset the conversation by clearing all messages. */
        clearMessages,
        /** Manually inject a message into the conversation. */
        addMessage,
        /** Manually inject multiple messages into the conversation. */
        addMessages,
        /** Update an existing message by id. */
        updateMessage,
        /** True while a response is being awaited. */
        isLoading,
        currentMessageIdRef,
    };
};
