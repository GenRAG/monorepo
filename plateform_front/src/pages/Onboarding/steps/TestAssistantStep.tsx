import React, { useEffect, useCallback } from "react";
import { Box, Stack, VStack, chakra } from "@chakra-ui/react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { ChatMessage } from "hooks/useChat";
import { useAgentQuery } from "hooks/useAgentQuery";
import { useOnboarding } from "hooks/useOnBoarding";
import { useUpdateOnboardingStepsDataMutation } from "services/onboarding/onboarding";
import { ChatInterface } from "components/System/Molecules/ChatInterface";
import StepLevel from "components/System/Molecules/StepLevel";

const STEP_ID = "test-assistant";

const SUGGESTED_QUESTIONS = [
    "Comment puis-je poser une journée de congé ?",
    "Quels sont les critères d'éligibilité pour les congés payés ?",
    "Puis-je reporter mes congés non utilisés à l'année prochaine ?",
];

export const TestAssistantStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
    goNext,
    registerValidateAndGoNext,
}) => {
    const { workspaceId, agentId } = useOnboarding();
    const { sendQuery, isOutOfCredits } = useAgentQuery(workspaceId, agentId);
    const [updateStepsData] = useUpdateOnboardingStepsDataMutation();

    // Restored from backend on reload
    const savedMessages: ChatMessage[] = data.messages ?? [];
    const messageCount: number = data.messageCount ?? savedMessages.length;

    const getResponse = useCallback(
        async (question: string) => {
            const fullText = await sendQuery(question);
            return { response: [fullText] };
        },
        [sendQuery],
    );

    useEffect(() => {
        registerValidateAndGoNext?.(() => Promise.resolve(goNext()));
    }, [registerValidateAndGoNext, goNext]);

    const handleMessagesChange = useCallback(
        (msgs: ChatMessage[]) => {
            updateData({ messages: msgs, messageCount: msgs.length });

            if (msgs.length > messageCount) {
                void updateStepsData({
                    workspaceId,
                    stepId: STEP_ID,
                    data: { messageCount: msgs.length },
                });
            }

            const last = msgs[msgs.length - 1];
            if (last?.question) updateData({ testQuestion: last.question });
        },
        [updateData, updateStepsData, workspaceId, messageCount],
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

                <Box flex={1} minH={0} display="flex" flexDirection="column">
                    <ChatInterface
                        fullHeight
                        compact
                        title="Ton assistant RH est prêt"
                        getResponse={getResponse}
                        onMessagesChange={handleMessagesChange}
                        suggestedQuestions={SUGGESTED_QUESTIONS}
                        initialMessages={savedMessages}
                        disabled={isOutOfCredits}
                        disabledMessage={
                            isOutOfCredits
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
