export const EdgeType = {
    Main: "default",
    Settings: "settings",
} as const;

export type EdgeType = (typeof EdgeType)[keyof typeof EdgeType];
