import { Flex, Icon, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SessionError } from "hooks/onboarding/useOnboarding";
import { AmbientGlow } from "components/ui/AmbientGlow";
import Button from "components/ui/Button";

const SESSION_ERROR_MESSAGES: Record<SessionError, { title: string; description: string }> = {
    not_found: {
        title: "Espace introuvable",
        description: "Cet espace n'existe pas ou a été supprimé. Vérifiez l'URL ou retournez au tableau de bord.",
    },
    unauthorized: {
        title: "Accès non autorisé",
        description: "Vous n'avez pas accès à cet espace. Contactez un administrateur.",
    },
    unknown: {
        title: "Une erreur est survenue",
        description: "Impossible de charger la session d'onboarding. Réessayez plus tard.",
    },
};

interface OnboardingSessionErrorProps {
    sessionError: SessionError;
}

export const OnboardingSessionError = ({ sessionError }: OnboardingSessionErrorProps) => {
    const navigate = useNavigate();
    const ambientBg = useColorModeValue("grey.100", "grey.975");
    const { title, description } = SESSION_ERROR_MESSAGES[sessionError];

    return (
        <Flex h="100vh" align="center" justify="center" p={6} position="relative" zIndex={0} bg={ambientBg}>
            <AmbientGlow />
            <VStack
                spacing={5}
                maxW="440px"
                w="100%"
                p={8}
                bg="agentBackgroundDefault"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="borderSubtle"
                borderRadius="20px"
                textAlign="center"
            >
                <Flex w="52px" h="52px" align="center" justify="center" bg="surfaceHover" borderRadius="12px">
                    <Icon as={AlertTriangle} boxSize={6} color="errorIconAccent" />
                </Flex>
                <VStack spacing={1.5}>
                    <Text variant="body-lg-semibold" color="textStrong">
                        {title}
                    </Text>
                    <Text variant="body-sm" color="textLabel">
                        {description}
                    </Text>
                </VStack>
                <Button onClick={() => void navigate("/")}>Retour au tableau de bord</Button>
            </VStack>
        </Flex>
    );
};
