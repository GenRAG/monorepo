import { MessageCircle, Search, Zap } from "lucide-react";

export const CARD_META = [
    {
        key: "standard" as const,
        title: "STANDARD",
        badge: "Rapide",
        isRecommended: false,
        icon: Zap,
        advantages: ["Réponse instantanée", "Idéal pour les questions simples"],
    },
    {
        key: "precise" as const,
        title: "PRÉCIS",
        badge: "Recommandé",
        isRecommended: true,
        icon: Search,
        advantages: ["Citations et articles précis", "Analyse approfondie des documents"],
    },
    {
        key: "creative" as const,
        title: "CRÉATIF",
        badge: "Convivial",
        isRecommended: false,
        icon: MessageCircle,
        advantages: ["Ton chaleureux et engageant", "Meilleure expérience utilisateur"],
    },
];
