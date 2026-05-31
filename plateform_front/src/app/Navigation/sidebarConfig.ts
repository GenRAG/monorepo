import {
    LayoutDashboard,
    Folder,
    FileText,
    HelpCircle,
    Bell,
    MessageCircle,
    GitGraph,
    Settings,
    CreditCard,
    Cloud,
    BarChart2,
    type LucideIcon,
} from "lucide-react";

export interface NavItem {
    id: string;
    icon: LucideIcon;
    label: string;
}

export const mainMenu = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { id: "agents", icon: Folder, label: "Agents" },
    { id: "assistants", icon: MessageCircle, label: "Assistants" },
    { id: "billing", icon: CreditCard, label: "Facturation" },
];

export const supportMenu = [
    { id: "help", icon: HelpCircle, label: "Centre d'aide" },
    { id: "notifications", icon: Bell, label: "Documentation" },
];

export const agentNavItems: NavItem[] = [
    { id: "playground", icon: MessageCircle, label: "Test & chat" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "workflow", icon: GitGraph, label: "Architecture" },
    { id: "deploy", icon: Cloud, label: "Déploiement" },
    { id: "settings", icon: Settings, label: "Paramètres" },
];
