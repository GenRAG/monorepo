import {
  LayoutDashboard, Folder, BarChart2, FileText,
  Puzzle, Building2, Users, HelpCircle, Bell,
  MessageCircle,
  GitGraph,
  PuzzleIcon,
  Settings,
  CreditCard,
  Cloud,
} from "lucide-react";

export const mainMenu = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "workspaces", icon: Folder, label: "Workspaces" },
];

export const featureMenu = [
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "reports", icon: FileText, label: "Reports" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
  { id: "companies", icon: Building2, label: "Companies" },
  { id: "people", icon: Users, label: "People" },
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
  { id: "ressources", icon: PuzzleIcon, label: "Ressources" },
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "deployment", icon: Cloud, label: "Deployment" },
];

export const workspaceSettingsMenu = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "billing", icon: CreditCard, label: "Billing" },
];