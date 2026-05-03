import { Box, HStack, Text } from "@chakra-ui/react";
import { Activity, Clock } from "lucide-react";
import type { ComponentType } from "react";
import Button from "components/System/Atoms/Button";

export enum DeploymentTab {
    Dashboard = "dashboard",
    Versions = "versions",
}

interface TabConfig {
    key: DeploymentTab;
    label: string;
    icon: ComponentType<{ size?: number }>;
}

const TABS: TabConfig[] = [
    { key: DeploymentTab.Dashboard, label: "Tableau de bord", icon: Activity },
    { key: DeploymentTab.Versions, label: "Versions", icon: Clock },
];

interface DeploymentTabsProps {
    activeTab: DeploymentTab;
    onChange: (tab: DeploymentTab) => void;
}

export const DeploymentTabs = ({
    activeTab,
    onChange,
}: DeploymentTabsProps) => {
    return (
        <HStack spacing={0}>
            {TABS.map(({ key, label, icon: Icon }) => {
                const isActive = activeTab === key;

                return (
                    <Button
                        key={key}
                        variant="ghost"
                        onClick={() => onChange(key)}
                    >
                        <HStack>
                            <Icon size={14} />
                            <Text fontSize="sm">{label}</Text>
                        </HStack>
                        {isActive && (
                            <Box
                                position="absolute"
                                bottom="-1px"
                                left={0}
                                right={0}
                                h="4px"
                                bg="green.500"
                                borderRadius="12px 12px 0 0"
                            />
                        )}
                    </Button>
                );
            })}
        </HStack>
    );
};
