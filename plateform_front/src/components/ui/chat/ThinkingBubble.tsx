import { Box, Collapse, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { ChevronDown, ChevronRight, FileSearch } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ThinkingEvent } from "hooks/chat";

const DEFAULT_LABEL = "Réflexion en cours...";

// RAG pipeline block names → friendly French labels. Unknown blocks/status strings fall back to the raw text.
const BLOCK_LABELS: Record<string, string> = {
    query: "l'analyse de la question",
    rewrite: "la reformulation de la requête",
    retrieve: "la recherche dans les documents",
    rerank: "le classement des résultats",
    answer: "la génération de la réponse",
};

const prettifyStatus = (raw: string): string => {
    const running = raw.match(/^Running block:\s*(\w+)/i);
    if (running) {
        const label = BLOCK_LABELS[running[1].toLowerCase()];
        return label ? `En cours : ${label}...` : raw;
    }
    const completed = raw.match(/^(\w+)\s+completed$/i);
    if (completed) {
        const label = BLOCK_LABELS[completed[1].toLowerCase()];
        return label ? `Terminé : ${label}` : raw;
    }
    if (/^Generating answer/i.test(raw)) return "Génération de la réponse...";
    return raw;
};

interface ThinkingBubbleProps {
    events?: ThinkingEvent[];
}

const ThinkingBubble = ({ events = [] }: ThinkingBubbleProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const currentLabel = useMemo(() => {
        const lastStatus = [...events].reverse().find((e) => e.kind === "status");
        return lastStatus && lastStatus.kind === "status" ? prettifyStatus(lastStatus.text) : DEFAULT_LABEL;
    }, [events]);

    const canExpand = events.length > 0;

    return (
        <Box px={3} py={2.5} maxW="320px" overflow="hidden">
            <HStack
                spacing={2}
                align="center"
                minW={0}
                cursor={canExpand ? "pointer" : "default"}
                onClick={() => canExpand && setIsExpanded((prev) => !prev)}
            >
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
                                backgroundColor: "var(--chakra-colors-thinkingDotColor)",
                            }}
                        />
                    ))}
                </HStack>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentLabel}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        style={{ flex: 1, minWidth: 0 }}
                    >
                        <Text fontSize="xs" color="textLabel" isTruncated>
                            {currentLabel}
                        </Text>
                    </motion.div>
                </AnimatePresence>

                {canExpand && (
                    <Icon as={isExpanded ? ChevronDown : ChevronRight} boxSize={3} color="textMuted" flexShrink={0} />
                )}
            </HStack>

            {canExpand && (
                <Collapse in={isExpanded} animateOpacity>
                    <VStack
                        align="stretch"
                        spacing={1.5}
                        mt={2}
                        pl="16px"
                        maxH="160px"
                        overflowY="auto"
                        overflowX="hidden"
                    >
                        {events.map((event) =>
                            event.kind === "status" ? (
                                <HStack key={event.id} spacing={1.5} align="start" minW={0}>
                                    <Box w="4px" h="4px" borderRadius="full" bg="textMuted" mt="6px" flexShrink={0} />
                                    <Text fontSize="xs" color="textMuted" noOfLines={2} minW={0}>
                                        {prettifyStatus(event.text)}
                                    </Text>
                                </HStack>
                            ) : (
                                <HStack key={event.id} spacing={1.5} align="start" minW={0}>
                                    <Icon as={FileSearch} boxSize={3} color="textMuted" mt="2px" flexShrink={0} />
                                    <VStack align="start" spacing={0} minW={0} flex={1}>
                                        <Text fontSize="xs" color="textMuted">
                                            {event.sources.length > 1
                                                ? `${event.sources.length} documents consultés`
                                                : "Document consulté"}
                                        </Text>
                                        {event.sources.map((source) => (
                                            <Text
                                                key={source.index}
                                                fontSize="10px"
                                                color="textFaint"
                                                noOfLines={1}
                                                w="100%"
                                            >
                                                {source.title}
                                            </Text>
                                        ))}
                                    </VStack>
                                </HStack>
                            ),
                        )}
                    </VStack>
                </Collapse>
            )}
        </Box>
    );
};

export default ThinkingBubble;
