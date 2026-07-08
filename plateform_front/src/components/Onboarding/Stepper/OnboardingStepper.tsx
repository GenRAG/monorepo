import React from "react";
import {
    Box,
    Circle,
    Icon,
    Step,
    StepDescription,
    StepIndicator,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    Text,
    useColorMode,
} from "@chakra-ui/react";
import { useAppResponsive } from "hooks/useAppResponsive";
import { Check } from "lucide-react";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useOnboarding } from "hooks/useOnBoarding";

interface OnboardingStepperProps {
    justCompletedStep: number | null;
    onStepClick?: () => void;
}

const OnboardingStepper: React.FC<OnboardingStepperProps> = ({ onStepClick }) => {
    const { colorMode } = useColorMode();
    const isMobile = useAppResponsive({ base: true, lg: false });
    const { currentStep, goToStep } = useOnboarding();

    const isDark = colorMode === "dark";

    return (
        <Stepper h="100%" index={currentStep} orientation="vertical" variant={currentDarkTheme.colorScheme}>
            {stepsConfig.map((step, index) => (
                <Step
                    key={index}
                    onClick={() => {
                        goToStep(index);
                        if (isMobile) onStepClick?.();
                    }}
                    style={{ cursor: "pointer" }}
                >
                    <StepIndicator flexShrink={0} border="none">
                        <StepStatus
                            complete={
                                <Circle size="55px" mr="1px">
                                    <Icon as={Check} color="white" boxSize={5} />
                                </Circle>
                            }
                            incomplete={<Icon as={step.icon} color={isDark ? "grey.900" : "grey.500"} boxSize={5} />}
                            active={<Icon as={step.icon} color="white" boxSize={5} />}
                        />
                    </StepIndicator>

                    <Box flex={1} ml={4} minW={0}>
                        <StepTitle>
                            <Text fontWeight="semibold" fontSize="md">
                                {step.title}
                            </Text>
                        </StepTitle>
                        <StepDescription>
                            <Text fontWeight="semibold" fontSize="xs" color="textmuted">
                                {step.description}
                            </Text>
                        </StepDescription>
                    </Box>

                    <StepSeparator mt={2} />
                </Step>
            ))}
        </Stepper>
    );
};

export default OnboardingStepper;
