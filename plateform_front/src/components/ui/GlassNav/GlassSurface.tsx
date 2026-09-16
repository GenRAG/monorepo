import { forwardRef } from "react";
import { Box, BoxProps, useToken } from "@chakra-ui/react";
import { hexToRgba } from "./utils";

export type GlassVariant = "dark" | "light";

export interface GlassSurfaceProps extends BoxProps {
    /**
     * "dark" = panneau translucide sombre (à poser sur un fond clair ou une image).
     * "light" = panneau translucide clair (à poser sur un fond sombre).
     * Indépendant du colorMode de l'app : le nav flotte au-dessus d'un fond arbitraire,
     * donc son propre contraste doit rester choisi explicitement plutôt que suivre le thème.
     */
    variant?: GlassVariant;
    /** Flou du backdrop-filter en px. Recommandé entre 12 et 16px (défaut: 16). */
    blur?: number;
    /** Saturation du backdrop-filter en %. Fait "pop" les couleurs vues à travers le verre. */
    saturation?: number;
    /**
     * Token de couleur du thème (ex: "green.900", "red.900") pour un verre teinté plutôt que le
     * gris neutre par défaut — ex: les colonnes d'un board par statut. Remplace uniquement la base
     * du fond ; le chrome (bordure/reflet/ombre) reste celui de la variante "dark", une teinte
     * personnalisée étant par nature toujours pensée comme un panneau sombre.
     */
    tint?: string;
    /** Affiche la bordure fine du panneau (défaut: true). */
    withBorder?: boolean;
    /** Affiche l'ombre portée + le bevel inset du panneau (défaut: true). */
    withBoxShadow?: boolean;
}

/**
 * Panneau "verre dépoli" de base : fond translucide + backdrop-filter + bordure fine + ombre douce
 * + un reflet diagonal (le trait qui vend le "liquid glass" — sans lui, un fond translucide flou
 * se lit juste comme "un rectangle sombre", surtout sur un arrière-plan peu texturé).
 *
 * On calcule le fond en rgba() (via useToken) plutôt que d'utiliser un token Chakra directement,
 * car un token de couleur classique ne porte pas de canal alpha exploitable ici : le glassmorphism
 * a besoin d'une vraie transparence combinée au blur, pas d'une couleur opaque.
 *
 * L'opacité de fond (~0.5-0.55) privilégie la lisibilité sur un fond uni/plat — l'app tourne par
 * défaut en dark mode avec une coque très sombre (grey.950/975), donc un panneau "dark" trop
 * transparent (testé à 0.34 contre un fond de démo coloré) devient quasi invisible en dark-on-dark
 * dans l'app réelle. Le reflet diagonal + la bordure claire du haut restent ce qui vend le "verre"
 * ici, pas la transparence brute : un flou, aussi fort soit-il, ne révèle jamais rien sur un fond
 * plat d'une seule couleur — c'est le contenu qui défile dessous (cartes, texte) qui active l'effet.
 *
 * Même problème, version light : `surfaceAppShell`/`surfacePrimary` valent "white" en mode clair,
 * donc un panneau "light" construit sur du blanc pur (même translucide) se fond dans une coque déjà
 * blanche — pas de contraste de teinte, rien à distinguer. On part donc de `grey.100` (pas blanc)
 * pour donner au panneau une couleur propre qui tranche sur la coque, et le bevel (highlight du haut
 * / ombre du bas en inset) est resserré sur les premiers % du dégradé pour lire comme un reflet net
 * plutôt qu'un lavage blanc qui recouvre toute la surface et annule le contraste qu'on vient de créer.
 */
export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
    (
        {
            variant = "dark",
            blur = 16,
            saturation = 200,
            borderRadius = "2xl",
            tint,
            withBorder = true,
            withBoxShadow = true,
            children,
            ...rest
        },
        ref,
    ) => {
        const [darkBase, lightBase, tintBase] = useToken("colors", ["grey.975", "grey.100", tint ?? "grey.975"]);

        const isDark = tint ? true : variant === "dark";
        const bg = tint ? hexToRgba(tintBase, 0.4) : isDark ? hexToRgba(darkBase, 0.52) : hexToRgba(lightBase, 0.62);
        const borderColor = isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(15, 23, 42, 0.16)";
        // Highlight en haut (la lumière "accroche" le bord supérieur du verre) + ombre discrète en
        // bas (épaisseur) + ombre portée douce vers l'extérieur (le panneau flotte au-dessus du fond).
        const boxShadow = isDark
            ? "0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
            : "0 10px 30px rgba(15, 23, 42, 0.18), inset 0 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(15, 23, 42, 0.14)";
        const sheen = isDark
            ? "linear-gradient(155deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 32%, rgba(255,255,255,0) 55%)"
            : "linear-gradient(155deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 18%, rgba(255,255,255,0) 42%)";

        return (
            <Box
                ref={ref}
                position="relative"
                bg={bg}
                borderWidth={withBorder ? "1px" : "0"}
                borderStyle="solid"
                borderColor={borderColor}
                borderRadius={borderRadius}
                boxShadow={withBoxShadow ? boxShadow : "none"}
                overflow="hidden"
                sx={{
                    // Préfixe Webkit nécessaire pour Safari (iOS notamment) qui ne supporte pas la
                    // propriété non préfixée avant les versions récentes.
                    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                    // Le reflet diagonal : généré en `::before` (peint avant les vrais enfants, donc
                    // dessous) plutôt que via un enfant Box, pour ne jamais intercepter les clics —
                    // `pointerEvents: none` en double sécurité.
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        pointerEvents: "none",
                        background: sheen,
                    },
                }}
                {...rest}
            >
                {children}
            </Box>
        );
    },
);

GlassSurface.displayName = "GlassSurface";
