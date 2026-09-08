export interface RagModelPricing {
    prompt: string;
    completion: string;
}

export interface RagModel {
    id: string;
    name: string;
    description?: string;
    pricing?: RagModelPricing;
    context_length?: number;
    architecture?: {
        input_modalities: string[];
        output_modalities: string[];
    };
    supported_parameters?: string[];
    provider?: string;
}

export interface RagModelInfo {
    id: string;
    name: string;
    badge: string;
    scores: {
        quality: number;
        speed: number;
        economy: number;
    };
    details: {
        context_length: number;
        max_output_tokens: number;
        latency_ms: number;
        latency_label: string;
        prompt_price_per_million: number;
        completion_price_per_million: number;
    };
}
