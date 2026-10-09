import { ComponentType } from "react";
import { AnimatedIconProps } from "./icons/types";
import { ChatIcon, CreditCardIcon, DashboardIcon, DocumentIcon, FolderIcon } from "./icons";
import {
    AnalyticsIcon,
    BackIcon,
    DeployIcon,
    LibraryIcon,
    PlaygroundIcon,
    SettingsIcon,
    WorkflowIcon,
} from "./icons/agent";

/**
 * Correspondance entre les ids de `mainMenu` (app/Navigation/sidebarConfig.ts) et les icônes
 * animées du GlassNav. Les entrées de mainMenu ont un équivalent 1:1 ici — si un item est
 * ajouté à mainMenu sans entrée correspondante ici, on retombe sur DashboardIcon (voir usages).
 */
export const NAV_ICON_MAP: Record<string, ComponentType<AnimatedIconProps>> = {
    dashboard: DashboardIcon,
    agents: FolderIcon,
    assistants: ChatIcon,
    datasets: DocumentIcon,
    billing: CreditCardIcon,
};

/** Animated icons of the agent sidebar, keyed by the ids of `agentNavSections`. */
export const AGENT_NAV_ICON_MAP: Record<string, ComponentType<AnimatedIconProps>> = {
    retour: BackIcon,
    playground: PlaygroundIcon,
    datasets: LibraryIcon,
    workflow: WorkflowIcon,
    analytics: AnalyticsIcon,
    deploy: DeployIcon,
    settings: SettingsIcon,
};
