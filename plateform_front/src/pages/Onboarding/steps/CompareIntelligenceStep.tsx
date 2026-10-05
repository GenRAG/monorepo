import React, { useState, useEffect } from "react";
import { Box, Skeleton, Stack, Text, VStack, chakra } from "@chakra-ui/react";
import { RotateCcw } from "lucide-react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import ChatInput from "components/ui/chat/ChatInput";
import Button from "components/ui/Button";
import ResponseCard from "components/Onboarding/CompareIntelligence/ResponseDetailPanel";
import CompareEmptyState from "components/Onboarding/CompareIntelligence/CompareEmptyState";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useOnboarding } from "hooks/onboarding/useOnboarding";
import {
    CompareOnboardingResponse,
    useCompareOnboardingMutation,
    useUpdateOnboardingStepsDataMutation,
} from "services/onboarding/onboarding";
import StepHint from "components/Onboarding/StepHint";
import { CARD_META } from "pages/Onboarding/steps/compareIntelligenceCards";

const MAX_COMPARES = 2;
const STEP_ID = "compare-intelligence";

export const CompareIntelligenceStepComponent: React.FC<StepComponentProps> = ({ data, updateData }) => {
    const isMobile = useAppResponsive({ base: true, lg: false });
    const { workspaceId } = useOnboarding();

    const [question, setQuestion] = useState<string | null>((data.testQuestion as string) ?? null);
    const [responses, setResponses] = useState<CompareOnboardingResponse | null>(null);
    const [selectedLLM, setSelectedLLM] = useState<string | null>((data.selectedLLM as string) ?? null);
    const sessionQueryCount = (data.queryCount as number) ?? 0;
    const [compareCount, setCompareCount] = useState<number>(
        Math.max(sessionQueryCount, (data.compareCount as number) ?? 0),
    );
    const isAtLimit = compareCount >= MAX_COMPARES;

    const [compareOnboarding, { isLoading }] = useCompareOnboardingMutation();
    const [updateStepsData] = useUpdateOnboardingStepsDataMutation();

    useEffect(() => {
        if (isAtLimit && !selectedLLM) {
            const defaultLLM = "precise";
            setSelectedLLM(defaultLLM);
            updateData({ selectedLLM: defaultLLM });
            void updateStepsData({
                workspaceId,
                stepId: STEP_ID,
                data: { selectedLLM: defaultLLM },
            });
        }
    }, [isAtLimit, selectedLLM, workspaceId, updateData, updateStepsData]);

    const handleQuestionSend = async (q: string) => {
        if (!workspaceId || isAtLimit) return;
        setQuestion(q);
        setResponses(null);
        setSelectedLLM(null);
        updateData({ messageSent: false, selectedLLM: undefined });

        const newCount = compareCount + 1;
        setCompareCount(newCount);
        updateData({ compareCount: newCount });
        void updateStepsData({
            workspaceId,
            stepId: STEP_ID,
            data: { compareCount: newCount },
        });

        try {
            const result = await compareOnboarding({
                workspaceId,
                query: q,
            }).unwrap();
            setResponses(result);
            updateData({ messageSent: true });
            void updateStepsData({
                workspaceId,
                stepId: STEP_ID,
                data: { messageSent: true },
            });
        } catch {
            setQuestion(null);
            setCompareCount(compareCount);
            updateData({ compareCount });
            void updateStepsData({
                workspaceId,
                stepId: STEP_ID,
                data: { compareCount },
            });
        }
    };

    const handleResponseSelect = (llmId: string) => {
        setSelectedLLM(llmId);
        updateData({ selectedLLM: llmId });
        void updateStepsData({
            workspaceId,
            stepId: STEP_ID,
            data: { selectedLLM: llmId },
        });
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
                <StepHint
                    quota={{
                        current: compareCount,
                        max: MAX_COMPARES,
                        label: "comparaisons",
                    }}
                >
                    Pose une question pour comparer trois styles de réponse, puis choisis celui que tu préfères : ton
                    assistant l&apos;adoptera.
                </StepHint>

                <Box
                    flex={1}
                    minH={0}
                    overflowY="auto"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="borderSubtle"
                    borderRadius="12px"
                    p={question ? 4 : 0}
                >
                    {!question ? (
                        <VStack h="100%" align="stretch" spacing={0}>
                            <CompareEmptyState />
                            <ChatInput
                                placeholder={
                                    isAtLimit
                                        ? `Limite atteinte (${compareCount}/${MAX_COMPARES})`
                                        : "Pose une question pour voir les différences..."
                                }
                                onSend={handleQuestionSend}
                                disabled={isAtLimit}
                            />
                        </VStack>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            <VStack align="flex-end" spacing={1} alignSelf="flex-end" maxW="80%">
                                <Text fontSize="xs" color="textFaint">
                                    Vous
                                </Text>
                                <Box p={3} bg="bubbleAccentBg" borderRadius="12px" borderBottomRightRadius="2px">
                                    <Text fontSize="sm" color="bubbleAccentText">
                                        {question}
                                    </Text>
                                </Box>
                            </VStack>

                            {isLoading ? (
                                <Stack direction={isMobile ? "column" : "row"} spacing={4} align="stretch">
                                    {CARD_META.map((card) => (
                                        <Skeleton key={card.key} flex={1} height="200px" borderRadius="12px" />
                                    ))}
                                </Stack>
                            ) : responses ? (
                                <>
                                    <Text variant="body-sm" color="textLabel">
                                        Sélectionne la réponse que tu préfères :
                                    </Text>

                                    <Stack direction={isMobile ? "column" : "row"} spacing={4} align="stretch">
                                        {CARD_META.map((card) => (
                                            <ResponseCard
                                                key={card.key}
                                                title={card.title}
                                                badge={card.badge}
                                                isRecommended={card.isRecommended}
                                                icon={card.icon}
                                                responseText={responses[card.key]}
                                                advantages={card.advantages}
                                                isSelected={selectedLLM === card.key}
                                                onClick={() => handleResponseSelect(card.key)}
                                            />
                                        ))}
                                    </Stack>
                                </>
                            ) : null}

                            {!isLoading && !isAtLimit && (
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
