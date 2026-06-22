import { Activity, Clock } from "lucide-react";
import { TabBar } from "components/ui/TabBar";

export enum DeploymentTab {
    Dashboard = "dashboard",
    Versions = "versions",
}

const TABS = [
    { value: DeploymentTab.Dashboard, label: "Tableau de bord", icon: Activity },
    { value: DeploymentTab.Versions, label: "Versions", icon: Clock },
];

interface DeploymentTabsProps {
    activeTab: DeploymentTab;
    onChange: (tab: DeploymentTab) => void;
}

export const DeploymentTabs = ({ activeTab, onChange }: DeploymentTabsProps) => (
    <TabBar tabs={TABS} activeTab={activeTab} onChange={(v) => onChange(v as DeploymentTab)} />
);
