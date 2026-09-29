import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ListRestart } from "lucide-react";
import { DEMO_SPRING } from "components/ui/demo/DemoStage";
import { ResultRow } from "./ReRankerRow";

export interface RerankerSceneState {
    visible: number;
    scoring: boolean;
    scanned: number;
    sorted: boolean;
    filtered: boolean;
}

const DOCS = [
    { id: "a", name: "faq_produit.txt", sim: 0.82, score: 0.41 },
    { id: "b", name: "guide_rh.pdf · §3", sim: 0.79, score: 0.94 },
    { id: "c", name: "onboarding.pdf", sim: 0.77, score: 0.23 },
    { id: "d", name: "guide_rh.pdf · §5", sim: 0.74, score: 0.87 },
];

export type RerankerDoc = (typeof DOCS)[number];

const SORTED = [...DOCS].sort((a, b) => b.score - a.score);
const TOP_K = 3;
export const ROW_H = 30;
const ROW_GAP = 6;

interface RerankerSceneProps {
    scene: RerankerSceneState;
    hovered: string | null;
    pressed: boolean;
}

export const RerankerScene = ({ scene, hovered, pressed }: RerankerSceneProps) => {
    const order = scene.sorted ? SORTED : DOCS;

    return (
        <VStack h="100%" spacing={2} align="stretch" justify="center">
            <HStack justify="space-between">
                <Text variant="body-2xs-muted">
                    Requête · <strong>congés payés</strong>
                </Text>
                <HStack
                    data-demo="rerank"
                    spacing={1}
                    px={2}
                    h="24px"
                    borderRadius="6px"
                    bg={scene.scanned > 0 || hovered === "rerank" ? "iconAccent" : "surfaceSubtle"}
                    transform={hovered === "rerank" && pressed ? "scale(0.95)" : "scale(1)"}
                    transition="all 0.25s ease"
                >
                    <Icon
                        as={ListRestart}
                        boxSize="12px"
                        color={scene.scanned > 0 || hovered === "rerank" ? "white" : "textLabel"}
                    />
                    <Text
                        variant="body-2xs-semibold"
                        color={scene.scanned > 0 || hovered === "rerank" ? "white" : "textLabel"}
                    >
                        Reclasser
                    </Text>
                </HStack>
            </HStack>

            <Box position="relative">
                <VStack spacing={`${ROW_GAP}px`} align="stretch">
                    {order.map((doc, index) => {
                        const originalIndex = DOCS.indexOf(doc);
                        return (
                            <motion.div
                                key={doc.id}
                                layout
                                initial={{ opacity: 0, x: -60 }}
                                animate={{
                                    opacity:
                                        originalIndex < scene.visible
                                            ? scene.filtered && index >= TOP_K
                                                ? 0.4
                                                : 1
                                            : 0,
                                    x: originalIndex < scene.visible ? 0 : -60,
                                }}
                                transition={{
                                    layout: {
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 24,
                                        delay: index * 0.05,
                                    },
                                    ...DEMO_SPRING,
                                }}
                                style={{
                                    zIndex: scene.sorted && index === 0 ? 2 : 1,
                                    position: "relative",
                                }}
                            >
                                <ResultRow
                                    doc={doc}
                                    rank={index + 1}
                                    scored={originalIndex < scene.scanned || scene.sorted}
                                    top={scene.filtered && index === 0}
                                    dropped={scene.filtered && index >= TOP_K}
                                    hovered={hovered === `row-${doc.id}`}
                                />
                            </motion.div>
                        );
                    })}
                </VStack>
                <AnimatePresence>{scene.scoring && <ScanBeam />}</AnimatePresence>
            </Box>
        </VStack>
    );
};

const ScanBeam = () => (
    <motion.div
        initial={{ top: -10, opacity: 0 }}
        animate={{ top: 4 * (ROW_H + ROW_GAP), opacity: [0, 1, 1, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.35, ease: "linear" }}
        style={{
            position: "absolute",
            left: -6,
            right: -6,
            height: 14,
            marginTop: -7,
            pointerEvents: "none",
            background: "linear-gradient(180deg, transparent, var(--chakra-colors-iconAccent), transparent)",
            opacity: 0.5,
            filter: "blur(3px)",
        }}
    />
);
