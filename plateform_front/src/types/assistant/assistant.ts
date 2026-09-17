export type SourceFileType = "PDF" | "DOCX" | "MD" | "TXT" | "HTML" | "DOC";

export interface QuerySource {
    index: number;
    title: string;
    score: number | null;
    excerpt: string;
    fileType: SourceFileType;
}

export interface QueryDetailsInfo {
    receivedAt: string;
    agentTitle: string;
    agentVersion?: string;
    durationMs?: number;
    documentsConsulted: number;
}
