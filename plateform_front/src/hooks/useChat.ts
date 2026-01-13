import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
    id: string;
    question: string;
    response: string;
    timestamp: number;
    isImproved?: boolean;
}

export interface UseChatOptions {
    getResponse: (question: string) => Promise<string | { response: string; isImproved?: boolean }> | string | { response: string; isImproved?: boolean };
    initialMessages?: ChatMessage[];
    onMessageUpdate?: (message: ChatMessage) => void;
}

export const useChat = (options: UseChatOptions) => {
    const { getResponse, initialMessages = [], onMessageUpdate } = options;
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);

    const getResponseRef = useRef(getResponse);
    const onMessageUpdateRef = useRef(onMessageUpdate);

    useEffect(() => {
        getResponseRef.current = getResponse;
    }, [getResponse]);

    useEffect(() => {
        onMessageUpdateRef.current = onMessageUpdate;
    }, [onMessageUpdate]);

    const sendMessage = useCallback(async (question: string) => {
        if (!question.trim()) return;

        const questionId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const questionMessage: ChatMessage = {
            id: questionId,
            question,
            response: '',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, questionMessage]);
        setIsLoading(true);

        try {
            const responseResult = await Promise.resolve(getResponseRef.current(question));

            const isImproved = typeof responseResult === 'object' && 'isImproved' in responseResult ? responseResult.isImproved : false;
            const responseText = typeof responseResult === 'object' && 'response' in responseResult ? responseResult.response : (responseResult as string);

            const updatedMessage: ChatMessage = {
                ...questionMessage,
                response: responseText,
                isImproved: isImproved || false,
            };

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === questionId ? updatedMessage : msg
                )
            );

            if (onMessageUpdateRef.current) {
                onMessageUpdateRef.current(updatedMessage);
            }
        } catch (error) {
            console.error('Error getting response:', error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === questionId
                        ? { ...msg, response: 'Sorry, an error occurred while processing your question.' }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const addMessage = useCallback((message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    }, []);

    return {
        messages,
        sendMessage,
        clearMessages,
        addMessage,
        isLoading,
    };
};

