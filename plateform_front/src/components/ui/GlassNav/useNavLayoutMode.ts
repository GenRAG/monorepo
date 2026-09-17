import { useAppResponsive } from "hooks/useAppResponsive";
import { useAppSelector } from "store";

/**
 * Résout l'orientation effective du GlassNav à partir de `navigation.sidebarLayoutMode` (store
 * Redux, persisté en localStorage) : "auto" suit le breakpoint, "sidebar"/"bottombar" est un
 * choix explicite qui l'emporte dessus.
 *
 * Partagé entre `GlassNavAppExample` (qui rend le nav) et `PrivateAppLayout` (qui réserve
 * l'espace via padding) — les deux DOIVENT lire la même valeur, sinon le padding réservé ne
 * correspond plus à l'orientation réellement affichée (contenu caché derrière le nav, ou
 * espace réservé inutilement).
 */
export const useNavLayoutMode = () => {
    const layoutMode = useAppSelector((state) => state.navigation.sidebarLayoutMode);
    const isMobile = useAppResponsive({ base: true, lg: false });
    const isVertical = layoutMode === "auto" ? !isMobile : layoutMode === "sidebar";

    return { layoutMode, isVertical };
};
