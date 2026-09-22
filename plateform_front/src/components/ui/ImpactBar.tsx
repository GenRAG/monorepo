import { Box, HStack, Text } from "@chakra-ui/react";

type ImpactBarProps = {
    label: string;
    value: number;
};

export const ImpactBar = ({ label, value }: ImpactBarProps) => {
    const pct = Math.round(value * 100);

    return (
        <Box w="100%">
            <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="textDescription">
                    {label}
                </Text>
                <Text fontSize="xs" fontWeight={600} color="iconAccent">
                    {pct}%
                </Text>
            </HStack>
            <Box w="100%" h="6px" borderRadius="full" bg="borderStrong" overflow="hidden">
                <Box h="100%" w={`${pct}%`} bg="iconAccent" borderRadius="full" transition="width 0.6s ease" />
            </Box>
        </Box>
    );
};
