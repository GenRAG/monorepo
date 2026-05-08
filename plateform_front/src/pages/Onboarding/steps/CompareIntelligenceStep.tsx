import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    Box,
    Heading,
    Stack,
    Text,
    VStack,
    useColorMode,
    chakra,
} from "@chakra-ui/react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { useForm } from "react-hook-form";
import StepLevel from "components/System/Molecules/StepLevel";
import { ChatInterface } from "components/System/Molecules/ChatInterface";
import { useChat } from "hooks/useChat";
import { useAppResponsive } from "hooks/useAppResponsive";
import ResponseDetailPanel from "components/Onboarding/CompareIntelligence/ResponseDetailPanel";
import "../onboardingAnimations.css";

interface CompareIntelligenceFormData {
    selectedLLM: string;
    question: string;
}

const RESPONSES = [
    "According to the Syntec collective agreement, you are entitled to 25 paid vacation days per year.",
    "According to your collective agreement and internal regulations, you are entitled to 27 paid vacation days per year, including 2 additional days granted by your company.",
    "Great question! Your company grants you 27 paid vacation days per year, which is above the legal minimum. This includes 25 days according to the Syntec agreement, plus 2 additional days that your company has chosen to add to improve your work-life balance.",
];

const RESPONSE_LABELS = ["Standard (fast)", "More precise", "More creative"];

const RESPONSE_DESCRIPTIONS = [
    "Quick and efficient responses",
    "In-depth document analysis",
    "More detailed and contextual responses",
];

const RESPONSE_ADVANTAGES = [
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

export const CompareIntelligenceStepComponent: React.FC<StepComponentProps> = ({
    data,
    updateData,
    goNext,
    registerValidateAndGoNext,
}) => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });

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

    useEffect(() => {
        if (!registerValidateAndGoNext) return;
        registerValidateAndGoNext(async () => {
            if (await triggerRef.current()) goNextRef.current();
        });
    }, [registerValidateAndGoNext]);

    const getResponse = useCallback((): string[] => RESPONSES, []);

    const { messages, sendMessage } = useChat({ getResponse });

    const handleResponseSelect = async (
        responseIndex: number,
        messageId: string,
    ) => {
        setSelectedResponseIndex(responseIndex);
        setSelectedMessageId(messageId);
        const llmId = ["standard", "precise", "creative"][responseIndex];
        setValue("selectedLLM", llmId);
        updateData({ selectedLLM: llmId });
        await trigger();
    };

    return (
        <chakra.form w="100%" h="100%">
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
                    {selectedResponseIndex !== null && selectedMessageId && (
                        <ResponseDetailPanel
                            selectedIndex={selectedResponseIndex}
                            responseText={RESPONSES[selectedResponseIndex]}
                            responseAdvantages={RESPONSE_ADVANTAGES}
                            responseDescriptions={RESPONSE_DESCRIPTIONS}
                        />
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
                            responseLabels={RESPONSE_LABELS}
                            responseDescriptions={RESPONSE_DESCRIPTIONS}
                        />
                    </Box>
                </Stack>
            </Stack>
        </chakra.form>
    );
};
