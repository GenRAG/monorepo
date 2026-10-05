import { HStack, Image, Progress, Spacer, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import logoGreen from "assets/logo/mainLogo.png";
import Button from "components/ui/Button";
import { getGlassInk } from "components/ui/GlassNav";
import OnboardingStepList from "components/Onboarding/Stepper/OnboardingStepList";
import { useOnboarding } from "hooks/onboarding/useOnboarding";

/** Colonne des étapes (écrans larges), posée directement sur le fond ambiant comme la sidebar agent. */
const OnboardingRail = () => {
    const { currentStep, totalSteps, skip } = useOnboarding();
    const { colorMode, toggleColorMode } = useColorMode();
    const ink = getGlassInk(colorMode);

    return (
        <VStack
            as="aside"
            display={{ base: "none", xl: "flex" }}
            w="312px"
            flexShrink={0}
            align="stretch"
            spacing={8}
            px={3}
            py={5}
        >
            <Image src={logoGreen} alt="GenRAG" h="32px" alignSelf="flex-start" ml={3} />

            <VStack align="stretch" spacing={3} px={3}>
                <Text variant="body-lg-semibold" color={ink.text}>
                    Premiers pas
                </Text>
                <Progress
                    value={((currentStep + 1) / totalSteps) * 100}
                    size="xs"
                    colorScheme="green"
                    borderRadius="full"
                    bg={ink.pillBg}
                />
                <Text variant="body-xs" color={ink.muted}>
                    Étape {currentStep + 1} sur {totalSteps}
                </Text>
            </VStack>

            <OnboardingStepList />

            <Spacer />

            <HStack justify="space-between" px={1}>
                <Button variant="ghost" size="sm" onClick={() => void skip()}>
                    Passer le tutoriel
                </Button>
                <Button
                    btnType="icon"
                    variant="ghost"
                    size="sm"
                    aria-label={colorMode === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
                    onClick={toggleColorMode}
                    icon={colorMode === "dark" ? Sun : Moon}
                />
            </HStack>
        </VStack>
    );
};

export default OnboardingRail;
