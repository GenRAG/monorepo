import { Box, HStack, Image, Text, VStack, useColorMode } from "@chakra-ui/react";
import logoGreen from "assets/logo/mainLogo.png";
import Button from "components/ui/Button";
import { getGlassInk } from "components/ui/GlassNav";
import { useOnboarding } from "hooks/onboarding/useOnboarding";

/** Progression compacte, affichée à la place de la colonne des étapes sur les écrans étroits. */
const OnboardingTopBar = () => {
    const { currentStep, totalSteps, skip } = useOnboarding();
    const { colorMode } = useColorMode();
    const ink = getGlassInk(colorMode);

    return (
        <HStack display={{ base: "flex", xl: "none" }} spacing={3} px={2} pb={3} flexShrink={0}>
            <Image src={logoGreen} alt="GenRAG" h="26px" />
            <VStack flex={1} align="stretch" spacing={1.5} minW={0}>
                <Text variant="body-xs" color={ink.muted}>
                    Étape {currentStep + 1} sur {totalSteps}
                </Text>
                <HStack spacing={1}>
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <Box
                            key={index}
                            flex={1}
                            h="3px"
                            borderRadius="full"
                            bg={index <= currentStep ? "iconAccent" : ink.pillBg}
                        />
                    ))}
                </HStack>
            </VStack>
            <Button variant="ghost" size="sm" onClick={() => void skip()}>
                Passer
            </Button>
        </HStack>
    );
};

export default OnboardingTopBar;
