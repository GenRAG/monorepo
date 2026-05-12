import { Box, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
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
    const bgColor = useColorModeValue("green.100", "green.700");
    const borderColor = useColorModeValue("green.300", "green.600");
    const textColor = useColorModeValue("green.800", "green.200");
    const titleColor = useColorModeValue("grey.900", "grey.100");
    const isMobile = useAppResponsive({ base: true, lg: false });

    return (
        <Box
            w="100%"
            p={isMobile ? 2 : 4}
            bg={bgColor}
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
        >
            <HStack spacing={3}>
                <VStack align="start" spacing={0} flex={1}>
                    <Text
                        fontWeight="semibold"
                        fontSize={isMobile ? "sm" : "md"}
                        color={titleColor}
                    >
                        {level} / 5 — {title}
                    </Text>
                    {!isMobile && (
                        <Text fontSize="xs" color={textColor}>
                            {description}
                        </Text>
                    )}
                </VStack>
            </HStack>
        </Box>
    );
};

export default StepLevel;
