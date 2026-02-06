import { Box, HStack, Text, useColorMode } from "@chakra-ui/react";

type ImpactBarProps = {
    label: string;
    value: number;
};

export const ImpactBar = ({ label, value }: ImpactBarProps) => {
    const { colorMode } = useColorMode();

    return (
        <HStack spacing={3}>
            <Text
                fontSize="xs"
                minW="120px"
                color={colorMode === "dark" ? "grey.400" : "grey.600"}
            >
                {label}
            </Text>

            <Box
                flex={1}
                h="6px"
                borderRadius="full"
                bg={colorMode === "dark" ? "grey.800" : "grey.200"}
                overflow="hidden"
            >
                <Box
                    h="100%"
                    w={`${Math.round(value * 100)}%`}
                    bg="green.500"
                    borderRadius="full"
                    transition="width 0.6s ease"
                />
            </Box>
        </HStack>
    );
};
