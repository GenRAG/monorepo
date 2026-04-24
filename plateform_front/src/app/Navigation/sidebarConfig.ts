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
} from "lucide-react";

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

export const agentMenu = [
    { id: "playground", icon: MessageCircle, label: "Bac à sable" },
];

export const agentFeaturesMenu = [
    { id: "workflow", icon: GitGraph, label: "Flux de travail" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "deploy", icon: Cloud, label: "Déploiement" },
];

export const agentSettingsMenu = [
    { id: "settings", icon: Settings, label: "Paramètres" },
];

export const workspaceMenu = agentMenu;
export const workspaceFeaturesMenu = agentFeaturesMenu;
export const workspaceSettingsMenu = agentSettingsMenu;
