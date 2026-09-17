import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import AgentSidebar from "app/Navigation/AgentSidebar/AgentSidebar";

/**
 * Lueurs décoratives — leur seul rôle est de donner au `backdrop-filter` de la GlassSurface
 * (AgentSidebar) quelque chose à flouter. Un fond plat ne révèle jamais rien au blur (voir la doc
 * de GlassSurface) : sans ça, le panneau "verre" se lit juste comme un rectangle à fond teinté,
 * pas comme du verre dépoli. Dégradés radiaux plutôt que forme pleine + `filter: blur()` : un
 * second flou manuel ici, combiné à celui de la GlassSurface (16px) et à son fond quasi opaque
 * (52%), aplatit complètement la couleur avant qu'elle n'atteigne le panneau — c'est le blur du
 * verre lui-même qui doit adoucir la couleur, pas un flou appliqué deux fois. `zIndex={-1}`
 * (plutôt qu'un z-index positif sur la sidebar/le contenu) : dans l'ordre de peinture CSS, un
 * descendant positionné en z-index négatif passe déjà sous le contenu en flux normal non
 * positionné, donc rien d'autre à toucher pour le garder derrière — à condition que le `Flex`
 * parent forme lui-même un contexte d'empilement local (`position` + un `zIndex` explicite, pas
 * juste `position: relative` seul, qui n'en crée pas) : sinon la lueur "s'échappe" vers le contexte
 * d'empilement le plus proche au-dessus — ici la coquille racine app-wide, opaque — et disparaît
 * complètement derrière elle, quel que soit son z-index local.
 */
const AmbientGlow = () => (
    <Box position="absolute" inset={0} zIndex={-1} pointerEvents="none" overflow="hidden">
        <Box
            position="absolute"
            top="-120px"
            left="-140px"
            w="480px"
            h="480px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(18, 185, 140, 0.9) 0%, rgba(18, 185, 140, 0) 68%)"
        />
        <Box
            position="absolute"
            bottom="-140px"
            left="10px"
            w="440px"
            h="440px"
            borderRadius="full"
            bg="radial-gradient(circle, rgba(74, 159, 216, 0.75) 0%, rgba(74, 159, 216, 0) 68%)"
        />
    </Box>
);

const PrivateAgentAppLayout: React.FC = () => {
    return (
        <Flex overflow="hidden" position="relative" zIndex={0}>
            <AmbientGlow />
            <AgentSidebar />
            <Box flex={1} minW={0} display="flex" flexDirection="column" overflow="hidden" bg="secondBackgroundDefault">
                <Outlet />
            </Box>
        </Flex>
    );
};

export default PrivateAgentAppLayout;
