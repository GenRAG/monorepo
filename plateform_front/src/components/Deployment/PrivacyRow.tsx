import { Box, Collapse, HStack, VStack, Text, Badge, useColorModeValue, Switch } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface PrivacyRowProps {
    title: string;
    description: string;
    recommended?: boolean;
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    comingSoon?: boolean;
    children?: ReactNode;
}

export const PrivacyRow = ({
    title,
    description,
    recommended,
    checked,
    onChange,
    disabled,
    comingSoon,
    children,
}: PrivacyRowProps) => {
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const titleColor = useColorModeValue(disabled ? "grey.400" : "grey.900", disabled ? "grey.600" : "grey.50");
    const descriptionColor = useColorModeValue("grey.400", "grey.500");

    return (
        <Box
            borderBottom="1px solid"
            borderBottomColor={borderColor}
            _last={{ borderBottom: "none" }}
            opacity={disabled ? 0.6 : 1}
        >
            <HStack justify="space-between" align="center" px={4} py={2}>
                <VStack align="start">
                    <HStack>
                        <Text fontSize="sm" fontWeight={500} color={titleColor}>
                            {title}
                        </Text>
                        {recommended && !comingSoon && (
                            <Badge colorScheme="green" size="xs">
                                Recommandé
                            </Badge>
                        )}
                        {comingSoon && (
                            <Badge colorScheme="grey" size="xs" variant="subtle">
                                Disponible prochainement
                            </Badge>
                        )}
                    </HStack>
                    <Text fontSize="xs" color={descriptionColor}>
                        {description}
                    </Text>
                </VStack>
                <Switch isChecked={checked} onChange={(e) => onChange(e.target.checked)} isDisabled={disabled} />
            </HStack>
            {children && (
                <Collapse in={checked} animateOpacity>
                    <Box px={4} pb={3}>
                        {children}
                    </Box>
                </Collapse>
            )}
        </Box>
    );
};
