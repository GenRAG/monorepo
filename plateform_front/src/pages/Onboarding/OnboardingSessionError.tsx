import { Box, Button, Stack, Text, VStack } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SessionError } from "hooks/onboarding/useOnboarding";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

const SESSION_ERROR_MESSAGES: Record<SessionError, { title: string; description: string }> = {
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

interface OnboardingSessionErrorProps {
    sessionError: SessionError;
}

export const OnboardingSessionError = ({ sessionError }: OnboardingSessionErrorProps) => {
    const navigate = useNavigate();
    const { title, description } = SESSION_ERROR_MESSAGES[sessionError];

    return (
        <Stack h="100vh" align="center" justify="center" p={8}>
            <VStack
                spacing={6}
                maxW="480px"
                h="100%"
                w="100%"
                p={8}
                bg="surfaceModal"
                border="1px solid"
                borderColor="borderDivider"
                borderRadius="16px"
                align="center"
                textAlign="center"
            >
                <Box p={4} bg="borderDefault" borderRadius="12px">
                    <AlertTriangle size={32} color="var(--chakra-colors-errorIconAccent)" />
                </Box>
                <VStack spacing={2}>
                    <Text fontSize="xl" fontWeight="semibold" color="textStrong">
                        {title}
                    </Text>
                    <Text fontSize="sm" color="textDescription">
                        {description}
                    </Text>
                </VStack>
                <Button colorScheme={currentDarkTheme.colorScheme} onClick={() => void navigate("/dashboard")}>
                    Retour au tableau de bord
                </Button>
            </VStack>
        </Stack>
    );
};
