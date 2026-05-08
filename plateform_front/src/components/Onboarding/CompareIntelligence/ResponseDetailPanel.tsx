import React from "react";
import {
    Box,
    HStack,
    Icon,
    Text,
    VStack,
    useColorMode,
} from "@chakra-ui/react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface ResponseAdvantage {
    title: string;
    advantages: string[];
}

interface ResponseDetailPanelProps {
    selectedIndex: number;
    responseText: string;
    responseAdvantages: ResponseAdvantage[];
    responseDescriptions: string[];
}

const ResponseDetailPanel: React.FC<ResponseDetailPanelProps> = ({
    selectedIndex,
    responseText,
    responseAdvantages,
    responseDescriptions,
}) => {
    const { colorMode } = useColorMode();
    const advantage = responseAdvantages[selectedIndex];

    return (
        <Box
            w={{ base: "100%", lg: "400px" }}
            minH="280px"
            flexShrink={0}
            border="2px solid rgba(0, 255, 187, 0.46)"
            borderRadius="12px"
            p={6}
            className="slide-in-from-left"
            bg={colorMode === "dark" ? "grey.800" : "grey.50"}
        >
            <VStack align="stretch" spacing={4}>
                <HStack spacing={3}>
                    <Icon
                        as={Sparkles}
                        boxSize={5}
                        color={currentDarkTheme.primary}
                    />
                    <VStack align="start" spacing={1} flex={1}>
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "white" : "grey.900"}
                        >
                            {advantage.title}
                        </Text>
                        <Text
                            fontSize="sm"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.600"
                            }
                        >
                            {responseDescriptions[selectedIndex]}
                        </Text>
                    </VStack>
                </HStack>

                <Box
                    p={4}
                    bg={colorMode === "dark" ? "grey.700" : "white"}
                    borderRadius="8px"
                    border={`1px solid ${colorMode === "dark" ? "grey.600" : "#E2E8F0"}`}
                >
                    <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "grey.200" : "grey.700"}
                        lineHeight="1.6"
                    >
                        {responseText}
                    </Text>
                </Box>

                <Box>
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={colorMode === "dark" ? "white" : "grey.900"}
                        mb={3}
                    >
                        Advantages of this intelligence:
                    </Text>
                    <VStack align="stretch" spacing={2}>
                        {advantage.advantages.map((adv, index) => (
                            <HStack key={index} spacing={2} align="flex-start">
                                <Icon
                                    as={CheckCircle2}
                                    boxSize={4}
                                    color={currentDarkTheme.primary}
                                    mt={0.5}
                                    flexShrink={0}
                                />
                                <Text
                                    fontSize="sm"
                                    color={
                                        colorMode === "dark"
                                            ? "grey.300"
                                            : "grey.700"
                                    }
                                >
                                    {adv}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default ResponseDetailPanel;
