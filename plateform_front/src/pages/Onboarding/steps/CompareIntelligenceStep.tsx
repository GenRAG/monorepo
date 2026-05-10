import React, { useState } from "react";
import {
    Box,
    Skeleton,
    Stack,
    Text,
    VStack,
    useColorMode,
    chakra,
} from "@chakra-ui/react";
import { MessageCircle, RotateCcw, Search, Zap } from "lucide-react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import StepLevel from "components/System/Molecules/StepLevel";
import ChatInput from "components/System/Molecules/Chat/ChatInput";
import Button from "components/System/Atoms/Button";
import ResponseCard from "components/Onboarding/CompareIntelligence/ResponseDetailPanel";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useOnboarding } from "hooks/useOnBoarding";
import {
    CompareOnboardingResponse,
    useCompareOnboardingMutation,
} from "services/onboarding/onboarding";

const CARD_META = [
    {
        key: "standard" as const,
        title: "STANDARD",
        badge: "Rapide",
        isRecommended: false,
        icon: Zap,
        advantages: ["Réponse instantanée", "Idéal pour les questions simples"],
    },
    {
        key: "precise" as const,
        title: "PRÉCIS",
        badge: "Recommandé",
        isRecommended: true,
        icon: Search,
        advantages: [
            "Citations et articles précis",
            "Analyse approfondie des documents",
        ],
    },
    {
        key: "creative" as const,
        title: "CRÉATIF",
        badge: "Convivial",
        isRecommended: false,
        icon: MessageCircle,
        advantages: [
            "Ton chaleureux et engageant",
            "Meilleure expérience utilisateur",
        ],
    },
];

export const CompareIntelligenceStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
}) => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });
    const { workspaceId } = useOnboarding();

    const [question, setQuestion] = useState<string | null>(
        (data.testQuestion as string) ?? null,
    );
    const [responses, setResponses] =
        useState<CompareOnboardingResponse | null>(null);
    const [selectedLLM, setSelectedLLM] = useState<string | null>(
        (data.selectedLLM as string) ?? null,
    );

    const [compareOnboarding, { isLoading }] = useCompareOnboardingMutation();

    const handleQuestionSend = async (q: string) => {
        if (!workspaceId) return;
        setQuestion(q);
        setResponses(null);
        setSelectedLLM(null);
        updateData({ messageSent: false, selectedLLM: undefined });

        try {
            const result = await compareOnboarding({
                workspaceId,
                query: q,
            }).unwrap();
            setResponses(result);
            updateData({ messageSent: true });
        } catch {
            setQuestion(null);
        }
    };

    const handleResponseSelect = (llmId: string) => {
        setSelectedLLM(llmId);
        updateData({ selectedLLM: llmId });
    };

    const handleReset = () => {
        setQuestion(null);
        setResponses(null);
        setSelectedLLM(null);
        updateData({ messageSent: false, selectedLLM: undefined });
    };

    return (
        <chakra.form w="100%" h="100%">
            <Stack w="100%" h="100%" spacing={4} flexDirection="column">
                <VStack align="start" spacing={4} w="100%">
                    <StepLevel
                        level={4}
                        title="Optimisé"
                        description="Compare les différents styles de réponse et choisis celui qui correspond le mieux à ton usage."
                    />
                </VStack>

                <Box flex={1} minH={0} overflowY="auto">
                    {!question ? (
                        <ChatInput
                            placeholder="Pose une question pour voir les différences..."
                            onSend={handleQuestionSend}
                        />
                    ) : (
                        <VStack spacing={4} align="stretch">
                            <VStack
                                align="flex-end"
                                spacing={1}
                                alignSelf="flex-end"
                                maxW="80%"
                            >
                                <Text
                                    fontSize="xs"
                                    color={
                                        colorMode === "dark"
                                            ? "grey.500"
                                            : "grey.400"
                                    }
                                >
                                    Vous
                                </Text>
                                <Box
                                    p={3}
                                    bg={
                                        colorMode === "dark"
                                            ? "green.700"
                                            : "green.100"
                                    }
                                    borderRadius="12px"
                                    borderBottomRightRadius="2px"
                                >
                                    <Text
                                        fontSize="sm"
                                        color={
                                            colorMode === "dark"
                                                ? "grey.100"
                                                : "green.800"
                                        }
                                    >
                                        {question}
                                    </Text>
                                </Box>
                            </VStack>

                            {isLoading ? (
                                <Stack
                                    direction={isMobile ? "column" : "row"}
                                    spacing={4}
                                    align="stretch"
                                >
                                    {CARD_META.map((card) => (
                                        <Skeleton
                                            key={card.key}
                                            flex={1}
                                            height="200px"
                                            borderRadius="12px"
                                            startColor={
                                                colorMode === "dark"
                                                    ? "grey.800"
                                                    : "grey.100"
                                            }
                                            endColor={
                                                colorMode === "dark"
                                                    ? "grey.700"
                                                    : "grey.200"
                                            }
                                        />
                                    ))}
                                </Stack>
                            ) : responses ? (
                                <>
                                    <Text
                                        fontSize="sm"
                                        color={
                                            colorMode === "dark"
                                                ? "grey.400"
                                                : "grey.600"
                                        }
                                    >
                                        Sélectionne la réponse que tu préfères :
                                    </Text>

                                    <Stack
                                        direction={isMobile ? "column" : "row"}
                                        spacing={4}
                                        align="stretch"
                                    >
                                        {CARD_META.map((card) => (
                                            <ResponseCard
                                                key={card.key}
                                                title={card.title}
                                                badge={card.badge}
                                                isRecommended={
                                                    card.isRecommended
                                                }
                                                icon={card.icon}
                                                responseText={
                                                    responses[card.key]
                                                }
                                                advantages={card.advantages}
                                                isSelected={
                                                    selectedLLM === card.key
                                                }
                                                onClick={() =>
                                                    handleResponseSelect(
                                                        card.key,
                                                    )
                                                }
                                            />
                                        ))}
                                    </Stack>
                                </>
                            ) : null}

                            {!isLoading && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    leftIcon={RotateCcw}
                                    onClick={handleReset}
                                    w="fit-content"
                                >
                                    Poser une autre question
                                </Button>
                            )}
                        </VStack>
                    )}
                </Box>
            </Stack>
        </chakra.form>
    );
};
