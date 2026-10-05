import React, { useCallback } from "react";
import { Box, Stack, chakra } from "@chakra-ui/react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { ChatMessage, RagSource, ChatResponseMeta, ThinkingEvent, useAgentQuery } from "hooks/chat";
import { useOnboarding } from "hooks/onboarding/useOnboarding";
import { useUpdateOnboardingStepsDataMutation } from "services/onboarding/onboarding";
import { ChatInterface } from "components/ui/chat/ChatInterface";
import StepHint from "components/Onboarding/StepHint";

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
        async (
            question: string,
            onChunk: (partialText: string) => void,
            onSources?: (sources: RagSource[]) => void,
            _onMeta?: (meta: ChatResponseMeta) => void,
            onThinking?: (event: ThinkingEvent) => void,
        ) => {
            const fullText = await sendQuery(question, onChunk, onSources, onThinking);

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
            updateData({ messages: last.error ? msgs.slice(0, -1) : msgs });
        },
        [updateData],
    );

    return (
        <chakra.form w="100%" h="100%">
            <Stack spacing={4} h="100%">
                <StepHint
                    quota={{
                        current: messageCount,
                        max: MAX_EXCHANGES,
                        label: "questions",
                    }}
                >
                    L&apos;assistant utilise pour l&apos;instant des documents RH publics, pas encore les tiens.
                    Pose-lui une question pour tester ses réponses.
                </StepHint>

                <Box flex={1} minH={0} display="flex" flexDirection="column">
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
                                ? `Limite atteinte (${MAX_EXCHANGES}/${MAX_EXCHANGES})`
                                : isOutOfCredits
                                  ? "Crédits épuisés"
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
