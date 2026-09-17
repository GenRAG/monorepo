import { useMemo } from "react";
import { Box, Flex, Icon, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { PanelBottom, PanelLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { mainMenu, supportMenu } from "app/Navigation/sidebarConfig";
import { SidebarFooter } from "app/Navigation/SidebarFooter";
import WorkspaceDropdown from "app/Navigation/MainSidebar/WorkspaceDropdown";
import BoxIcon from "components/ui/BoxIcon";
import { useActiveSidebarItem } from "hooks/sidebar/useActiveSidebarItem";
import { useAppResponsive } from "hooks/useAppResponsive";
import { useUserInfo } from "hooks/useUserInfo";
import { useAppDispatch } from "store";
import { setSidebarLayoutMode } from "store/navigationSlice";
import { useGetUserWorkspacesQuery } from "services/workspace/workspace";
import { GlassNav, GlassNavItem } from "./GlassNav";
import { GlassSurface } from "./GlassSurface";
import { NAV_ICON_MAP } from "./navIconMap";
import { useNavLayoutMode } from "./useNavLayoutMode";
import { getGlassInk } from "./utils";

const items: GlassNavItem[] = mainMenu.map((entry) => ({
    id: entry.id,
    label: entry.label,
    icon: NAV_ICON_MAP[entry.id] ?? NAV_ICON_MAP.dashboard,
    // Crédits ancré en bas de la sidebar verticale, séparé de la navigation principale
    // (Dashboard/Agents/Assistants) — sans effet en bottom bar (mobile/horizontal).
    pinToEnd: entry.id === "billing",
}));

/**
 * Nav principale de l'app, rendue via GlassNav — remplace l'ancienne `MainSidebar/Sidebar.tsx`
 * dans `app/PrivateAppLayout.tsx`. Reprend exactement sa logique de résolution de route
 * (extraction du workspaceId depuis l'URL, `useActiveSidebarItem` pour le fallback hors
 * `/workspaces/:id`) ; seul le rendu change.
 *
 * `GlassNav` étant en `position: fixed` (flottant, pas dans le flux), le conteneur qui l'utilise
 * doit réserver l'espace lui-même (padding) — voir `PrivateAppLayout.tsx`.
 *
 * L'orientation suit `navigation.sidebarLayoutMode` (store Redux, persisté en localStorage) :
 * "auto" laisse le breakpoint décider (comportement par défaut), "sidebar"/"bottombar" est un
 * choix explicite posé via le petit bouton de bascule ci-dessous ou Profil > Apparence — les deux
 * lisent/écrivent le même état, donc restent toujours synchronisés.
 *
 * Le sélecteur de workspace et le menu profil de l'ancienne sidebar (`WorkspaceDropdown`,
 * `SidebarFooter`) ne sont pas réécrits : réutilisés tels quels via leur prop `compactTrigger`,
 * pour garder une seule source de vérité sur la logique (liste des workspaces, déconnexion,
 * thème...). Seul le déclencheur change — un avatar dans une bulle de verre plutôt que la ligne
 * pleine largeur de la sidebar dépliable. Les trois contrôles utilitaires (workspace, profil,
 * bascule sidebar/bottom bar) sont regroupés en haut à droite : une position fixe, quelle que
 * soit l'orientation du nav principal, plutôt que "collée" à un nav dont la hauteur varie selon
 * le nombre d'items.
 *
 * (`AgentSidebar` pourrait suivre le même pattern avec `agentNavItems`, qui est déjà une liste
 * plate — seule la génération des icônes animées correspondantes resterait à faire.)
 */
export const GlassNavAppExample = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { data: workspaces = [] } = useGetUserWorkspacesQuery();
    const { name, email } = useUserInfo();

    const { isVertical } = useNavLayoutMode();

    const offset = useAppResponsive({ base: 12, lg: 24 }) ?? 24;
    const offsetPx = `${offset}px`;
    // Verre clair sur app en mode clair, verre sombre sur app en mode sombre — sinon un panneau
    // "dark" flottant sur un fond blanc unique se lit comme un simple bloc sombre, pas comme du verre.
    // Seul point du fichier qui a réellement besoin de connaître le colorMode global : GlassSurface
    // est volontairement découplée du thème (voir sa doc), donc c'est à l'appelant de traduire le
    // colorMode de l'app en `variant` — ni un token de couleur ni un ternaire ne remplacent ça ici.
    const variant = useColorModeValue("light", "dark");
    const { icon: iconColor } = getGlassInk(variant);

    const defaultActivePath = useActiveSidebarItem(mainMenu.map((i) => i.id));

    const workspaceId = useMemo(() => {
        const match = location.pathname.match(/^\/workspaces\/([^/]+)/);
        return match?.[1] ?? workspaces[0]?.id;
    }, [location.pathname, workspaces]);

    const activePath = useMemo(() => {
        const match = location.pathname.match(/^\/workspaces\/[^/]+\/([^/]+)/);
        return match?.[1] ?? defaultActivePath ?? items[0]?.id;
    }, [location.pathname, defaultActivePath]);

    const handleChange = async (id: string) => {
        if (!workspaceId) return;
        await navigate(`/workspaces/${workspaceId}/${id}`);
    };

    const handleWorkspaceChange = async (id: string) => {
        await navigate(`/workspaces/${id}/dashboard`);
    };

    const toggleLayoutMode = () => {
        dispatch(setSidebarLayoutMode(isVertical ? "bottombar" : "sidebar"));
    };

    return (
        <>
            <GlassNav
                items={items}
                value={activePath}
                onChange={handleChange}
                orientation={isVertical ? "vertical" : "horizontal"}
                offset={offset}
                variant={variant}
            />

            {/* Contrôles utilitaires : workspace, profil, bascule sidebar/bottom bar — voir la
                note de fonction ci-dessus pour le choix de position (coin haut-droit fixe). */}
            <Flex
                direction="column"
                gap={2}
                position="fixed"
                top={`calc(${offsetPx} + env(safe-area-inset-top, 0px))`}
                right={`calc(${offsetPx} + env(safe-area-inset-right, 0px))`}
                zIndex={30}
            >
                <WorkspaceDropdown
                    workspaces={workspaces}
                    selectedId={workspaceId ?? ""}
                    onSelect={handleWorkspaceChange}
                    compactTrigger={
                        <GlassSurface variant={variant} borderRadius="full" p="6px" display="flex">
                            <BoxIcon
                                size="sm"
                                letters={workspaces.find((w) => w.id === workspaceId)?.name.slice(0, 2)}
                            />
                        </GlassSurface>
                    }
                />

                <SidebarFooter
                    isOpen={false}
                    activeItem={null}
                    name={name}
                    email={email}
                    supportMenu={supportMenu}
                    compactTrigger={
                        <GlassSurface
                            variant={variant}
                            borderRadius="full"
                            p="6px"
                            display="flex"
                            aria-label="Mon compte"
                        >
                            <BoxIcon size="sm" letters={name?.slice(0, 2) || email?.slice(0, 2)} />
                        </GlassSurface>
                    }
                />

                <Tooltip
                    label={isVertical ? "Passer en bottom bar" : "Passer en sidebar"}
                    placement="left"
                    color="white"
                    borderRadius="8px"
                    hasArrow
                    bg="tooltipBg"
                >
                    <Box
                        as="button"
                        type="button"
                        aria-label={isVertical ? "Passer en bottom bar" : "Passer en sidebar"}
                        onClick={toggleLayoutMode}
                    >
                        <GlassSurface variant={variant} borderRadius="full" p="10px" display="flex">
                            <Icon as={isVertical ? PanelBottom : PanelLeft} boxSize="18px" color={iconColor} />
                        </GlassSurface>
                    </Box>
                </Tooltip>
            </Flex>
        </>
    );
};
