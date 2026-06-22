import { VersionStatus } from "types/deployment/deployment";

export interface Version {
    id: string;
    env: VersionStatus;
    description: string;
    date: string;
    author: string;
    model: string;
    documents: string;
    tools: string;
    temperature: string;
    pipeline: object;
}

export const ENV_BADGE: Record<Version["env"], { label: string; color: string; bg: string; borderToken: string }> = {
    prod: {
        label: "PROD",
        color: "green",
        bg: "var(--chakra-colors-green-950)",
        borderToken: "var(--chakra-colors-green-700)",
    },
    archived: {
        label: "ARCHIVÉ",
        color: "grey",
        bg: "transparent",
        borderToken: "var(--chakra-colors-grey-700)",
    },
};

export const VERSIONS: Version[] = [
    {
        id: "v12",
        env: "archived",
        description: "Mise à jour modèle et prompt système",
        date: "12 fév 2026",
        author: "Q. Bollore",
        model: "claude-sonnet-4",
        documents: "1 248",
        tools: "2 / 3",
        temperature: "0.3",
        pipeline: {
            id: "wf_9x2km1",
            version: 12,
            created_at: "2026-02-12T14:32:00Z",
            model: {
                provider: "anthropic",
                name: "claude-sonnet-4",
                temperature: 0.3,
                max_tokens: 2048,
            },
            prompt: {
                system: "Tu es un assistant juridique spécialisé dans le droit français des affaires. Réponds uniquement à partir des documents fournis. Si l'information n'est pas disponible, dis-le clairement.",
                style: "formal",
                guardrails: ["no_hallucination", "cite_sources"],
            },
            rag: {
                enabled: true,
                index: "idx_legal_fr_v3",
                top_k: 5,
                rerank: true,
                documents: 1248,
            },
            tools: ["document_lookup", "workspace_context"],
        },
    },
    {
        id: "v11",
        env: "prod",
        description: "Optimisation pipeline RAG et reranking",
        date: "7 fév 2026",
        author: "Q. Bollore",
        model: "gpt-4o",
        documents: "1 180",
        tools: "1 / 3",
        temperature: "0.4",
        pipeline: {
            id: "wf_8m1kz9",
            version: 11,
            created_at: "2026-02-07T10:15:00Z",
            model: {
                provider: "openai",
                name: "gpt-4o",
                temperature: 0.4,
                max_tokens: 2048,
            },
            prompt: {
                system: "Assistant juridique.",
                style: "formal",
                guardrails: ["cite_sources"],
            },
            rag: {
                enabled: true,
                index: "idx_legal_fr_v2",
                top_k: 4,
                rerank: true,
                documents: 1180,
            },
            tools: ["document_lookup"],
        },
    },
    {
        id: "v10",
        env: "archived",
        description: "Ajout de 8 documents au corpus",
        date: "3 fév 2026",
        author: "Q. Bollore",
        model: "gpt-4o",
        documents: "1 172",
        tools: "1 / 3",
        temperature: "0.4",
        pipeline: {
            id: "wf_7k0pl2",
            version: 10,
            created_at: "2026-02-03T09:00:00Z",
            model: {
                provider: "openai",
                name: "gpt-4o",
                temperature: 0.4,
                max_tokens: 2048,
            },
            prompt: {
                system: "Assistant juridique.",
                style: "formal",
                guardrails: [],
            },
            rag: {
                enabled: true,
                index: "idx_legal_fr_v2",
                top_k: 4,
                rerank: false,
                documents: 1172,
            },
            tools: ["document_lookup"],
        },
    },
    {
        id: "v9",
        env: "archived",
        description: "Correction du prompt système",
        date: "28 jan 2026",
        author: "Q. Bollore",
        model: "gpt-4o",
        documents: "1 164",
        tools: "0 / 3",
        temperature: "0.5",
        pipeline: {},
    },
    {
        id: "v8",
        env: "archived",
        description: "Déploiement initial du workflow",
        date: "20 jan 2026",
        author: "Q. Bollore",
        model: "mistral-large",
        documents: "980",
        tools: "0 / 3",
        temperature: "0.7",
        pipeline: {},
    },
];

export const HEALTH_STATS = [
    {
        label: "DISPONIBILITÉ",
        value: "99.98%",
        sub: "30 derniers jours",
        data: [98.1, 99.0, 99.4, 99.6, 99.7, 99.9, 99.98],
    },
    {
        label: "LATENCE P95",
        value: "1.2s",
        sub: "stable",
        data: [1.7, 1.5, 1.4, 1.3, 1.4, 1.2, 1.2],
    },
    {
        label: "CONVERSATIONS/24H",
        value: "1 842",
        sub: "+12% vs hier",
        data: [1180, 1390, 1540, 1680, 1740, 1820, 1842],
    },
    {
        label: "COÛT QUOTIDIEN",
        value: "€47.20",
        sub: "0.0023 €/req",
        data: [34, 38, 41, 44, 45.5, 46.8, 47.2],
    },
    {
        label: "SATISFACTION",
        value: "94%",
        sub: "↑ 2 pts",
        data: [87, 89, 90, 91, 92, 93, 94],
    },
    {
        label: "TAUX D'ERREUR",
        value: "0.2%",
        sub: "sain",
        data: [0.9, 0.7, 0.5, 0.4, 0.3, 0.25, 0.2],
    },
];
