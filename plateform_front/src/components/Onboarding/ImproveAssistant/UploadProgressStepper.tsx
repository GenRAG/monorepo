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
    StepSeparator,
    Stepper,
} from "@chakra-ui/react";
import { FileText, Check, Sparkles, Loader2 } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface UploadProgressStepperProps {
    completedFilesCount: number;
    isProcessing: boolean;
    showComparison: boolean;
}

const STEPS = [
    {
        title: "Ajouter vos documents",
        description: "PDF, Markdown, Txt.",
        icon: FileText,
    },
    {
        title: "Traitement en cours...",
        description: "Votre assistant utilise maintenant vos documents pour répondre aux questions.",
        icon: Sparkles,
    },
];

const UploadProgressStepper: React.FC<UploadProgressStepperProps> = ({
    completedFilesCount,
    isProcessing,
    showComparison,
}) => {
    const activeStepIndex = showComparison ? 2 : completedFilesCount > 0 ? 1 : 0;

    return (
        <Box
            w="100%"
            h="100%"
            p={4}
            bg="backgroundDefault"
            borderRadius="12px"
            mb="4px"
            border="1px solid"
            borderColor="borderDivider"
        >
            <Stepper
                index={activeStepIndex}
                orientation="vertical"
                gap={0}
                w="100%"
                h="100%"
                colorScheme={currentDarkTheme.colorScheme}
                variant="solid"
            >
                {STEPS.map((step, index) => (
                    <Step key={index}>
                        <StepIndicator
                            flexShrink={0}
                            border={index <= activeStepIndex ? "none" : "1px solid #E7E7E7"}
                            bg={index <= activeStepIndex ? currentDarkTheme.primary : "white"}
                        >
                            <StepStatus
                                complete={
                                    <Box
                                        bg={currentDarkTheme.primary}
                                        borderRadius="full"
                                        w="28px"
                                        h="28px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon as={Check} color="white" boxSize={4} />
                                    </Box>
                                }
                                incomplete={
                                    index === 1 && isProcessing ? (
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            w="28px"
                                            h="28px"
                                        >
                                            <Icon
                                                as={Loader2}
                                                color={currentDarkTheme.primary}
                                                boxSize={4}
                                                className="spinning"
                                            />
                                        </Box>
                                    ) : (
                                        <Icon as={step.icon} color="textFaint" boxSize={4} />
                                    )
                                }
                                active={
                                    index === 1 && isProcessing ? (
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            w="28px"
                                            h="28px"
                                        >
                                            <Icon as={Loader2} color="white" boxSize={4} className="spinning" />
                                        </Box>
                                    ) : (
                                        <Icon as={step.icon} color="white" boxSize={4} />
                                    )
                                }
                            />
                        </StepIndicator>
                        <Box flex={1} ml={4} minW={0}>
                            <StepTitle>
                                <Text
                                    fontWeight="semibold"
                                    fontSize="sm"
                                    color={index <= activeStepIndex ? "textStrong" : "textDescription"}
                                >
                                    {step.title}
                                </Text>
                            </StepTitle>
                            <StepDescription>
                                <Text fontSize="xs" color="textDescription">
                                    {step.description}
                                </Text>
                            </StepDescription>
                        </Box>
                        <StepSeparator
                            style={{
                                backgroundColor: "transparent",
                                borderLeft: showComparison
                                    ? `2px solid ${currentDarkTheme.primary}`
                                    : "2px dashed var(--chakra-colors-separatorDashAccent)",
                                transition: "all 0.3s ease-in-out",
                            }}
                        />
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default UploadProgressStepper;
