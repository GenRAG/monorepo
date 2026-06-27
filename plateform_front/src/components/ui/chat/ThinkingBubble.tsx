import { Box, HStack, Text, useColorMode } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = ["Recherche dans les documents...", "Analyse du contexte...", "Formulation de la réponse..."];

const ThinkingBubble = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % STEPS.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box
            px={3}
            py={2.5}
            bg={isDark ? "grey.800" : "grey.50"}
            borderRadius="12px"
            borderBottomLeftRadius="2px"
            borderWidth="1px"
            borderStyle="solid"
            borderColor={isDark ? "grey.700" : "grey.200"}
            maxW="260px"
        >
            <HStack spacing={2} align="center">
                <HStack spacing="4px" flexShrink={0}>
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: isDark ? "#68D391" : "#38A169",
                            }}
                        />
                    ))}
                </HStack>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Text fontSize="xs" color={isDark ? "grey.400" : "grey.500"} whiteSpace="nowrap">
                            {STEPS[stepIndex]}
                        </Text>
                    </motion.div>
                </AnimatePresence>
            </HStack>
        </Box>
    );
};

export default ThinkingBubble;
