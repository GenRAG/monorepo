import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    Box,
    Heading,
    HStack,
    Stack,
    Text,
    VStack,
    useColorMode,
    chakra,
    Icon,
} from "@chakra-ui/react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import StepLevel from "components/Molecules/StepLevel";
import { ChatInterface } from "components/Molecules/ChatInterface";
import "../onboardingAnimations.css";
import { useChat } from "hooks/useChat";
import { useAppResponsive } from "hooks/useAppResponsive";

interface CompareIntelligenceFormData {
    selectedLLM: string;
    question: string;
}

export const CompareIntelligenceStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
    goNext,
    registerValidateAndGoNext,
}) => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });
    const [_selectedLLM, setSelectedLLM] = useState<string | null>(
        data.selectedLLM || null,
    );
    const [question, _setQuestion] = useState<string>(
        data.testQuestion || data.question || "",
    );
    const [_showResponses, setShowResponses] = useState<boolean>(
        !!data.testQuestion || !!data.question,
    );
    const [selectedResponseIndex, setSelectedResponseIndex] = useState<
        number | null
    >(null);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
        null,
    );

    const { trigger, setValue } = useForm<CompareIntelligenceFormData>({
        defaultValues: {
            selectedLLM: data.selectedLLM || "",
            question: data.testQuestion || data.question || "",
        },
        mode: "onChange",
    });

    const goNextRef = useRef(goNext);
    goNextRef.current = goNext;
    const triggerRef = useRef(trigger);
    triggerRef.current = trigger;

    const getResponse = useCallback((_question: string): string[] => {
        return [
            "According to the Syntec collective agreement, you are entitled to 25 paid vacation days per year.",
            "According to your collective agreement and internal regulations, you are entitled to 27 paid vacation days per year, including 2 additional days granted by your company.",
            "Great question! Your company grants you 27 paid vacation days per year, which is above the legal minimum. This includes 25 days according to the Syntec agreement, plus 2 additional days that your company has chosen to add to improve your work-life balance. These days can be taken according to the terms defined in your internal regulations.",
        ];
    }, []);

    const setValueRef = useRef<typeof setValue | null>(null);
    const updateDataRef = useRef<typeof updateData | null>(null);
    const lastProcessedMessageRef = useRef<string>("");

    const handleMessageUpdate = useCallback(
        (message: {
            id: string;
            question: string;
            response: string | string[];
            timestamp: number;
            isImproved?: boolean;
        }) => {
            if (!message.response) return;

            const responseText = Array.isArray(message.response)
                ? message.response.join("\n")
                : message.response;
            const messageKey = `${message.question}-${responseText}`;
            if (lastProcessedMessageRef.current === messageKey) return;

            lastProcessedMessageRef.current = messageKey;

            if (setValueRef.current) {
                setValueRef.current("question", message.question, {
                    shouldValidate: false,
                });
                setValueRef.current("selectedLLM", responseText, {
                    shouldValidate: false,
                });
            }

            if (updateDataRef.current) {
                updateDataRef.current({
                    testQuestion: message.question,
                    testResponse: responseText,
                });
            }
        },
        [],
    );

    const { messages, sendMessage } = useChat({
        getResponse,
        onMessageUpdate: handleMessageUpdate,
    });

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
    }, [registerValidateAndGoNext, triggerRef, goNextRef]);

    const handleQuestionSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (question.trim()) {
            setShowResponses(true);
            setValue("question", question);
            updateData({ question, testQuestion: question });
            await trigger();
        }
    };

    const responseLabels = ["Standard (fast)", "More precise", "More creative"];
    const responseDescriptions = [
        "Quick and efficient responses",
        "In-depth document analysis",
        "More detailed and contextual responses",
    ];

    const responseAdvantages = [
        {
            title: "Standard (fast)",
            advantages: [
                "Fast response time for quick queries",
                "Efficient resource usage",
                "Perfect for simple questions",
                "Lower computational cost",
            ],
        },
        {
            title: "More precise",
            advantages: [
                "Detailed document references",
                "Accurate citations and article numbers",
                "In-depth analysis of your documents",
                "Higher accuracy for complex questions",
            ],
        },
        {
            title: "More creative",
            advantages: [
                "Contextual and friendly responses",
                "Better user experience",
                "More engaging explanations",
                "Human-like conversation style",
            ],
        },
    ];

    const handleSelect = async (llmId: string) => {
        setSelectedLLM(llmId);
        setValue("selectedLLM", llmId);
        updateData({
            selectedLLM: llmId,
            question: question,
        });
        await trigger();
    };

    const handleResponseSelect = async (
        responseIndex: number,
        messageId: string,
    ) => {
        setSelectedResponseIndex(responseIndex);
        setSelectedMessageId(messageId);
        const llmId = ["standard", "precise", "creative"][responseIndex];
        await handleSelect(llmId);
    };

    return (
        <chakra.form w="100%" h="100%" onSubmit={handleQuestionSubmit}>
            <Stack w="100%" h="100%" spacing={6} flexDirection="column">
                <VStack align="start" spacing={4} w="100%">
                    <VStack align="start" spacing={2} w="100%">
                        <Heading
                            variant={isMobile ? "heading-lg" : "heading-2xl"}
                            fontWeight="bold"
                            color={colorMode === "dark" ? "white" : "grey.900"}
                        >
                            Compare your assistant&apos;s intelligence
                        </Heading>
                        {!isMobile && (
                            <Text
                                color={
                                    colorMode === "dark"
                                        ? "grey.400"
                                        : "grey.600"
                                }
                                variant="body-xl"
                            >
                                Compare the quality of responses
                            </Text>
                        )}
                    </VStack>

                    <StepLevel
                        level={4}
                        title="Optimized"
                        description="You can change intelligence at any time. Nothing is final."
                    />
                    {!isMobile && (
                        <Text
                            fontSize="sm"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.600"
                            }
                        >
                            Select the response you prefer to improve your
                            assistant.
                        </Text>
                    )}
                </VStack>
                <Stack
                    flex={1}
                    minH={0}
                    direction={{ base: "column", lg: "row" }}
                    align="stretch"
                    spacing={6}
                    w="100%"
                    borderRadius="12px"
                >
                    {selectedResponseIndex !== null &&
                        selectedResponseIndex !== undefined &&
                        selectedMessageId && (
                            <Box
                                w={{ base: "100%", lg: "400px" }}
                                minH="280px"
                                flexShrink={0}
                                border={`2px solid rgba(0, 255, 187, 0.46)`}
                                borderRadius="12px"
                                p={6}
                                className="slide-in-from-left"
                                bg={
                                    colorMode === "dark"
                                        ? "grey.800"
                                        : "grey.50"
                                }
                            >
                                <VStack align="stretch" spacing={4}>
                                    <HStack spacing={3}>
                                        <Icon
                                            as={Sparkles}
                                            boxSize={5}
                                            color={currentDarkTheme.primary}
                                        />
                                        <VStack
                                            align="start"
                                            spacing={1}
                                            flex={1}
                                        >
                                            <Text
                                                fontSize="lg"
                                                fontWeight="semibold"
                                                color={
                                                    colorMode === "dark"
                                                        ? "white"
                                                        : "grey.900"
                                                }
                                            >
                                                {
                                                    responseAdvantages[
                                                        selectedResponseIndex
                                                    ].title
                                                }
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                color={
                                                    colorMode === "dark"
                                                        ? "grey.400"
                                                        : "grey.600"
                                                }
                                            >
                                                {
                                                    responseDescriptions[
                                                        selectedResponseIndex
                                                    ]
                                                }
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <Box
                                        p={4}
                                        bg={
                                            colorMode === "dark"
                                                ? "grey.700"
                                                : "white"
                                        }
                                        borderRadius="8px"
                                        border={`1px solid ${colorMode === "dark" ? "grey.600" : "#E2E8F0"}`}
                                    >
                                        <Text
                                            fontSize="sm"
                                            color={
                                                colorMode === "dark"
                                                    ? "grey.200"
                                                    : "grey.700"
                                            }
                                            lineHeight="1.6"
                                        >
                                            {
                                                getResponse(question)[
                                                    selectedResponseIndex
                                                ]
                                            }
                                        </Text>
                                    </Box>

                                    <Box>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color={
                                                colorMode === "dark"
                                                    ? "white"
                                                    : "grey.900"
                                            }
                                            mb={3}
                                        >
                                            Advantages of this intelligence:
                                        </Text>
                                        <VStack align="stretch" spacing={2}>
                                            {responseAdvantages[
                                                selectedResponseIndex
                                            ].advantages.map(
                                                (advantage, index) => (
                                                    <HStack
                                                        key={index}
                                                        spacing={2}
                                                        align="flex-start"
                                                    >
                                                        <Icon
                                                            as={CheckCircle2}
                                                            boxSize={4}
                                                            color={
                                                                currentDarkTheme.primary
                                                            }
                                                            mt={0.5}
                                                            flexShrink={0}
                                                        />
                                                        <Text
                                                            fontSize="sm"
                                                            color={
                                                                colorMode ===
                                                                "dark"
                                                                    ? "grey.300"
                                                                    : "grey.700"
                                                            }
                                                        >
                                                            {advantage}
                                                        </Text>
                                                    </HStack>
                                                ),
                                            )}
                                        </VStack>
                                    </Box>
                                </VStack>
                            </Box>
                        )}
                    <Box
                        flex={1}
                        minW={0}
                        minH={0}
                        display="flex"
                        flexDirection="column"
                    >
                        <ChatInterface
                            fullHeight
                            compact
                            messages={messages}
                            onSendMessage={sendMessage}
                            onResponseSelect={handleResponseSelect}
                            selectedResponseIndex={selectedResponseIndex}
                            selectedMessageId={selectedMessageId}
                            responseLabels={responseLabels}
                            responseDescriptions={responseDescriptions}
                        />
                    </Box>
                </Stack>
            </Stack>
        </chakra.form>
    );
};
