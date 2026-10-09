import { useColorMode } from "@chakra-ui/react";
import { GlassSurface, GlassSurfaceProps } from "components/ui/GlassNav/GlassSurface";

/**
 * `GlassSurface` qui suit le colorMode de l'app (verre sombre en dark, clair en light), sans ombre
 * portée ni reflet diagonal — pour les cartes/panneaux de page posés sur le fond ambiant, par opposition à GlassNav
 * qui flotte au-dessus d'un fond arbitraire et choisit son variant explicitement.
 */
export const GlassPanel = (props: Omit<GlassSurfaceProps, "variant">) => {
    const { colorMode } = useColorMode();

    return <GlassSurface variant={colorMode} blur={12} withBoxShadow={false} withSheen={false} borderRadius="14px" {...props} />;
};
