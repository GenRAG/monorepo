export interface ModelOption {
    id: string;
    label: string;
    provider: string;
    description: string;
    priceInput: number;
    priceOutput: number;
    badge?: "fast" | "smart" | "balanced" | "cheap";
}

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
];

export const LLMS_LABELS = LLMS.map((m) => m.label);
export const ReRanker_LABELS = ReRanker.map((m) => m.label);
export const LLMSRewriter_LABELS = LLMSRewriter.map((m) => m.label);
