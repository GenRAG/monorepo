import { BarChart3, CreditCard } from "lucide-react";
import { GlassTabBar } from "components/ui/GlassTabBar";

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
    <GlassTabBar tabs={TABS} activeTab={activeTab} onChange={onChange} />
);
