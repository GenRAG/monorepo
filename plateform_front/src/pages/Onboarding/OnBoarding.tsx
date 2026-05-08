import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    HStack,
    Stack,
    Text,
    VStack,
    useColorMode,
    useDisclosure,
} from "@chakra-ui/react";
import { OnboardingProvider } from "pages/Onboarding/OnBoardingProvider";
import { useOnboarding } from "hooks/useOnBoarding";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";
import StepFooter from "pages/Onboarding/StepFooter";
import OnboardingHeader from "components/Onboarding/Stepper/OnboardingHeader";
import OnboardingSidebar from "components/Onboarding/Stepper/OnboardingSidebar";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import "./onboardingAnimations.css";

const OnboardingContent: React.FC = () => {
    const {
        currentStep,
        goNext,
        goPrevious,
        updateStepData,
        getStepData,
        isStepValid,
    } = useOnboarding();

    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [justCompletedStep, setJustCompletedStep] = useState<number | null>(
        null,
    );
    const prevStepRef = useRef(currentStep);
    const validateAndGoNextRef = useRef<(() => Promise<void>) | undefined>(
        undefined,
    );

    const registerValidateAndGoNext = useCallback((fn: () => Promise<void>) => {
        validateAndGoNextRef.current = fn;
    }, []);

    const handleValidateAndGoNext = useCallback(async () => {
        if (validateAndGoNextRef.current) {
            await validateAndGoNextRef.current();
        } else {
            goNext();
        }
    }, [goNext]);

    useEffect(() => {
        const prevStep = prevStepRef.current;
        if (prevStep === currentStep) return;

        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            const container = document.querySelector(
                "[data-onboarding-container]",
            ) as HTMLElement;
            container?.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);

        if (currentStep > prevStep) setJustCompletedStep(prevStep);

        const timer = setTimeout(() => setJustCompletedStep(null), 1000);
        prevStepRef.current = currentStep;
        validateAndGoNextRef.current = undefined;
        return () => clearTimeout(timer);
    }, [currentStep]);

    const currentStepConfig = stepsConfig[currentStep];
    const CurrentStepComponent = currentStepConfig.component;

    return (
        <Stack
            h="100vh"
            bg={colorMode === "dark" ? "grey.900" : "grey.50"}
            spacing={0}
        >
            <OnboardingHeader onOpenDrawer={onOpen} />

            <HStack
                w="100%"
                h="calc(100vh - 90px)"
                p={{ base: "12px", md: "24px" }}
                spacing={0}
                align="stretch"
            >
                <OnboardingSidebar
                    justCompletedStep={justCompletedStep}
                    isDrawerOpen={isOpen}
                    onDrawerClose={onClose}
                />

                <VStack
                    flex={{ base: 1, md: 3 }}
                    bg={colorMode === "dark" ? "grey.800" : "white"}
                    align="start"
                    px={{ base: 4, md: 6, lg: 10 }}
                    pt={{ base: 4, md: 6, lg: 10 }}
                    spacing={{ base: 4, md: 8 }}
                    borderRadius="12px"
                    borderTopLeftRadius={{ xl: "0" }}
                    borderBottomLeftRadius={{ xl: "0" }}
                    border="1px solid"
                    borderColor={
                        colorMode === "dark" ? "grey.700" : "#acacac81"
                    }
                    boxShadow="sm"
                    justify="space-between"
                    overflow="hidden"
                    h="100%"
                    data-onboarding-container
                >
                    <VStack
                        h="100%"
                        align="start"
                        spacing={0}
                        w="100%"
                        justify="space-between"
                        minH={0}
                    >
                        <Stack
                            w="100%"
                            spacing={4}
                            flex={1}
                            minH={0}
                            overflow="hidden"
                        >
                            <Text
                                fontSize="sm"
                                color={currentDarkTheme.primary}
                                fontWeight="semibold"
                                key={`step-text-${currentStep}`}
                                className="step-text-animation"
                            >
                                {`STEP ${currentStep + 1} OF ${stepsConfig.length}`}
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
                                    updateData={(data) =>
                                        updateStepData(
                                            currentStepConfig.id,
                                            data,
                                        )
                                    }
                                    goNext={goNext}
                                    goPrevious={goPrevious}
                                    isValid={isStepValid(currentStep)}
                                    registerValidateAndGoNext={
                                        registerValidateAndGoNext
                                    }
                                />
                            </Box>
                        </Stack>
                        <StepFooter
                            currentStep={currentStep}
                            goNext={goNext}
                            goPrevious={goPrevious}
                            onValidateAndGoNext={handleValidateAndGoNext}
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
