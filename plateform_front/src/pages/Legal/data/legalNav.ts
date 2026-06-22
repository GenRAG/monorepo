import { Shield, FileText, Scale, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SubSection {
    label: string;
    hash: string;
}

export interface LegalNavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
    subsections: SubSection[];
}

export const LEGAL_NAV: LegalNavItem[] = [
    {
        id: "privacy",
        label: "Politique de confidentialité",
        icon: Shield,
        href: "/legal/privacy",
        subsections: [
            { label: "Données collectées", hash: "data-collection" },
            { label: "Utilisation des données", hash: "data-use" },
            { label: "Cookies", hash: "cookies" },
            { label: "Vos droits (RGPD)", hash: "rights" },
            { label: "Contact DPO", hash: "dpo" },
        ],
    },
    {
        id: "terms",
        label: "Conditions d'utilisation",
        icon: FileText,
        href: "/legal/terms",
        subsections: [
            { label: "Accès au service", hash: "access" },
            { label: "Usage acceptable", hash: "usage" },
            { label: "Propriété intellectuelle", hash: "ip" },
            { label: "Responsabilité", hash: "liability" },
            { label: "Modifications", hash: "changes" },
        ],
    },
    {
        id: "notices",
        label: "Mentions légales",
        icon: Scale,
        href: "/legal/notices",
        subsections: [
            { label: "Éditeur", hash: "editor" },
            { label: "Hébergement", hash: "hosting" },
            { label: "Directeur de publication", hash: "director" },
        ],
    },
    {
        id: "contact",
        label: "Contact",
        icon: Mail,
        href: "/legal/contact",
        subsections: [
            { label: "Coordonnées", hash: "coordinates" },
            { label: "Formulaire", hash: "form" },
        ],
    },
];
