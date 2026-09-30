import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";
import { DEMO_EASE, DemoCard } from "components/ui/demo/DemoStage";
import { DemoCountUp } from "components/ui/demo/DemoCountUp";
import { ROW_H, type RerankerDoc } from "./ReRankerScene";

export interface ResultRowProps {
    doc: RerankerDoc;
    rank: number;
    scored: boolean;
    top: boolean;
    dropped: boolean;
    hovered: boolean;
}

export const ResultRow = ({ doc, rank, scored, top, dropped, hovered }: ResultRowProps) => (
    <DemoCard
        data-demo={`row-${doc.id}`}
        active={top}
        h={`${ROW_H}px`}
        px={2}
        display="flex"
        alignItems="center"
        transform={hovered ? "translateY(-2px)" : "none"}
        transition="border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease"
    >
        <HStack w="100%" spacing={2}>
            <Box
                w="20px"
                h="18px"
                borderRadius="5px"
                bg={top ? "iconAccent" : "surfaceSubtle"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="background 0.3s"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={rank}
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -8, opacity: 0 }}
                        transition={{ duration: 0.25, ease: DEMO_EASE }}
                    >
                        <Text variant="body-2xs-semibold" color={top ? "white" : "textLabel"}>
                            {rank}
                        </Text>
                    </motion.span>
                </AnimatePresence>
            </Box>
            <Icon as={FileText} boxSize="12px" color={dropped ? "textMuted" : "iconAccent"} />
            <Text
                variant="body-2xs-semibold"
                color="textPrimary"
                flex={1}
                noOfLines={1}
                textDecoration={dropped ? "line-through" : "none"}
            >
                {doc.name}
            </Text>
            {dropped ? (
                <Text variant="body-2xs-muted">écarté</Text>
            ) : (
                <ScoreCell sim={doc.sim} score={doc.score} scored={scored} />
            )}
        </HStack>
    </DemoCard>
);

const ScoreCell = ({ sim, score, scored }: { sim: number; score: number; scored: boolean }) => (
    <HStack spacing={1.5}>
        <Box w="40px" h="4px" borderRadius="999px" bg="dotInactive" overflow="hidden">
            <motion.div
                initial={false}
                animate={{ scaleX: scored ? score : sim, opacity: scored ? 1 : 0.5 }}
                transition={{ duration: 0.6, ease: DEMO_EASE }}
                style={{
                    height: "100%",
                    transformOrigin: "left",
                    background: scored ? "var(--chakra-colors-iconAccent)" : "var(--chakra-colors-textMuted)",
                }}
            />
        </Box>
        <Text
            variant="body-2xs-semibold"
            color={scored ? "iconAccent" : "textLabel"}
            w="28px"
            textAlign="right"
            fontFamily="mono"
        >
            <DemoCountUp value={scored ? score : sim} decimals={2} duration={0.6} />
        </Text>
    </HStack>
);
