import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import ThinkingBubble from "components/ui/chat/ThinkingBubble";
import ChatResponseBubble from "components/ui/chat/ChatResponseBubble";
import { ThinkingEvent } from "hooks/chat";

// Real sequence captured from a live RAG stream — used as-is so the mock matches production exactly.
const SCRIPT: Array<{ event?: ThinkingEvent; finalText?: string }> = [
    { event: { kind: "status", id: "1", text: "Running block: query" } },
    { event: { kind: "status", id: "2", text: "query completed" } },
    { event: { kind: "status", id: "3", text: "Running block: rewrite" } },
    { event: { kind: "status", id: "4", text: "rewrite completed" } },
    { event: { kind: "status", id: "5", text: "Running block: retrieve" } },
    { event: { kind: "status", id: "6", text: "retrieve completed" } },
    {
        event: {
            kind: "sources",
            id: "7",
            sources: [
                {
                    index: 1,
                    title: "Lab_05.pdf",
                    score: null,
                    text_preview:
                        "1.  Go to Network Access\n2.  Click Add IP Address\n3.  Select Allow Access from Anywhere (0.0.0.0/0)\n4.  Confirm",
                },
                {
                    index: 2,
                    title: "Confirmation_Assurance_Habitation_Multirisque_Proprietaire_Occupant_3L736069_20250719_115702_Version_Finale_Signee.pdf",
                    score: null,
                    text_preview: "Confirmation d'assurance habitation\n\nImportant : Ce document n'est pas le contrat d'assurance.",
                },
            ],
        },
    },
    { event: { kind: "status", id: "8", text: "Generating answer..." } },
    {
        finalText:
            "Le document **Lab_05.pdf** présente **MongoDB**, une base de données NoSQL orientée documents qui stocke les données dans des documents flexibles appelés BSON [1].",
    },
];

const SPEEDS = [
    { label: "Lent", ms: 2200 },
    { label: "Normal", ms: 1200 },
    { label: "Rapide", ms: 500 },
];

const ThinkingBubbleMock = () => {
    const [events, setEvents] = useState<ThinkingEvent[]>([]);
    const [finalText, setFinalText] = useState<string | null>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [speedMs, setSpeedMs] = useState(SPEEDS[0].ms);
    const [isLooping, setIsLooping] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const restart = useCallback(() => {
        setEvents([]);
        setFinalText(null);
        setStepIndex(0);
    }, []);

    useEffect(() => {
        clearTimeout(timeoutRef.current);

        if (stepIndex >= SCRIPT.length) {
            if (isLooping) {
                timeoutRef.current = setTimeout(restart, speedMs * 2);
            }
            return;
        }

        timeoutRef.current = setTimeout(() => {
            const step = SCRIPT[stepIndex];
            if (step.event) {
                setEvents((prev) => [...prev, step.event as ThinkingEvent]);
            } else if (step.finalText) {
                setFinalText(step.finalText);
            }
            setStepIndex((i) => i + 1);
        }, speedMs);

        return () => clearTimeout(timeoutRef.current);
    }, [stepIndex, speedMs, isLooping, restart]);

    return (
        <Box minH="100vh" bg="surfaceAppShell" p={8}>
            <VStack align="stretch" spacing={6} maxW="480px" mx="auto">
                <VStack align="stretch" spacing={3} bg="surfaceModal" p={4} borderRadius="12px">
                    <Text fontSize="sm" fontWeight="600" color="textStrong">
                        Mock ThinkingBubble — dev only
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                        {SPEEDS.map((s) => (
                            <Button
                                key={s.label}
                                size="xs"
                                variant={speedMs === s.ms ? "solid" : "outline"}
                                onClick={() => setSpeedMs(s.ms)}
                            >
                                {s.label}
                            </Button>
                        ))}
                        <Button size="xs" variant="outline" onClick={restart}>
                            Rejouer
                        </Button>
                        <Button size="xs" variant="outline" onClick={() => setIsLooping((v) => !v)}>
                            Boucle : {isLooping ? "on" : "off"}
                        </Button>
                    </HStack>
                    <Text fontSize="xs" color="textMuted">
                        Étape {Math.min(stepIndex, SCRIPT.length)} / {SCRIPT.length}
                    </Text>
                </VStack>

                <VStack align="stretch" spacing={1}>
                    <Text fontSize="xs" color="textLabel">
                        Assistant
                    </Text>
                    {finalText ? (
                        <ChatResponseBubble response={finalText} />
                    ) : (
                        <Box bg="surfaceModal" borderRadius="16px" borderBottomLeftRadius="2px" display="inline-block">
                            <ThinkingBubble events={events} />
                        </Box>
                    )}
                </VStack>
            </VStack>
        </Box>
    );
};

export default ThinkingBubbleMock;
