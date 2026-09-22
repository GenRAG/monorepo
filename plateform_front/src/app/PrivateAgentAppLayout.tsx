import { Outlet } from "react-router-dom";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import AgentSidebar from "app/Navigation/AgentSidebar/AgentSidebar";

/**
 * Lueur ambiante — fond commun de toute la section agent (sidebar + page), pas juste un décor
 * derrière la sidebar : la sidebar n'a plus son propre panneau (elle est flush, posée directement
 * dessus) et la marge autour de la page doit laisser deviner ce même fond tout autour. Vert
 * uniquement (pas de bleu) pour rester dans la teinte de marque de l'app plutôt que d'ajouter une
 * couleur d'accent étrangère ; opacité basse pour rester discret — un fond d'ambiance, pas un
 * élément visuel qu'on remarque en soi. `zIndex={-1}` (plutôt qu'un z-index positif sur la
 * sidebar/le contenu) : dans l'ordre de peinture CSS, un descendant positionné en z-index négatif
 * passe déjà sous le contenu en flux normal non positionné, donc rien d'autre à toucher pour le
 * garder derrière — à condition que le `Flex` parent forme lui-même un contexte d'empilement local
 * (`position` + un `zIndex` explicite, pas juste `position: relative` seul, qui n'en crée pas) :
 * sinon la lueur "s'échappe" vers le contexte d'empilement le plus proche au-dessus — ici la coquille
 * racine app-wide, opaque — et disparaît complètement derrière elle, quel que soit son z-index local.
 */
const AmbientGlow = () => (
    <Box position="absolute" inset={0} zIndex={-1} pointerEvents="none" overflow="hidden">
        <Box
            position="absolute"
            top="-220px"
            left="-200px"
            w="820px"
            h="820px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(18, 185, 140, 0.2) 0%, rgba(18, 185, 140, 0) 72%)"
        />
        <Box
            position="absolute"
            bottom="-260px"
            left="20px"
            w="760px"
            h="760px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(18, 185, 140, 0.13) 0%, rgba(18, 185, 140, 0) 72%)"
        />
        <Box
            position="absolute"
            top="-200px"
            right="-220px"
            w="800px"
            h="800px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(18, 185, 140, 0.18) 0%, rgba(18, 185, 140, 0) 72%)"
        />
        <Box
            position="absolute"
            bottom="-240px"
            right="-160px"
            w="740px"
            h="740px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(18, 185, 140, 0.12) 0%, rgba(18, 185, 140, 0) 72%)"
        />
    </Box>
);

const PrivateAgentAppLayout: React.FC = () => {
    // `surfaceAppShell` vaut en fait la même couleur que `secondBackgroundDefault` en dark mode
    // (grey.950 des deux côtés, malgré ce que son nom laisse penser) : la marge autour de la page
    // serait donc invisible avec ce token. `grey.975` est un cran plus sombre pour de vrai.
    const ambientBg = useColorModeValue("grey.100", "grey.975");

    return (
        <Flex overflow="hidden" position="relative" zIndex={0} h="100vh" bg={ambientBg}>
            <AmbientGlow />
            <AgentSidebar />
            <Box flex={1} minW={0} p={3} display="flex" flexDirection="column" overflow="hidden">
                <Box
                    flex={1}
                    minW={0}
                    display="flex"
                    flexDirection="column"
                    overflow="hidden"
                    bg="agentBackgroundDefault"
                    borderRadius="20px"
                >
                    <Outlet />
                </Box>
            </Box>
        </Flex>
    );
};

export default PrivateAgentAppLayout;
