import { useState, type ComponentType, type ReactNode } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { DEMO_EASE } from "components/ui/demo/DemoStage";

export interface DemoAnimationProps {
    onChapterChange?: (index: number) => void;
}

interface OverviewStep {
    title: string;
    description: string;
}

interface NodeOverviewLayoutProps {
    title: string;
    description: ReactNode;
    highlight: ReactNode;
    animation: ComponentType<DemoAnimationProps>;
    steps: OverviewStep[];
}

export const NodeOverviewLayout = ({
    title,
    description,
    highlight,
    animation: Animation,
    steps,
}: NodeOverviewLayoutProps) => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color="textPrimary">
                    {title}
                </Text>
                <Text fontSize="sm" color="textDescription">
                    {description}
                </Text>
                <Text fontSize="sm" mt={2} color="textDescription">
                    {highlight}
                </Text>
            </Box>

            <Box
                position="relative"
                w="100%"
                h="260px"
                flexShrink={0}
                bg="backgroundDefault"
                borderRadius="16px"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="borderDivider"
                overflow="hidden"
            >
                <Animation onChapterChange={setActiveStep} />
            </Box>

            <VStack spacing={1} align="stretch">
                {steps.map((step, index) => {
                    const isActive = index === activeStep;
                    return (
                        <Box key={step.title} position="relative" px={3} py={2} borderRadius="10px">
                            {isActive && (
                                <motion.div
                                    layoutId="overview-active-step"
                                    transition={{ duration: 0.45, ease: DEMO_EASE }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: 10,
                                        background: "var(--chakra-colors-accentCardBg)",
                                    }}
                                />
                            )}
                            <Box position="relative">
                                <HStack spacing={2} mb={0.5}>
                                    <Box
                                        w="8px"
                                        h="8px"
                                        borderRadius="999px"
                                        bg={isActive ? "iconAccent" : "dotInactive"}
                                        boxShadow={isActive ? "0 0 0 4px rgba(52,211,169,0.2)" : "none"}
                                        transition="all 0.4s ease"
                                    />
                                    <Text
                                        variant="body-sm-semibold"
                                        color={isActive ? "textPrimary" : "textLabel"}
                                        transition="color 0.4s ease"
                                    >
                                        {index + 1}. {step.title}
                                    </Text>
                                </HStack>
                                <Text variant="body-xs" color="textDescription" pl={4}>
                                    {step.description}
                                </Text>
                            </Box>
                        </Box>
                    );
                })}
            </VStack>
        </VStack>
    );
};
