import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { DEMO_EASE, DEMO_SPRING, DemoCard } from "components/ui/demo/DemoStage";

const CHUNKS = [
    {
        lines: [92, 78, 85],
        vector: [0.8, 0.3, 0.6, 0.9, 0.2, 0.5, 0.7, 0.4, 0.95, 0.3],
    },
    {
        lines: [88, 95, 60],
        vector: [0.4, 0.9, 0.2, 0.5, 0.8, 0.35, 0.6, 0.9, 0.25, 0.7],
    },
    {
        lines: [80, 70, 45],
        vector: [0.6, 0.45, 0.85, 0.3, 0.55, 0.9, 0.2, 0.65, 0.5, 0.8],
    },
];

export const DocumentChunks = ({ chunks }: { chunks: number }) => (
    <HStack h="100%" spacing={3} align="center" justify="center">
        <DemoCard w="118px" p={2.5} flexShrink={0}>
            <HStack spacing={1.5} mb={2}>
                <Icon as={FileText} boxSize="11px" color="iconAccent" />
                <Text variant="body-2xs-semibold" color="textPrimary">
                    guide_rh.pdf
                </Text>
            </HStack>
            <VStack spacing={1.5} align="stretch">
                {CHUNKS.map((chunk, i) => (
                    <Box
                        key={i}
                        p={1}
                        borderRadius="6px"
                        borderWidth="1px"
                        borderStyle="solid"
                        borderColor={i < chunks ? "borderAccentCardActive" : "transparent"}
                        bg={i < chunks ? "accentCardBg" : "transparent"}
                        transition="all 0.4s ease"
                    >
                        <VStack spacing="4px" align="stretch">
                            {chunk.lines.map((w, j) => (
                                <Box
                                    key={j}
                                    h="3px"
                                    w={`${w}%`}
                                    borderRadius="999px"
                                    bg={i < chunks ? "iconAccent" : "dotInactive"}
                                    opacity={i < chunks ? 0.7 : 1}
                                    transition="all 0.4s ease"
                                />
                            ))}
                        </VStack>
                    </Box>
                ))}
            </VStack>
        </DemoCard>

        <VStack spacing="10px" align="stretch" flex={1} maxW="200px">
            {CHUNKS.map((chunk, i) => (
                <VectorRow key={i} index={i} values={chunk.vector} visible={i < chunks} />
            ))}
        </VStack>
    </HStack>
);

const VectorRow = ({ index, values, visible }: { index: number; values: number[]; visible: boolean }) => (
    <motion.div
        initial={false}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -36 }}
        transition={visible ? DEMO_SPRING : { duration: 0 }}
    >
        <HStack spacing={2}>
            <Text variant="body-2xs-muted" fontFamily="mono" w="22px">
                v{index + 1}
            </Text>
            <HStack spacing="3px" h="22px" align="flex-end" flex={1}>
                {values.map((v, j) => (
                    <motion.div
                        key={j}
                        initial={false}
                        animate={{ scaleY: visible ? v : 0 }}
                        transition={{
                            duration: 0.5,
                            delay: visible ? 0.15 + j * 0.035 : 0,
                            ease: DEMO_EASE,
                        }}
                        style={{
                            flex: 1,
                            height: "100%",
                            transformOrigin: "bottom",
                            borderRadius: 2,
                            background: "var(--chakra-colors-iconAccent)",
                            opacity: 0.35 + v * 0.65,
                        }}
                    />
                ))}
            </HStack>
        </HStack>
    </motion.div>
);
