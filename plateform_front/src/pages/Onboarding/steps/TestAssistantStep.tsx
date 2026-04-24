import React, { useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
    Box,
    Heading,
    Stack,
    Text,
    VStack,
    useColorMode,
    chakra,
    Icon,
} from "@chakra-ui/react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import {
    useChat,
    useHandleMessageUpdate,
    useStreamingQuery,
} from "../../../hooks/useChat";
import { ChatInterface } from "components/System/Molecules/ChatInterface";
import StepLevel from "components/System/Molecules/StepLevel";
import { useAppResponsive } from "hooks/useAppResponsive";

interface TestAssistantFormData {
    testQuestion: string;
    testResponse: string;
}

export const TestAssistantStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
    goNext,
    registerValidateAndGoNext,
}) => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });

    const { sendQuery } = useStreamingQuery();

    const initialMessages: any = [];

    const setValueRef = useRef<typeof setValue | null>(null);
    const updateDataRef = useRef<typeof updateData | null>(null);

    const { trigger, setValue } = useForm<TestAssistantFormData>({
        defaultValues: {
            testQuestion: data.testQuestion || "",
            testResponse: data.testResponse || "",
        },
        mode: "onChange",
    });

    const handleMessageUpdate = useHandleMessageUpdate({
        setValue: (name, value, options) =>
            setValue(name as "testQuestion" | "testResponse", value, options),
        updateData,
        refQuestion: "testQuestion",
        refResponse: "testResponse",
    });

    const {
        messages,
        sendMessage,
        isLoading,
        updateMessage,
        currentMessageIdRef,
    } = useChat({
        getResponse: useCallback(
            async (question: string) => {
                const fullText = await sendQuery(
                    question,
                    (chunkSoFar: string) => {
                        if (currentMessageIdRef.current) {
                            updateMessage(currentMessageIdRef.current, {
                                response: [chunkSoFar],
                            });
                        }
                    },
                );

                return { response: [fullText], isImproved: false };
            },
            [sendQuery],
        ),
        initialMessages,
        onMessageUpdate: handleMessageUpdate,
    });

    /*const { messages, sendMessage, isLoading } = useChat({
        getResponse,
        initialMessages,
        onMessageUpdate: handleMessageUpdate,
    });*/

    setValueRef.current = setValue;
    updateDataRef.current = updateData;

    const goNextRef = useRef(goNext);
    goNextRef.current = goNext;
    const triggerRef = useRef(trigger);
    triggerRef.current = trigger;

    useEffect(() => {
        if (registerValidateAndGoNext) {
            const validateAndGoNext = async () => {
                const isValid = await triggerRef.current();
                if (isValid) {
                    goNextRef.current();
                }
            };
            registerValidateAndGoNext(validateAndGoNext);
        }
    }, [registerValidateAndGoNext]);

    const suggestedQuestions = [
        "How many paid vacation days do I have?",
        "How do I request an RTT?",
        "Can I carry over my vacation days?",
    ];

    const handleQuestionClick = async (suggestedQuestion: string) => {
        await sendMessage(suggestedQuestion);
    };

    return (
        <chakra.form w="100%" h="100%">
            <Stack w="100%" spacing={4} h="100%">
                <VStack align="start" spacing={4} w="100%">
                    <VStack align="start" spacing={2} w="100%">
                        <Heading
                            variant={isMobile ? "heading-lg" : "heading-2xl"}
                            fontWeight="bold"
                            color={colorMode === "dark" ? "white" : "grey.900"}
                        >
                            Test your HR assistant in 30 seconds
                        </Heading>
                        {!isMobile && (
                            <Text
                                color={
                                    colorMode === "dark"
                                        ? "grey.400"
                                        : "grey.600"
                                }
                                variant={isMobile ? "body-lg" : "body-xl"}
                            >
                                Here&apos;s your HR assistant ready to use
                            </Text>
                        )}
                    </VStack>
                    <StepLevel
                        level={1}
                        title="Demo"
                        description="This model uses only public HR documents. None of your files are used yet."
                    />
                </VStack>

                {/*messages.length === 0 && (
                    <VStack align="stretch" spacing={2}>
                        <Text
                            fontSize="xs"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.500"
                            }
                            mb={2}
                        >
                            Suggested questions:
                        </Text>
                        {suggestedQuestions.map((suggestedQuestion, index) => (
                            <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    handleQuestionClick(suggestedQuestion)
                                }
                                justifyContent="flex-start"
                                textAlign="left"
                                bg={colorMode === "dark" ? "grey.700" : "white"}
                                borderColor={
                                    colorMode === "dark"
                                        ? "grey.600"
                                        : "grey.300"
                                }
                                _hover={{
                                    bg:
                                        colorMode === "dark"
                                            ? "grey.600"
                                            : "grey.50",
                                    borderColor: currentDarkTheme.primary,
                                }}
                            >
                                <Icon as={MessageSquare} boxSize={4} mr={2} />
                                {suggestedQuestion}
                            </Button>
                        ))}
                    </VStack>
                )*/}

                <Box flex={1} minH={0} display="flex" flexDirection="column">
                    <ChatInterface
                        fullHeight
                        compact
                        messages={messages}
                        onSendMessage={sendMessage}
                        isLoading={isLoading}
                        placeholder="Enter your question"
                        welcomeMessage="Hello! I'm your HR assistant. Ask me a question about vacation, RTT, or any other HR topic."
                    />
                </Box>
            </Stack>
        </chakra.form>
    );
};
