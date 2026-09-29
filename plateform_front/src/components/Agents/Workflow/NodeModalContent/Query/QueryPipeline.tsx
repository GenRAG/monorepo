import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ListOrdered, Sparkles } from "lucide-react";
import { DEMO_EASE, DEMO_SPRING } from "components/ui/demo/DemoStage";

const STAGES = [
    { label: "Récupération", icon: Search },
    { label: "Classement", icon: ListOrdered },
    { label: "Génération", icon: Sparkles },
];

const NODE_H = 30;
const GAP = 8;
const HEIGHT = STAGES.length * NODE_H + (STAGES.length - 1) * GAP;
const WIDTH = 30;

const branchPath = (i: number) => {
    const y = i * (NODE_H + GAP) + NODE_H / 2;
    const mid = HEIGHT / 2;
    return `M0 ${mid} C ${WIDTH * 0.55} ${mid}, ${WIDTH * 0.45} ${y}, ${WIDTH} ${y}`;
};

export const QueryPipeline = ({ step }: { step: number }) => (
    <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: DEMO_EASE }}
    >
        <HStack spacing={0} align="center">
            <svg width={WIDTH} height={HEIGHT} style={{ overflow: "visible" }}>
                {STAGES.map((stage, i) => (
                    <g key={stage.label}>
                        <path
                            d={branchPath(i)}
                            fill="none"
                            stroke="var(--chakra-colors-dotInactive)"
                            strokeWidth={1.5}
                        />
                        <motion.path
                            d={branchPath(i)}
                            fill="none"
                            stroke="var(--chakra-colors-iconAccent)"
                            strokeWidth={1.5}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: step > i ? 1 : 0 }}
                            transition={{ duration: 0.45, ease: DEMO_EASE }}
                        />
                    </g>
                ))}
            </svg>
            <VStack spacing={`${GAP}px`} align="stretch">
                {STAGES.map((stage, i) => (
                    <PipelineNode key={stage.label} index={i} {...stage} state={stateOf(step, i)} />
                ))}
            </VStack>
        </HStack>
    </motion.div>
);

type NodeState = "idle" | "active" | "done";

const stateOf = (step: number, i: number): NodeState => {
    if (step > i + 1) return "done";
    if (step === i + 1) return "active";
    return "idle";
};

interface PipelineNodeProps {
    index: number;
    label: string;
    icon: typeof Search;
    state: NodeState;
}

const PipelineNode = ({ index, label, icon, state }: PipelineNodeProps) => (
    <motion.div
        data-demo={`pipeline-${index}`}
        animate={{
            scale: state === "active" ? 1.04 : 1,
            opacity: state === "idle" ? 0.55 : 1,
        }}
        transition={DEMO_SPRING}
    >
        <HStack
            h={`${NODE_H}px`}
            w="112px"
            px={2}
            spacing={2}
            bg={state === "idle" ? "surfaceAction" : "accentCardBg"}
            borderWidth="1px"
            borderStyle="solid"
            borderColor={state === "idle" ? "borderDivider" : "borderAccentCardActive"}
            borderRadius="8px"
            transition="all 0.35s ease"
        >
            <Icon as={icon} boxSize="12px" color={state === "idle" ? "textMuted" : "iconAccent"} />
            <Text variant="body-2xs-semibold" color={state === "idle" ? "textLabel" : "textPrimary"} flex={1}>
                {label}
            </Text>
            <Box w="17px" h="12px" display="flex" alignItems="center" justifyContent="center">
                <AnimatePresence mode="wait">
                    {state === "active" && (
                        <motion.div
                            key="active"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: 999,
                                background: "var(--chakra-colors-iconAccent)",
                            }}
                        />
                    )}
                </AnimatePresence>
            </Box>
        </HStack>
    </motion.div>
);
