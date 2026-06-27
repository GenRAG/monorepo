import { Box, HStack, Text, useColorMode } from "@chakra-ui/react";

type ImpactBarProps = {
    label: string;
    value: number;
};

export const ImpactBar = ({ label, value }: ImpactBarProps) => {
    const { colorMode } = useColorMode();
    const pct = Math.round(value * 100);

    return (
        <Box w="100%">
            <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    {label}
                </Text>
                <Text fontSize="xs" fontWeight={600} color="green.500">
                    {pct}%
                </Text>
            </HStack>
            <Box
                w="100%"
                h="6px"
                borderRadius="full"
                bg={colorMode === "dark" ? "grey.800" : "grey.200"}
                overflow="hidden"
            >
                <Box h="100%" w={`${pct}%`} bg="green.500" borderRadius="full" transition="width 0.6s ease" />
            </Box>
        </Box>
    );
};
