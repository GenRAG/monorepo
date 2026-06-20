import type { SectionData } from "./types";

export const NOTICES_SECTIONS: SectionData[] = [
    {
        number: 1,
        id: "editor",
        title: "Éditeur du site",
        table: [
            { key: "Nom", value: "Quentin Bolloré" },
            { key: "Statut", value: "Projet de fin d'études — en cours de développement" },
            { key: "E-mail", value: "quentin.bollore@epitech.eu" },
        ],
    },
    {
        number: 2,
        id: "hosting",
        title: "Hébergement",
        table: [
            {
                key: "Frontend",
                value: "Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com",
            },
            {
                key: "Backend",
                value: "Railway Corp. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — railway.app",
            },
            {
                key: "Base de données",
                value: "Neon Inc. — 650 Castro St #120-458, Mountain View, CA 94041, États-Unis — neon.tech",
            },
            {
                key: "Stockage des fichiers bruts",
                value: "Amazon Web Services Inc. — 410 Terry Ave N, Seattle, WA 98109, États-Unis — amazonaws.com",
            },
        ],
    },
    {
        number: 3,
        id: "ai",
        title: "Moteur RAG & intelligence artificielle",
        table: [
            { key: "Moteur RAG", value: "API propriétaire — FastAPI (Python), développée dans le cadre du projet" },
            { key: "Embeddings", value: "OpenRouter — openrouter.ai · Modèle : Qwen3-Embedding-8B (4096 dimensions)" },
            { key: "Base vectorielle", value: "Qdrant — qdrant.tech · Similarité cosinus, isolation par organisation" },
            { key: "Stockage documents", value: "MinIO (S3-compatible) — min.io · Fichiers isolés par organisation" },
            {
                key: "Modèles de génération",
                value: "Plus de 200 modèles disponibles via OpenRouter — openrouter.ai (OpenAI, Mistral AI, Meta, Google, Anthropic et d'autres fournisseurs)",
            },
            {
                key: "Données transmises",
                value: "Documents uploadés et requêtes utilisateurs sont traités par les fournisseurs ci-dessus pour indexation et génération de réponse",
            },
        ],
    },
    {
        number: 4,
        id: "director",
        title: "Directeur de publication",
        table: [
            { key: "Nom", value: "Quentin Bolloré" },
            { key: "Qualité", value: "Auteur du projet" },
            { key: "Contact", value: "quentin.bollore@epitech.eu" },
        ],
    },
];
