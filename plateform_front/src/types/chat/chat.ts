import { RagSource } from "hooks/chat";

export interface ChatResponse {
    response: string;
    isImproved?: boolean;
}

export interface ChatMessageHistory {
    id: string;
    question: string;
    response: string;
    timestamp: number;
    isImproved?: boolean;
    sources?: RagSource[];
    durationMs?: number;
}

export interface ChatMetadata {
    id: string;
    title: string;
    sharedBy: string;
    version?: number;
}

export interface AssistantPreview {
    id: string;
    title: string;
    lastMessage?: string;
    updatedAt?: string;
    sharedBy?: string;
}

export interface ConversationPreview {
    id: string;
    title?: string;
    lastMessage?: string;
    updatedAt?: string;
}
