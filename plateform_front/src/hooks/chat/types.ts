export interface RagSource {
    index: number;
    title: string;
    score: number | null;
    text_preview?: string;
}

export type ThinkingEvent =
    | { kind: "status"; id: string; text: string }
    | { kind: "sources"; id: string; sources: RagSource[] };
