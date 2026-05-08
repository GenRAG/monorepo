import { HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";

export const ActivityMetrics = () => {
    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");

    return (
        <HStack px={4} spacing={6} flexWrap="wrap" rowGap={3} pb={2} w="100%">
            <VStack align="start" spacing={0}>
                <Text fontSize="sm" color={textSecondary}>
                    Total 73
                </Text>
                <HStack spacing={2} align="baseline" flexWrap="wrap">
                    <Text fontSize="xl" fontWeight="700" color={textPrimary}>
                        8 240
                    </Text>
                    <Text fontSize="xs" color="green.400" whiteSpace="nowrap">
                        +24% vs. période précédente
                    </Text>
                </HStack>
            </VStack>
            <VStack align="start" spacing={0}>
                <Text fontSize="sm" color={textSecondary}>
                    Sessions uniques
                </Text>
                <Text fontSize="xl" fontWeight="700" color={textPrimary}>
                    1 320
                </Text>
            </VStack>
            <VStack align="start" spacing={0}>
                <Text fontSize="sm" color={textSecondary}>
                    Avg / jour
                </Text>
                <Text fontSize="xl" fontWeight="700" color={textPrimary}>
                    1 177
                </Text>
            </VStack>
        </HStack>
    );
};
