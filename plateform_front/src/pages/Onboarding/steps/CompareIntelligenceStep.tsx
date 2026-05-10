import React, { useRef, useEffect, useState } from "react";
import {
    Box,
    Stack,
    Text,
    VStack,
    useColorMode,
    chakra,
} from "@chakra-ui/react";
import { MessageCircle, RotateCcw, Search, Zap } from "lucide-react";
import { StepComponentProps } from "pages/Onboarding/OnBoardingProvider";
import { useForm } from "react-hook-form";
import StepLevel from "components/System/Molecules/StepLevel";
import ChatInput from "components/System/Molecules/Chat/ChatInput";
import Button from "components/System/Atoms/Button";
import ResponseCard from "components/Onboarding/CompareIntelligence/ResponseDetailPanel";
import { useAppResponsive } from "hooks/useAppResponsive";

interface CompareIntelligenceFormData {
    selectedLLM: string;
}

const RESPONSE_DATA = [
    {
        title: "STANDARD",
        badge: "Rapide",
        isRecommended: false,
        icon: Zap,
        responseText:
            "Selon la convention Syntec, vous avez droit à 25 jours de congés payés par an.",
        advantages: ["Réponse Instantanée", "Idéal pour les questions simples"],
        llmId: "standard",
    },
    {
        title: "PRÉCIS",
        badge: "Recommandé",
        isRecommended: true,
        icon: Search,
        responseText:
            "Selon votre convention collective (Art. 23) et votre règlement intérieur (§4.2), vous bénéficiez de 27 jours de congés payés par an, dont 2 jours supplémentaires accordés par votre entreprise.",
        advantages: [
            "Citations et articles précis",
            "Analyse approfondie des documents",
        ],
        llmId: "precise",
    },
    {
        title: "CRÉATIF",
        badge: "Convivial",
        isRecommended: false,
        icon: MessageCircle,
        responseText:
            "Bonne nouvelle ! Votre entreprise vous offre 27 jours de congés payés — c'est au-dessus du minimum légal. Vous avez 25 jours Syntec + 2 jours bonus. Vous pouvez les poser via MyHR en suivant la procédure habituelle.",
        advantages: [
            "Ton chaleureux et engageant",
            "Meilleure expérience utilisateur",
        ],
        llmId: "creative",
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

    const [question, setQuestion] = useState<string | null>(
        data.testQuestion || null,
    );
    const [selectedResponseIndex, setSelectedResponseIndex] = useState<
        number | null
    >(
        data.selectedLLM
            ? RESPONSE_DATA.findIndex((r) => r.llmId === data.selectedLLM)
            : null,
    );

    const { trigger, setValue } = useForm<CompareIntelligenceFormData>({
        defaultValues: { selectedLLM: data.selectedLLM || "" },
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

    const handleQuestionSend = (q: string) => {
        setQuestion(q);
    };

    const handleResponseSelect = async (index: number) => {
        setSelectedResponseIndex(index);
        const llmId = RESPONSE_DATA[index].llmId;
        setValue("selectedLLM", llmId);
        updateData({ selectedLLM: llmId });
        await trigger();
    };

    const handleReset = () => {
        setQuestion(null);
        setSelectedResponseIndex(null);
        setValue("selectedLLM", "");
    };

    return (
        <chakra.form w="100%" h="100%">
            <Stack w="100%" h="100%" spacing={4} flexDirection="column">
                <VStack align="start" spacing={4} w="100%">
                    <StepLevel
                        level={4}
                        title="Optimized"
                        description="You can change intelligence at any time. Nothing is final."
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
                                {RESPONSE_DATA.map((card, index) => (
                                    <ResponseCard
                                        key={index}
                                        title={card.title}
                                        badge={card.badge}
                                        isRecommended={card.isRecommended}
                                        icon={card.icon}
                                        responseText={card.responseText}
                                        advantages={card.advantages}
                                        isSelected={
                                            selectedResponseIndex === index
                                        }
                                        onClick={() =>
                                            handleResponseSelect(index)
                                        }
                                    />
                                ))}
                            </Stack>

                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={RotateCcw}
                                onClick={handleReset}
                                w="fit-content"
                            >
                                Poser une autre question
                            </Button>
                        </VStack>
                    )}
                </Box>
            </Stack>
        </chakra.form>
    );
};
