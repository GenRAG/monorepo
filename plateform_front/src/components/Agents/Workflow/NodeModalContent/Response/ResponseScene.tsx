import { Box, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, ListOrdered, MessageSquare, Sparkles } from "lucide-react";
import { DEMO_EASE, DEMO_SPRING } from "components/ui/demo/DemoStage";
import { DemoChatInput } from "components/ui/demo/DemoChatInput";
import { ResponseAnswer } from "./ResponseAnswer";

export const RESPONSE_QUESTION = "Qu'est-ce qu'une base vectorielle ?";

export interface ResponseSceneState {
    text: string;
    sent: boolean;
    contextCount: number;
    words: number;
    refined: boolean;
    cited: boolean;
}

const CONTEXT = [
    { label: "Requête", icon: MessageSquare },
    { label: "3 passages", icon: FileText },
    { label: "Classement", icon: ListOrdered },
];

export const ResponseScene = ({ scene, hovered }: { scene: ResponseSceneState; hovered: string | null }) => (
    <Flex h="100%" direction="column" gap={2}>
        <VStack flex={1} minH={0} spacing={2} align="stretch" justify="flex-end">
            <AnimatePresence>
                {scene.sent && (
                    <motion.div
                        key="user"
                        initial={{ opacity: 0, y: 24, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={DEMO_SPRING}
                        style={{ alignSelf: "flex-end", transformOrigin: "bottom right" }}
                    >
                        <Box bg="bubbleSentBg" px={3} py={1.5} borderRadius="12px" borderBottomRightRadius="4px">
                            <Text variant="body-2xs" color="textOnBubble">
                                {RESPONSE_QUESTION}
                            </Text>
                        </Box>
                    </motion.div>
                )}
                {scene.contextCount > 0 && (
                    <motion.div
                        key="assistant"
                        layout="position"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={DEMO_SPRING}
                    >
                        <HStack align="flex-start" spacing={2}>
                            <Box
                                w="22px"
                                h="22px"
                                flexShrink={0}
                                borderRadius="999px"
                                bg="accentIconBg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={Sparkles} boxSize="11px" color="iconAccent" />
                            </Box>
                            <Box flex={1} minW={0}>
                                <AnimatePresence mode="wait" initial={false}>
                                    {scene.words === 0 ? (
                                        <ContextTray key="tray" count={scene.contextCount} />
                                    ) : (
                                        <ResponseAnswer key="answer" scene={scene} hovered={hovered} />
                                    )}
                                </AnimatePresence>
                            </Box>
                        </HStack>
                    </motion.div>
                )}
            </AnimatePresence>
        </VStack>

        <DemoChatInput
            value={scene.text}
            placeholder="Posez votre question…"
            focused={false}
            sendHovered={hovered === "send"}
        />
    </Flex>
);

const ContextTray = ({ count }: { count: number }) => (
    <motion.div exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }} transition={{ duration: 0.3, ease: DEMO_EASE }}>
        <HStack spacing={1.5} mb={1.5}>
            <Text variant="body-2xs-muted">Préparation du contexte</Text>
            <ThinkingDots />
        </HStack>
        <Flex gap="4px" wrap="wrap">
            {CONTEXT.slice(0, count).map((item) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -14, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={DEMO_SPRING}
                >
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
                        <Icon as={item.icon} boxSize="10px" color="iconAccent" />
                        <Text variant="body-2xs" color="textSecondary">
                            {item.label}
                        </Text>
                    </HStack>
                </motion.div>
            ))}
        </Flex>
    </motion.div>
);

const ThinkingDots = () => (
    <HStack spacing="3px">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: "var(--chakra-colors-thinkingDotColor)",
                }}
            />
        ))}
    </HStack>
);
