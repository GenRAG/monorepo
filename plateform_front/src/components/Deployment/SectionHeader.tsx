import type { ReactNode } from "react";
import { HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export const SectionHeader = ({
    title,
    subtitle,
    action,
}: SectionHeaderProps) => {
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const subtitleColor = useColorModeValue("grey.300", "grey.500");

    return (
        <HStack
            justify="space-between"
            p={4}
            borderBottom="1px solid"
            borderBottomColor={borderColor}
        >
            <VStack align="start" spacing={0.5}>
                <Text fontSize="sm" fontWeight={600} color={titleColor}>
                    {title}
                </Text>
                {subtitle && (
                    <Text fontSize="xs" color={subtitleColor}>
                        {subtitle}
                    </Text>
                )}
            </VStack>

            {action}
        </HStack>
    );
};

export default SectionHeader;
