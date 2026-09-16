import { ComponentType } from "react";
import { AnimatedIconProps } from "./icons/types";
import { ChatIcon, CreditCardIcon, DashboardIcon, FolderIcon } from "./icons";

/**
 * Correspondance entre les ids de `mainMenu` (app/Navigation/sidebarConfig.ts) et les icônes
 * animées du GlassNav. Les 4 entrées de mainMenu ont un équivalent 1:1 ici — si un item est
 * ajouté à mainMenu sans entrée correspondante ici, on retombe sur DashboardIcon (voir usages).
 */
export const NAV_ICON_MAP: Record<string, ComponentType<AnimatedIconProps>> = {
    dashboard: DashboardIcon,
    agents: FolderIcon,
    assistants: ChatIcon,
    billing: CreditCardIcon,
};
