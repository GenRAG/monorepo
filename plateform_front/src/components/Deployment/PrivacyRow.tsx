import {
    Box,
    HStack,
    VStack,
    Text,
    Badge,
    useColorModeValue,
    Switch,
} from "@chakra-ui/react";

interface PrivacyRowProps {
    title: string;
    description: string;
    recommended?: boolean;
    checked: boolean;
    onChange: (v: boolean) => void;
}

export const PrivacyRow = ({
    title,
    description,
    recommended,
    checked,
    onChange,
}: PrivacyRowProps) => {
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const titleColor = useColorModeValue("grey.900", "grey.50");
    const descriptionColor = useColorModeValue("grey.400", "grey.500");

    return (
        <Box
            borderBottom="1px solid"
            borderBottomColor={borderColor}
            _last={{ borderBottom: "none" }}
        >
            <HStack justify="space-between" align="center" px={4} py={2}>
                <VStack align="start">
                    <HStack>
                        <Text fontSize="sm" fontWeight={500} color={titleColor}>
                            {title}
                        </Text>
                        {recommended && (
                            <Badge colorScheme="green" size="xs">
                                Recommandé
                            </Badge>
                        )}
                    </HStack>
                    <Text fontSize="xs" color={descriptionColor}>
                        {description}
                    </Text>
                </VStack>
                <Switch
                    isChecked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </HStack>
        </Box>
    );
};
