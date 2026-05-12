import React from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";

interface PreviewInfoRowProps {
    icon: any;
    label: string;
    value: string;
}

export const PreviewInfoRow: React.FC<PreviewInfoRowProps> = ({
    icon,
    label,
    value,
}) => {
    return (
        <HStack spacing={3} align="start">
            <Box as={icon} color="gray.400" fontSize="16px" mt={0.5} />
            <VStack align="start" spacing={0} flex={1}>
                <Text
                    fontSize="xs"
                    color="textPrimary"
                    textTransform="uppercase"
                    letterSpacing="wide"
                >
                    {label}
                </Text>
                <Text fontSize="sm" color="textPrimary" fontWeight="medium">
                    {value}
                </Text>
            </VStack>
        </HStack>
    );
};
