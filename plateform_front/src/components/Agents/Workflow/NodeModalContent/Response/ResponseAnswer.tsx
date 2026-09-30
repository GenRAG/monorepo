import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, ShieldCheck } from "lucide-react";
import { DEMO_EASE, DEMO_SPRING } from "components/ui/demo/DemoStage";
import { DemoWords, splitWords } from "components/ui/demo/DemoWords";
import type { ResponseSceneState } from "./ResponseScene";

const SEGMENTS = [
    {
        text: "Une base vectorielle stocke vos documents sous forme d'embeddings",
        source: { name: "guide_vectoriel.pdf", page: "p. 4" },
    },
    {
        text: "et retrouve les passages les plus proches du sens de la question.",
        source: { name: "architecture_rag.md", page: "§2" },
    },
];

const SEGMENT_LENGTHS = SEGMENTS.map((s) => splitWords(s.text).length);
export const ANSWER_WORD_COUNT = SEGMENT_LENGTHS.reduce((a, b) => a + b, 0);

export const ResponseAnswer = ({ scene, hovered }: { scene: ResponseSceneState; hovered: string | null }) => {
    let remaining = scene.words;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Box
                position="relative"
                px={3}
                py={2}
                borderRadius="12px"
                borderTopLeftRadius="4px"
                bg="surfaceAction"
                borderWidth="1px"
                borderStyle="solid"
                borderColor={scene.refined ? "borderAccentCardActive" : "borderDivider"}
                transition="border-color 0.4s ease"
            >
                <Box overflow="hidden" position="absolute" inset={0} borderRadius="inherit" pointerEvents="none">
                    {scene.refined && (
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "120%" }}
                            transition={{ duration: 1.1, ease: DEMO_EASE }}
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "60%",
                                background: "linear-gradient(90deg, transparent, rgba(52,211,169,0.22), transparent)",
                            }}
                        />
                    )}
                </Box>
                <Text variant="body-2xs" color="textOnBubble" lineHeight="1.55">
                    {SEGMENTS.map((segment, i) => {
                        const count = Math.max(0, Math.min(remaining, SEGMENT_LENGTHS[i]));
                        remaining -= SEGMENT_LENGTHS[i];
                        return (
                            <Box as="span" key={segment.text}>
                                <DemoWords text={segment.text} count={count} />
                                {scene.cited && (
                                    <Citation
                                        index={i + 1}
                                        source={segment.source}
                                        open={hovered === `cite-${i + 1}`}
                                    />
                                )}{" "}
                            </Box>
                        );
                    })}
                </Text>
            </Box>
            <AnimatePresence>
                {scene.refined && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ ...DEMO_SPRING, delay: 0.9 }}
                        style={{ display: "inline-block", marginTop: 4 }}
                    >
                        <HStack spacing={1}>
                            <Icon as={ShieldCheck} boxSize="11px" color="iconAccent" />
                            <Text variant="body-2xs-semibold" color="iconAccent">
                                Réponse vérifiée
                            </Text>
                        </HStack>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface CitationProps {
    index: number;
    source: { name: string; page: string };
    open: boolean;
}

const Citation = ({ index, source, open }: CitationProps) => (
    <motion.span
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: open ? 1.15 : 1 }}
        transition={{ ...DEMO_SPRING, delay: open ? 0 : (index - 1) * 0.15 }}
        style={{
            display: "inline-block",
            position: "relative",
            marginLeft: 3,
            verticalAlign: "1px",
        }}
    >
        <Box
            data-demo={`cite-${index}`}
            as="span"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            minW="14px"
            h="14px"
            px="3px"
            borderRadius="4px"
            bg="iconAccent"
            color="white"
            fontSize="9px"
            fontWeight="bold"
        >
            {index}
        </Box>
        <AnimatePresence>
            {open && (
                <motion.span
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.25, ease: DEMO_EASE }}
                    style={{
                        position: "absolute",
                        bottom: "calc(100% + 6px)",
                        left: -8,
                        zIndex: 10,
                    }}
                >
                    <HStack
                        spacing={1.5}
                        px={2}
                        py={1.5}
                        bg="surfaceAction"
                        borderWidth="1px"
                        borderStyle="solid"
                        borderColor="borderDivider"
                        borderRadius="8px"
                        boxShadow="0 8px 24px rgba(0,0,0,0.14)"
                        whiteSpace="nowrap"
                    >
                        <Icon as={FileText} boxSize="11px" color="iconAccent" />
                        <Text variant="body-2xs-semibold" color="textPrimary">
                            {source.name}
                        </Text>
                        <Text variant="body-2xs-muted">{source.page}</Text>
                    </HStack>
                </motion.span>
            )}
        </AnimatePresence>
    </motion.span>
);
