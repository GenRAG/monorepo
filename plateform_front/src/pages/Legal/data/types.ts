export interface SectionSubpart {
    title: string;
    items: string[];
}

export interface SectionData {
    number: number;
    id: string;
    title: string;
    intro?: string;
    subparts?: SectionSubpart[];
    bullets?: string[];
    table?: { key: string; value: string }[];
    infoBox?: string;
    text?: string;
}
