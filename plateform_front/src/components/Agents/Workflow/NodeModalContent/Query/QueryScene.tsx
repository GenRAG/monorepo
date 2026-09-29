import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, FileCode2, ScrollText, User, type LucideIcon } from "lucide-react";
import { DEMO_EASE, DEMO_SPRING, DemoCard } from "components/ui/demo/DemoStage";
import { DemoChatInput } from "components/ui/demo/DemoChatInput";
import { QueryPipeline } from "./QueryPipeline";

export const QUERY_QUESTION = "Qu'est-ce qu'une base vectorielle ?";

export interface QuerySceneState {
    phase: "input" | "context" | "pipeline";
    text: string;
    focused: boolean;
    contextCount: number;
    pipelineStep: number;
}

const CONTEXT_CHIPS = [
    { label: "Instructions", icon: ScrollText, from: { x: -90, y: -50 } },
    { label: "Historique", icon: Clock, from: { x: 110, y: -40 } },
    { label: "Métadonnées", icon: FileCode2, from: { x: 20, y: 70 } },
];

export const QueryScene = ({ scene, hovered }: { scene: QuerySceneState; hovered: string | null }) => (
    <Flex h="100%" align="center" justify="center">
        <AnimatePresence mode="popLayout" initial={false}>
            {scene.phase === "input" ? (
                <motion.div
                    key="input"
                    exit={{ opacity: 0, y: 12, scale: 0.97, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, ease: DEMO_EASE }}
                    style={{ width: "100%" }}
                >
                    <DemoChatInput
                        value={scene.text}
                        placeholder="Posez votre question…"
                        focused={scene.focused}
                        sendHovered={hovered === "send"}
                    />
                </motion.div>
            ) : (
                <HStack key="query" spacing={0} align="center">
                    <motion.div
                        layout="position"
                        initial={{ opacity: 0, y: 28, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={DEMO_SPRING}
                    >
                        <QueryCard contextCount={scene.contextCount} />
                    </motion.div>
                    <AnimatePresence>
                        {scene.phase === "pipeline" && <QueryPipeline step={scene.pipelineStep} />}
                    </AnimatePresence>
                </HStack>
            )}
        </AnimatePresence>
    </Flex>
);

const QueryCard = ({ contextCount }: { contextCount: number }) => (
    <DemoCard active={contextCount > 0} w="150px" p={3} position="relative">
        <HStack spacing={1.5} mb={1.5}>
            <Box
                w="18px"
                h="18px"
                borderRadius="999px"
                bg="accentIconBg"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Icon as={User} boxSize="10px" color="iconAccent" />
            </Box>
            <Text variant="caption-xs-muted">Requête</Text>
            <AnimatePresence>
                {contextCount === CONTEXT_CHIPS.length && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={DEMO_SPRING}
                        style={{ marginLeft: "auto" }}
                    >
                        <Text variant="body-2xs-semibold" color="iconAccent">
                            enrichie
                        </Text>
                    </motion.div>
                )}
            </AnimatePresence>
        </HStack>
        <Text variant="body-xs-semibold" color="textPrimary" lineHeight="1.35">
            {QUERY_QUESTION}
        </Text>
        <Flex wrap="wrap" gap="4px" mt={2}>
            {CONTEXT_CHIPS.map((chip, i) =>
                i < contextCount ? (
                    <motion.div
                        key={chip.label}
                        initial={{ opacity: 0, x: chip.from.x, y: chip.from.y, scale: 0.7, rotate: i % 2 ? 8 : -8 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    >
                        <ContextChip {...chip} />
                    </motion.div>
                ) : (
                    <Box key={chip.label} visibility="hidden">
                        <ContextChip {...chip} />
                    </Box>
                ),
            )}
        </Flex>
    </DemoCard>
);

const ContextChip = ({ label, icon }: { label: string; icon: LucideIcon }) => (
    <HStack
        spacing={1}
        px={1.5}
        py="2px"
        borderRadius="6px"
        bg="accentCardBg"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="borderAccentCardMuted"
    >
        <Icon as={icon} boxSize="10px" color="iconAccent" />
        <Text variant="body-2xs" color="textSecondary">
            {label}
        </Text>
    </HStack>
);
