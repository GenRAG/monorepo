import type { ReactNode } from "react";
import { HStack, Text, VStack } from "@chakra-ui/react";
import { LucideIcon } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    icon?: LucideIcon;
}

export const SectionHeader = ({ title, subtitle, action, icon }: SectionHeaderProps) => {
    return (
        <HStack justify="space-between" p={4} borderBottom="1px solid" borderBottomColor="borderDefault">
            <HStack spacing={3}>
                {icon && <BoxIcon icon={icon} />}
                <VStack align="start" spacing={0.5}>
                    <Text fontSize="sm" fontWeight={600} color="textPrimary">
                        {title}
                    </Text>
                    {subtitle && (
                        <Text fontSize="xs" color="textSubtle">
                            {subtitle}
                        </Text>
                    )}
                </VStack>
            </HStack>
            {action}
        </HStack>
    );
};

export default SectionHeader;
