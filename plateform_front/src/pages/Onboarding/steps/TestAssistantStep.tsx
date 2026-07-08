import React, { useCallback } from "react";
import { Box, Stack, VStack, chakra } from "@chakra-ui/react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { ChatMessage, useAgentQuery } from "hooks/chat";
import { useOnboarding } from "hooks/useOnBoarding";
import { useUpdateOnboardingStepsDataMutation } from "services/onboarding/onboarding";
import { ChatInterface } from "components/ui/chat/ChatInterface";
import StepLevel from "components/ui/StepLevel";
import OnboardingStepBanner from "components/ui/OnboardingStepBanner";

const STEP_ID = "test-assistant";
const MAX_EXCHANGES = 5;

const SUGGESTED_QUESTIONS = [
    "Comment puis-je poser une journée de congé ?",
    "Quels sont les critères d'éligibilité pour les congés payés ?",
    "Puis-je reporter mes congés non utilisés à l'année prochaine ?",
];

export const TestAssistantStepComponent: React.FC<StepComponentProps> = ({ data, updateData }) => {
    const { workspaceId, agentId } = useOnboarding();
    const onboardingStreamUrl = `${(process.env.REACT_APP_BACKEND_URL ?? "").replace(/\/$/, "")}/workspaces/${workspaceId}/onboarding/stream`;
    const { sendQuery, isOutOfCredits } = useAgentQuery(workspaceId, agentId, onboardingStreamUrl);
    const [updateStepsData] = useUpdateOnboardingStepsDataMutation();

    const savedMessages: ChatMessage[] = (data.messages as ChatMessage[]) ?? [];
    const messageCount: number = (data.messageCount as number) ?? 0;
    const isAtLimit = messageCount >= MAX_EXCHANGES;

    const getResponse = useCallback(
        async (question: string, onChunk: (partialText: string) => void) => {
            const fullText = await sendQuery(question, onChunk);

            const newCount = messageCount + 1;
            updateData({ messageCount: newCount, testQuestion: question });
            void updateStepsData({
                workspaceId,
                stepId: STEP_ID,
                data: { messageCount: newCount },
            });

            return fullText;
        },
        [sendQuery, messageCount, updateData, updateStepsData, workspaceId],
    );

    const handleMessagesChange = useCallback(
        (msgs: ChatMessage[]) => {
            const last = msgs[msgs.length - 1];
            if (!last) return;
            // Don't persist error messages — keeps savedMessages clean for the fallback
            updateData({ messages: last.error ? msgs.slice(0, -1) : msgs });
        },
        [updateData],
    );

    return (
        <chakra.form w="100%" h="100%">
            <Stack spacing={4} h="100%">
                <VStack align="start">
                    <StepLevel
                        level={1}
                        title="Démo"
                        description="Ce modèle utilise uniquement des documents RH publics. Aucun de vos fichiers n'est encore utilisé."
                    />
                </VStack>
                <OnboardingStepBanner current={messageCount} max={MAX_EXCHANGES} mb={0} />

                <Box flex={1} minH={0} display="flex" flexDirection="column" gap={2}>
                    <ChatInterface
                        fullHeight
                        compact
                        title="Ton assistant est prêt"
                        getResponse={getResponse}
                        onMessagesChange={handleMessagesChange}
                        suggestedQuestions={SUGGESTED_QUESTIONS}
                        initialMessages={savedMessages}
                        disabled={isOutOfCredits || isAtLimit}
                        disabledMessage={
                            isAtLimit
                                ? `Limite atteinte (${MAX_EXCHANGES}/${MAX_EXCHANGES}) — passez à l'étape suivante`
                                : isOutOfCredits
                                  ? "Crédits épuisés — passez à l'étape suivante"
                                  : undefined
                        }
                        placeholder="Saisissez votre question"
                        welcomeMessage="Pose-lui une question ou essaie l'une des suggestions ci-dessous."
                    />
                </Box>
            </Stack>
        </chakra.form>
    );
};
