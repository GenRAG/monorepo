import { BarChart3, CreditCard } from "lucide-react";
import { TabBar } from "components/ui/TabBar";

export enum AnalyticsTab {
    Overview = "overview",
    Costs = "costs",
}

const TABS = [
    { value: AnalyticsTab.Overview, label: "Vue d'ensemble", icon: BarChart3 },
    { value: AnalyticsTab.Costs, label: "Crédits", icon: CreditCard },
];

interface AnalyticsTabsProps {
    activeTab: AnalyticsTab;
    onChange: (tab: AnalyticsTab) => void;
}

export const AnalyticsTabs = ({ activeTab, onChange }: AnalyticsTabsProps) => (
    <TabBar tabs={TABS} activeTab={activeTab} onChange={(v) => onChange(v as AnalyticsTab)} />
);
