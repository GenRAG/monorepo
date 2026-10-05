export const EdgeType = {
    Main: "default",
    Settings: "settings",
} as const;

export type EdgeType = (typeof EdgeType)[keyof typeof EdgeType];

/** ReactFlow handle ids: the main chain and the settings links. */
export const HandleId = {
    MainSource: "main-source",
    MainTarget: "main-target",
    SettingTarget: "setting-target",
} as const;

const SETTING_SOURCE_PREFIX = "setting-source-";

/** Handle of a chain node that feeds its setting `inputName` (a MODEL / INSTRUCTION node). */
export const settingSourceHandle = (inputName: string) => `${SETTING_SOURCE_PREFIX}${inputName}`;

/** Input name behind a settings source handle (`undefined` for any other handle). */
export const settingInputName = (handle: string | null | undefined): string | undefined =>
    handle?.startsWith(SETTING_SOURCE_PREFIX) ? handle.slice(SETTING_SOURCE_PREFIX.length) : undefined;
