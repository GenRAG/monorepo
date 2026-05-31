import type { ReactNode } from "react";
import { HStack, Text, VStack } from "@chakra-ui/react";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps) => {
    return (
        <HStack justify="space-between" p={4} borderBottom="1px solid" borderBottomColor="borderDefault">
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

            {action}
        </HStack>
    );
};

export default SectionHeader;
