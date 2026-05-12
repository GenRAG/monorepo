import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Button, HStack, Spinner, Stack, Text, VStack, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OnboardingProvider } from "pages/Onboarding/OnBoardingProvider";
import { useOnboarding } from "hooks/useOnBoarding";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";
import StepFooter from "pages/Onboarding/StepFooter";
import OnboardingHeader from "components/Onboarding/Stepper/OnboardingHeader";
import OnboardingSidebar from "components/Onboarding/Stepper/OnboardingSidebar";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useIsDark } from "hooks/useIsDark";

const SESSION_ERROR_MESSAGES = {
    not_found: {
        title: "Workspace introuvable",
        description: "Ce workspace n'existe pas ou a été supprimé. Vérifiez l'URL ou retournez au tableau de bord.",
    },
    unauthorized: {
        title: "Accès non autorisé",
        description: "Vous n'avez pas accès à ce workspace. Contactez un administrateur.",
    },
    unknown: {
        title: "Une erreur est survenue",
        description: "Impossible de charger la session d'onboarding. Réessayez plus tard.",
    },
};

const OnboardingContent: React.FC = () => {
    const {
        currentStep,
        goNext,
        goPrevious,
        updateStepData,
        getStepData,
        isStepValid,
        isSessionLoading,
        sessionError,
    } = useOnboarding();

    const navigate = useNavigate();
    const isDark = useIsDark();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const errorBg = useColorModeValue("white", "grey.900");
    const errorBorder = useColorModeValue("grey.200", "grey.700");

    const containerStyles = {
        bg: isDark ? "grey.950" : "white",
        borderColor: isDark ? "grey.700" : "#acacac81",
    };
    const responsivePadding = { base: 4, md: 6, lg: 10 };

    const currentStepConfig = stepsConfig[currentStep];
    const CurrentStepComponent = currentStepConfig.component;

    const handleUpdateData = useCallback(
        (data: Parameters<typeof updateStepData>[1]) => updateStepData(currentStepConfig.id, data),
        [updateStepData, currentStepConfig.id],
    );

    const [justCompletedStep, setJustCompletedStep] = useState<number | null>(null);
    const prevStepRef = useRef(currentStep);

    useEffect(() => {
        const prevStep = prevStepRef.current;
        if (prevStep === currentStep) return;

        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            const container = document.querySelector("[data-onboarding-container]") as HTMLElement;
            container?.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);

        if (currentStep > prevStep) setJustCompletedStep(prevStep);

        const timer = setTimeout(() => setJustCompletedStep(null), 1000);
        prevStepRef.current = currentStep;
        return () => clearTimeout(timer);
    }, [currentStep]);

    if (isSessionLoading) {
        return (
            <Stack h="100vh" align="center" justify="center" spacing={4}>
                <Spinner size="lg" color={currentDarkTheme.primary} />
                <Text color={isDark ? "grey.400" : "grey.600"} fontSize="sm">
                    Chargement de votre session...
                </Text>
            </Stack>
        );
    }

    if (sessionError) {
        const { title, description } = SESSION_ERROR_MESSAGES[sessionError];
        return (
            <Stack h="100vh" align="center" justify="center" p={8}>
                <VStack
                    spacing={6}
                    maxW="480px"
                    w="100%"
                    p={8}
                    bg={errorBg}
                    border="1px solid"
                    borderColor={errorBorder}
                    borderRadius="16px"
                    align="center"
                    textAlign="center"
                >
                    <Box p={4} bg={isDark ? "grey.800" : "grey.100"} borderRadius="12px">
                        <AlertTriangle size={32} color={isDark ? "#f87171" : "#ef4444"} />
                    </Box>
                    <VStack spacing={2}>
                        <Text fontSize="xl" fontWeight="semibold" color={isDark ? "white" : "grey.900"}>
                            {title}
                        </Text>
                        <Text fontSize="sm" color={isDark ? "grey.400" : "grey.600"}>
                            {description}
                        </Text>
                    </VStack>
                    <Button colorScheme={currentDarkTheme.colorScheme} onClick={() => void navigate("/dashboard")}>
                        Retour au tableau de bord
                    </Button>
                </VStack>
            </Stack>
        );
    }

    return (
        <Stack h="100vh" bg={isDark ? "grey.950" : "grey.50"} spacing={0}>
            <OnboardingHeader onOpenDrawer={onOpen} />

            <HStack w="100%" h="calc(100vh - 90px)" p={{ base: "12px", md: "24px" }} spacing={0} align="stretch">
                <OnboardingSidebar
                    justCompletedStep={justCompletedStep}
                    isDrawerOpen={isOpen}
                    onDrawerClose={onClose}
                />

                <VStack
                    flex={{ base: 1, md: 4 }}
                    align="start"
                    spacing={{ base: 4, md: 8 }}
                    borderRadius="12px"
                    roundedLeft={{ xl: 0 }}
                    border="1px solid"
                    boxShadow="sm"
                    justify="space-between"
                    overflow="hidden"
                    h="100%"
                    data-onboarding-container
                    {...containerStyles}
                >
                    <VStack h="100%" align="start" spacing={0} w="100%" justify="space-between" minH={0}>
                        <Stack
                            w="100%"
                            spacing={4}
                            flex={1}
                            minH={0}
                            overflow="hidden"
                            px={responsivePadding}
                            pt={responsivePadding}
                        >
                            <Text
                                fontSize="2xl"
                                color={currentDarkTheme.primary}
                                fontWeight="semibold"
                                key={`step-text-${currentStep}`}
                                className="step-text-animation"
                            >
                                {`ETAPE ${currentStep + 1} / ${stepsConfig.length} — ${currentStepConfig.title}`}
                            </Text>
                            <Box
                                key={`step-content-${currentStep}`}
                                className="step-content-animation"
                                w="100%"
                                h="100%"
                                flex={1}
                                minH={0}
                                pr={4}
                                mb={4}
                            >
                                <CurrentStepComponent
                                    data={getStepData(currentStepConfig.id)}
                                    updateData={handleUpdateData}
                                    goNext={goNext}
                                    goPrevious={goPrevious}
                                    isValid={isStepValid(currentStep)}
                                />
                            </Box>
                        </Stack>
                        <StepFooter
                            currentStep={currentStep}
                            goNext={goNext}
                            goPrevious={goPrevious}
                            onValidateAndGoNext={async () => goNext()}
                        />
                    </VStack>
                </VStack>
            </HStack>
        </Stack>
    );
};

const Onboarding: React.FC = () => (
    <OnboardingProvider steps={stepsConfig}>
        <OnboardingContent />
    </OnboardingProvider>
);

export default Onboarding;
