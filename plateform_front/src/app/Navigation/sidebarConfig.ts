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
    { id: "workspaces", icon: Folder, label: "Workspaces" },
    { id: "assistants", icon: MessageCircle, label: "Assistants" },
    { id: "billing", icon: CreditCard, label: "Billing" },
];

export const supportMenu = [
    { id: "help", icon: HelpCircle, label: "Help center" },
    { id: "notifications", icon: Bell, label: "Documentation" },
];

export const workspaceMenu = [
    { id: "chat", icon: MessageCircle, label: "Chat" },
];

export const workspaceFeaturesMenu = [
    { id: "workflow", icon: GitGraph, label: "Workflow" },
    { id: "documents", icon: FileText, label: "Documents" },
    /*{ id: "analytics", icon: BarChart2, label: "Analytics" },*/
    { id: "deployment", icon: Cloud, label: "Deployment" },
];

export const workspaceSettingsMenu = [
    { id: "settings", icon: Settings, label: "Settings" },
];
