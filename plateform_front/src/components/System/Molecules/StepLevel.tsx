import { Box, HStack, Text, useColorMode, VStack } from "@chakra-ui/react";
import { useAppResponsive } from "hooks/useAppResponsive";

interface StepLevelProps {
    level: number;
    title: string;
    description: string;
}

const StepLevel: React.FC<StepLevelProps> = ({
    level,
    description,
    title,
}: StepLevelProps) => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });

    return (
        <Box
            w="100%"
            p={isMobile ? 2 : 4}
            bg={colorMode === "dark" ? "grey.700" : "grey.50"}
            borderRadius="12px"
            border={`1px solid ${colorMode === "dark" ? "grey.600" : "grey.200"}`}
        >
            <HStack spacing={3}>
                <VStack align="start" spacing={0} flex={1}>
                    <Text
                        fontWeight="semibold"
                        color={colorMode === "dark" ? "white" : "grey.900"}
                        fontSize={isMobile ? "sm" : "md"}
                    >
                        {level} / 5 — {title}
                    </Text>
                    {!isMobile && (
                        <Text
                            fontSize="xs"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.500"
                            }
                        >
                            {description}
                        </Text>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
};

export default StepLevel;
