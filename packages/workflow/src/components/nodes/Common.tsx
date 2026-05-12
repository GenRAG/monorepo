export type { ModelOption } from '../../types/model-option';
import type { ModelOption } from '../../types/model-option';

export const LLMS: ModelOption[] = [
    {
        id: "gpt-4o",
        label: "GPT-4o",
        provider: "OpenAI",
        description: "Most capable multimodal model, best for complex tasks",
        priceInput: 2.5,
        priceOutput: 10,
        badge: "smart",
    },
    {
        id: "gpt-3.5",
        label: "GPT-3.5",
        provider: "OpenAI",
        description: "Fast and cost-effective for straightforward tasks",
        priceInput: 0.5,
        priceOutput: 1.5,
        badge: "fast",
    },
    {
        id: "gpt-3",
        label: "GPT-3",
        provider: "OpenAI",
        description: "Legacy model, lightweight and inexpensive",
        priceInput: 0.002,
        priceOutput: 0.002,
        badge: "cheap",
    },
    {
        id: "mistral",
        label: "Mistral",
        provider: "Mistral AI",
        description: "Open-weight model with strong reasoning capabilities",
        priceInput: 0.25,
        priceOutput: 0.25,
        badge: "balanced",
    },
    {
        id: "google/gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        provider: "Google",
        description: "Gemini 2.5 optimized for latency-sensitive applications",
        priceInput: 1,
        priceOutput: 4,
        badge: "fast",
    }
];

export const LLMSRewriter: ModelOption[] = [
    {
        id: "gpt-4o",
        label: "GPT-4o",
        provider: "OpenAI",
        description: "Best semantic understanding for query reformulation",
        priceInput: 2.5,
        priceOutput: 10,
        badge: "smart",
    },
    {
        id: "gpt-3.5",
        label: "GPT-3.5",
        provider: "OpenAI",
        description: "Quick rewriting with good quality",
        priceInput: 0.5,
        priceOutput: 1.5,
        badge: "fast",
    },
    {
        id: "gpt-3",
        label: "GPT-3",
        provider: "OpenAI",
        description: "Lightweight rewriting at minimal cost",
        priceInput: 0.002,
        priceOutput: 0.002,
        badge: "cheap",
    },
    {
        id: "mistral",
        label: "Mistral",
        provider: "Mistral AI",
        description: "Efficient and accurate query rewriting",
        priceInput: 0.25,
        priceOutput: 0.25,
        badge: "balanced",
    },
    {
        id: "google/gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        provider: "Google",
        description: "Fast rewriting with strong contextual understanding",
        priceInput: 1,
        priceOutput: 4,
        badge: "fast",
    }
];

export const ReRanker: ModelOption[] = [
    {
        id: "bge",
        label: "BGE",
        provider: "BAAI",
        description: "Top-performing open-source reranker for RAG pipelines",
        priceInput: 0,
        priceOutput: 0,
        badge: "smart",
    },
    {
        id: "colbert",
        label: "colBERT",
        provider: "Stanford",
        description: "Late-interaction model, fast and accurate",
        priceInput: 0,
        priceOutput: 0,
        badge: "balanced",
    },
    {
        id: "gpt-3",
        label: "GPT-3",
        provider: "OpenAI",
        description: "LLM-based reranking, flexible but costly",
        priceInput: 0.002,
        priceOutput: 0.002,
        badge: "cheap",
    },
    {
        id: "claude",
        label: "Claude",
        provider: "Anthropic",
        description: "High-quality reranking with strong contextual reasoning",
        priceInput: 3,
        priceOutput: 15,
        badge: "smart",
    },
    {
        id: "google/gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        provider: "Google",
        description: "Fast reranking with good contextual understanding",
        priceInput: 1,
        priceOutput: 4,
        badge: "fast",
    }
];

export const LLMS_LABELS = LLMS.map((m) => m.label);
export const ReRanker_LABELS = ReRanker.map((m) => m.label);
export const LLMSRewriter_LABELS = LLMSRewriter.map((m) => m.label);
