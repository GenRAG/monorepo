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
