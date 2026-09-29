import { Box, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { DEMO_SPRING, DemoCard } from "components/ui/demo/DemoStage";
import { DemoWords } from "components/ui/demo/DemoWords";
import { ScoreBar, Tag, VagueWord, isVague } from "./RewriterParts";

export const REWRITER_EXAMPLES = [
    {
        original: "C'est quoi les prix ?",
        vague: ["prix"],
        intent: "Tarifs",
        rewritten: "Quels sont les tarifs et grilles tarifaires disponibles pour chaque offre ?",
        before: 34,
        after: 91,
    },
    {
        original: "Dites-moi sur la politique RH",
        vague: ["politique", "RH"],
        intent: "Ressources humaines",
        rewritten: "Quelle est la politique RH concernant les congés, le télétravail et les avantages ?",
        before: 41,
        after: 88,
    },
    {
        original: "Comment ça marche ?",
        vague: ["ça", "marche"],
        intent: "Fonctionnement",
        rewritten: "Quel est le fonctionnement détaillé du processus décrit dans la documentation ?",
        before: 28,
        after: 86,
    },
];

export interface RewriterSceneState {
    example: number;
    phase: "input" | "card";
    text: string;
    focused: boolean;
    analysed: number;
    rewritten: boolean;
    scored: boolean;
}

export const RewriterScene = ({ scene, hovered }: { scene: RewriterSceneState; hovered: string | null }) => {
    const example = REWRITER_EXAMPLES[scene.example];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={DEMO_SPRING}
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 10,
            }}
        >
            <DemoCard active={scene.rewritten} p={3}>
                <HStack spacing={1.5} mb={1.5}>
                    <Icon as={scene.rewritten ? Sparkles : User} boxSize="11px" color="iconAccent" />
                    <Text variant="caption-xs-muted">
                        {scene.rewritten ? "Question optimisée" : "Question originale"}
                    </Text>
                </HStack>
                <Box minH="34px">
                    <AnimatePresence mode="wait">
                        {scene.rewritten ? (
                            <Text key="new" variant="body-xs-semibold" color="textPrimary" lineHeight="1.4">
                                <DemoWords text={example.rewritten} stagger={0.045} />
                            </Text>
                        ) : (
                            <motion.div
                                key="old"
                                exit={{ opacity: 0, filter: "blur(6px)", y: -4 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Text variant="body-xs" color="textSecondary" lineHeight="1.4">
                                    {example.original.split(" ").map((word, i) => (
                                        <VagueWord
                                            key={i}
                                            word={word}
                                            flagged={scene.analysed >= 1 && isVague(word, example.vague)}
                                        />
                                    ))}
                                </Text>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
                <Flex gap="6px" mt={2} minH="20px">
                    <AnimatePresence>
                        {scene.analysed >= 2 && <Tag key="intent" label={`Intention · ${example.intent}`} />}
                        {scene.analysed >= 2 && (
                            <Tag
                                key="precision"
                                label={scene.rewritten ? "Précision · élevée" : "Précision · faible"}
                                strong={scene.rewritten}
                            />
                        )}
                    </AnimatePresence>
                </Flex>
            </DemoCard>

            <AnimatePresence>
                {scene.scored && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={DEMO_SPRING}>
                        <VStack spacing={1.5} align="stretch">
                            <ScoreBar label="Avant" value={example.before} />
                            <ScoreBar
                                label="Après"
                                value={example.after}
                                highlight
                                hovered={hovered === "score-after"}
                            />
                        </VStack>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
