import {
  LayoutDashboard, Folder, BarChart2, FileText,
  Puzzle, Building2, Users, HelpCircle, Bell,
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
