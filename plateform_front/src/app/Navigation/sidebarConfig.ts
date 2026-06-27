import {
    LayoutDashboard,
    Folder,
    FileText,
    Bell,
    MessageCircle,
    GitGraph,
    Settings,
    CreditCard,
    Cloud,
    type LucideIcon,
    TowerControl,
} from "lucide-react";

export interface NavItem {
    id: string;
    icon: LucideIcon;
    label: string;
}

export interface NavSection {
    label: string;
    items: NavItem[];
}

export const mainMenu = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { id: "agents", icon: Folder, label: "Agents" },
    { id: "assistants", icon: MessageCircle, label: "Assistants" },
    { id: "billing", icon: CreditCard, label: "Crédits" },
];

export const supportMenu = [{ id: "notifications", icon: Bell, label: "Documentation" }];

export const agentNavSections: NavSection[] = [
    {
        label: "Développement",
        items: [
            { id: "playground", icon: MessageCircle, label: "Test & chat" },
            { id: "documents", icon: FileText, label: "Documents" },
            { id: "workflow", icon: GitGraph, label: "Architecture" },
        ],
    },
    {
        label: "Production",
        items: [
            { id: "deploy", icon: Cloud, label: "Déploiement" },
            { id: "access-control", icon: TowerControl, label: "Contrôle d'accès" },
        ],
    },
    {
        label: "Général",
        items: [{ id: "settings", icon: Settings, label: "Paramètres" }],
    },
];

export const agentNavItems: NavItem[] = agentNavSections.flatMap((s) => s.items);
