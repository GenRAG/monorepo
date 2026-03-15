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
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "workspaces", icon: Folder, label: "Agents" },
    { id: "assistants", icon: MessageCircle, label: "Assistants" },
    { id: "billing", icon: CreditCard, label: "Billing" },
];

export const supportMenu = [
    { id: "help", icon: HelpCircle, label: "Help center" },
    { id: "notifications", icon: Bell, label: "Documentation" },
];

export const agentMenu = [
    { id: "playground", icon: MessageCircle, label: "Playground" },
];

export const agentFeaturesMenu = [
    { id: "workflow", icon: GitGraph, label: "Workflow" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "deploy", icon: Cloud, label: "Deployment" },
];

export const agentSettingsMenu = [
    { id: "settings", icon: Settings, label: "Settings" },
];

export const workspaceMenu = agentMenu;
export const workspaceFeaturesMenu = agentFeaturesMenu;
export const workspaceSettingsMenu = agentSettingsMenu;
