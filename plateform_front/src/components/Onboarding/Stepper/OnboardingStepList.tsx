import { Box, Flex, Icon, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { getGlassInk } from "components/ui/GlassNav";
import { useOnboarding } from "hooks/onboarding/useOnboarding";
import { stepsConfig } from "pages/Onboarding/steps/StepConfig";

/** Liste des étapes : même encre et mêmes pastilles actives que la sidebar agent, posée sur le fond ambiant. */
const OnboardingStepList = () => {
    const { currentStep, goToStep, isStepCompleted, canNavigateToStep } = useOnboarding();
    const { colorMode } = useColorMode();
    const ink = getGlassInk(colorMode);

    return (
        <VStack as="ol" align="stretch" spacing={1} listStyleType="none">
            {stepsConfig.map((step, index) => {
                const isActive = index === currentStep;
                const isDone = isStepCompleted(index) && !isActive;
                const canNavigate = canNavigateToStep(index);

                return (
                    <Box as="li" key={step.id}>
                        <Box
                            as="button"
                            type="button"
                            aria-current={isActive ? "step" : undefined}
                            disabled={!canNavigate}
                            onClick={() => goToStep(index)}
                            display="flex"
                            alignItems={isActive ? "flex-start" : "center"}
                            gap={3}
                            w="100%"
                            px={3}
                            py={3}
                            borderRadius="12px"
                            textAlign="left"
                            bg={isActive ? ink.pillBg : "transparent"}
                            cursor={canNavigate ? "pointer" : "default"}
                            transition="background 0.15s"
                            _hover={canNavigate ? { bg: ink.pillBg } : undefined}
                        >
                            <Flex
                                w="26px"
                                h="26px"
                                flexShrink={0}
                                align="center"
                                justify="center"
                                borderRadius="full"
                                borderWidth="1px"
                                borderStyle="solid"
                                borderColor={isActive || isDone ? "transparent" : "borderStrong"}
                                bg={isActive ? "iconAccent" : isDone ? "accentIconBg" : "transparent"}
                                color={isActive ? "grey.975" : isDone ? "iconAccent" : ink.muted}
                            >
                                {isDone ? (
                                    <Icon as={Check} boxSize={3.5} strokeWidth={3} />
                                ) : (
                                    <Text variant="body-xs-semibold">{index + 1}</Text>
                                )}
                            </Flex>
                            <VStack align="start" spacing={0.5} minW={0}>
                                <Text variant="body-sm-semibold" color={isActive ? ink.text : ink.muted}>
                                    {step.title}
                                </Text>
                                {isActive && (
                                    <Text variant="body-xs" color={ink.muted}>
                                        {step.description}
                                    </Text>
                                )}
                            </VStack>
                        </Box>
                    </Box>
                );
            })}
        </VStack>
    );
};

export default OnboardingStepList;
