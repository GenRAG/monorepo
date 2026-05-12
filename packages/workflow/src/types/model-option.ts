export interface ModelOption {
    id: string;
    label: string;
    provider: string;
    description: string;
    priceInput: number;
    priceOutput: number;
    badge?: "fast" | "smart" | "balanced" | "cheap";
}
