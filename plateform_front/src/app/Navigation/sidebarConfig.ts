import {
    LayoutDashboard,
    Folder,
    FileText,
    MessageCircle,
    GitGraph,
    Settings,
    CreditCard,
    Cloud,
    BarChart3,
    type LucideIcon,
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
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "agents", icon: Folder, label: "Agents" },
    { id: "assistants", icon: MessageCircle, label: "Assistants" },
    { id: "billing", icon: CreditCard, label: "Crédits" },
];

export const supportMenu = [];

export const agentNavSections: NavSection[] = [
    {
        label: "Menu",
        items: [{ id: "retour", icon: LayoutDashboard, label: "Retour au menu" }],
    },
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
            { id: "analytics", icon: BarChart3, label: "Analytics" },
            { id: "deploy", icon: Cloud, label: "Déploiement" },
        ],
    },
    {
        label: "Général",
        items: [{ id: "settings", icon: Settings, label: "Paramètres" }],
    },
];

export const agentNavItems: NavItem[] = agentNavSections.flatMap((s) => s.items);
