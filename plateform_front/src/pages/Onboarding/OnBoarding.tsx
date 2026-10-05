import React, { useCallback } from "react";
import "pages/Onboarding/onboardingAnimations.css";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { OnboardingProvider } from "pages/Onboarding/OnBoardingProvider";
import { useOnboarding } from "hooks/onboarding/useOnboarding";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";
import StepFooter from "components/Onboarding/StepFooter";
import OnboardingRail from "components/Onboarding/Stepper/OnboardingRail";
import OnboardingTopBar from "components/Onboarding/Stepper/OnboardingTopBar";
import { OnboardingSessionError } from "pages/Onboarding/OnboardingSessionError";
import { AmbientGlow } from "components/ui/AmbientGlow";
import { AppLoader } from "components/ui/AppLoader";
import WorkspaceHeader from "components/ui/WorkspaceHeader";

const OnboardingContent: React.FC = () => {
    const {
        currentStep,
        totalSteps,
        goNext,
        goPrevious,
        updateStepData,
        getStepData,
        isStepValid,
        isSessionLoading,
        sessionError,
    } = useOnboarding();

    // Même fond ambiant que la section agent (voir PrivateAgentAppLayout).
    const ambientBg = useColorModeValue("grey.100", "grey.975");

    const currentStepConfig = stepsConfig[currentStep];
    const CurrentStepComponent = currentStepConfig.component;

    const handleUpdateData = useCallback(
        (data: Parameters<typeof updateStepData>[1]) => updateStepData(currentStepConfig.id, data),
        [updateStepData, currentStepConfig.id],
    );

    if (isSessionLoading) {
        return <AppLoader />;
    }

    if (sessionError) {
        return <OnboardingSessionError sessionError={sessionError} />;
    }

    return (
        <Flex h="100vh" overflow="hidden" position="relative" zIndex={0} bg={ambientBg}>
            <AmbientGlow />
            <OnboardingRail />

            <Flex flex={1} minW={0} direction="column" p={3} overflow="hidden">
                <OnboardingTopBar />
                <Flex
                    flex={1}
                    minH={0}
                    direction="column"
                    overflow="hidden"
                    bg="agentBackgroundDefault"
                    borderRadius="20px"
                >
                    <WorkspaceHeader title={currentStepConfig.title} description={currentStepConfig.description} />
                    <Box key={currentStep} className="step-content-animation" flex={1} minH={0} p={4} overflow="hidden">
                        <CurrentStepComponent
                            data={getStepData(currentStepConfig.id)}
                            updateData={handleUpdateData}
                            goNext={goNext}
                            goPrevious={goPrevious}
                            isValid={isStepValid(currentStep)}
                        />
                    </Box>
                    <StepFooter
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        goNext={goNext}
                        goPrevious={goPrevious}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
};

const Onboarding: React.FC = () => (
    <OnboardingProvider steps={stepsConfig}>
        <OnboardingContent />
    </OnboardingProvider>
);

export default Onboarding;
