import { Box, Icon, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import Button from "components/ui/Button";

interface CardEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    iconBgColor?: string;
    action?: {
        label: string;
        icon?: LucideIcon;
        onClick: () => void;
    };
}

export const CardEmptyState = ({ icon, title, description, iconBgColor, action }: CardEmptyStateProps) => {
    const iconBg = useColorModeValue("grey.100", "grey.800");
    const iconColor = useColorModeValue("grey.500", "grey.400");
    const titleColor = useColorModeValue("grey.700", "grey.200");
    const descColor = useColorModeValue("grey.500", "grey.400");

    return (
        <VStack spacing={3} py={6} px={4} align="center" justify="center" flex={1} textAlign="center">
            <Box
                w="40px"
                h="40px"
                borderRadius="10px"
                bg={iconBgColor ?? iconBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                <Icon as={icon} boxSize={4} color={iconBgColor ? "white" : iconColor} />
            </Box>
            <VStack spacing={1}>
                <Text fontSize="sm" fontWeight="600" color={titleColor}>
                    {title}
                </Text>
                {description && (
                    <Text fontSize="xs" color={descColor} maxW="200px" lineHeight="1.5">
                        {description}
                    </Text>
                )}
            </VStack>
            {action && (
                <Button size="sm" variant="secondary" leftIcon={action.icon} onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </VStack>
    );
};
