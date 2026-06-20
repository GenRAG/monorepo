import { Box, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import Button from "components/ui/Button";
import type { ComponentType } from "react";

interface Tab {
    value: string;
    label: string;
    icon?: ComponentType<{ size?: number }>;
}

interface TabBarProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tab: string) => void;
}

export const TabBar = ({ tabs, activeTab, onChange }: TabBarProps) => {
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <HStack spacing={0} borderBottom="1px solid" borderColor={borderColor}>
            {tabs.map(({ value, label, icon: Icon }) => {
                const isActive = activeTab === value;
                return (
                    <Button key={value} variant="ghost" onClick={() => onChange(value)} position="relative">
                        <HStack spacing={1.5}>
                            {Icon && <Icon size={14} />}
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
