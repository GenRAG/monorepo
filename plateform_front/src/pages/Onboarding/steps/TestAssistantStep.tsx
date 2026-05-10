import React, { useEffect, useCallback, useState } from "react";
import {
    Box,
    Stack,
    Text,
    useColorModeValue,
    VStack,
    chakra,
} from "@chakra-ui/react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { ChatMessage } from "../../../hooks/useChat";
import { useAgentQuery } from "../../../hooks/useAgentQuery";
import { useOnboarding } from "hooks/useOnBoarding";
import { ChatInterface } from "components/System/Molecules/ChatInterface";
import StepLevel from "components/System/Molecules/StepLevel";
const MAX_MESSAGES = 3;

const SUGGESTED_QUESTIONS = [
    "Comment puis-je poser une journée de congé ?",
    "Quels sont les critères d'éligibilité pour les congés payés ?",
    "Puis-je reporter mes congés non utilisés à l'année prochaine ?",
];

export const TestAssistantStepComponent: React.FC<StepComponentProps> = ({
    updateData,
    goNext,
    registerValidateAndGoNext,
}) => {
    const { workspaceId, agentId } = useOnboarding();
    const { sendQuery } = useAgentQuery(workspaceId, agentId);
    const textColor = useColorModeValue("grey.900", "white");

    const [messagesCount, setMessagesCount] = useState(0);
    const messagesLeft = MAX_MESSAGES - messagesCount;

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
            setMessagesCount(msgs.length);
            const last = msgs[msgs.length - 1];
            if (last?.question) updateData({ testQuestion: last.question });
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

                {messagesCount > 0 && (
                    <Text
                        fontSize="xs"
                        color={messagesLeft === 0 ? "orange.400" : textColor}
                        textAlign="right"
                    >
                        {messagesLeft === 0
                            ? "Limite atteinte — passez à l'étape suivante"
                            : `${messagesLeft} message${messagesLeft > 1 ? "s" : ""} restant${messagesLeft > 1 ? "s" : ""}`}
                    </Text>
                )}

                <Box flex={1} minH={0} display="flex" flexDirection="column">
                    <ChatInterface
                        fullHeight
                        compact
                        title="Ton assistant RH est prêt"
                        getResponse={getResponse}
                        onMessagesChange={handleMessagesChange}
                        suggestedQuestions={SUGGESTED_QUESTIONS}
                        disabled={messagesLeft <= 0}
                        placeholder="Saisissez votre question"
                        welcomeMessage="Pose-lui une question ou essaie l'une des suggestions ci-dessous."
                    />
                </Box>
            </Stack>
        </chakra.form>
    );
};
