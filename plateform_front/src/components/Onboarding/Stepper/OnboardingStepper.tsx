import React from "react";
import {
    Box,
    Text,
    Icon,
    Step,
    StepDescription,
    StepIndicator,
    StepStatus,
    StepTitle,
    Stepper,
    Circle,
    useColorMode,
    useBreakpointValue,
} from "@chakra-ui/react";
import { Check } from "lucide-react";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useOnboarding } from "hooks/useOnBoarding";

interface OnboardingStepperProps {
    justCompletedStep: number | null;
    onStepClick?: () => void;
}

const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
    justCompletedStep,
    onStepClick,
}) => {
    const { colorMode } = useColorMode();
    const isMobile = useBreakpointValue({ base: true, lg: false });
    const { currentStep, goToStep } = useOnboarding();

    return (
        <Stepper
            h="100%"
            index={currentStep}
            orientation="vertical"
            variant={currentDarkTheme.colorScheme}
        >
            {stepsConfig.map((step, index) => (
                <Step
                    key={index}
                    onClick={() => {
                        goToStep(index);
                        if (isMobile) onStepClick?.();
                    }}
                >
                    <StepIndicator flexShrink={0} border="none">
                        <StepStatus
                            complete={
                                <Circle size="45px" mr="1px">
                                    <Icon
                                        as={Check}
                                        color="white"
                                        boxSize={5}
                                    />
                                </Circle>
                            }
                            incomplete={
                                <Icon
                                    as={step.icon}
                                    color={
                                        colorMode === "dark"
                                            ? "grey.900"
                                            : "grey.500"
                                    }
                                    boxSize={5}
                                />
                            }
                            active={
                                <Icon
                                    as={step.icon}
                                    color="white"
                                    boxSize={5}
                                />
                            }
                        />
                    </StepIndicator>
                    <Box flex={1} ml={4} minW={0}>
                        <StepTitle>
                            <Text fontWeight="semibold" fontSize="md">
                                {step.title}
                            </Text>
                        </StepTitle>
                        <StepDescription>
                            <Text
                                fontWeight="semibold"
                                fontSize="xs"
                                color="textmuted"
                            >
                                {step.description}
                            </Text>
                        </StepDescription>
                    </Box>
                    <Box
                        position="absolute"
                        left="16px"
                        top="38px"
                        bottom={index === stepsConfig.length - 1 ? "auto" : "0"}
                        width="2px"
                        className="step-separator-wrapper"
                    >
                        <Box
                            position="absolute"
                            left="0"
                            top="0"
                            bottom="0"
                            width="2px"
                            style={{
                                backgroundColor: "transparent",
                                borderLeft:
                                    index >= currentStep
                                        ? `2px dashed ${colorMode === "dark" ? currentDarkTheme.rgba.primary30 : "#D1D5DB"}`
                                        : `2px solid transparent`,
                                transition:
                                    "border-color 0.6s ease-in-out, border-style 0.6s ease-in-out",
                                zIndex: 1,
                            }}
                        />
                        {index < currentStep && index !== justCompletedStep && (
                            <Box
                                className="step-separator-fill step-separator-static"
                                style={
                                    {
                                        "--separator-fill-color":
                                            currentDarkTheme.hex.primary,
                                        height: "100%",
                                        opacity: 1,
                                    } as React.CSSProperties
                                }
                            />
                        )}
                        {index === justCompletedStep && index < currentStep && (
                            <Box
                                key={`separator-fill-animating-${index}-${currentStep}`}
                                className="step-separator-fill"
                                style={
                                    {
                                        "--separator-fill-color":
                                            currentDarkTheme.hex.primary,
                                    } as React.CSSProperties
                                }
                            />
                        )}
                    </Box>
                </Step>
            ))}
        </Stepper>
    );
};

export default OnboardingStepper;
