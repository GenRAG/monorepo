import { VersionStatus } from "types/deployment/deployment";

export interface Version {
    id: string;
    env: VersionStatus;
    description: string;
    date: string;
    author: string;
    model: string;
    documents: string;
    tools: string;
    temperature: string;
    pipeline: object;
}

export const ENV_BADGE: Record<Version["env"], { label: string; color: string; bg: string; borderToken: string }> = {
    prod: {
        label: "PROD",
        color: "green",
        bg: "var(--chakra-colors-green-950)",
        borderToken: "var(--chakra-colors-green-700)",
    },
    archived: {
        label: "ARCHIVÉ",
        color: "grey",
        bg: "transparent",
        borderToken: "var(--chakra-colors-grey-700)",
    },
};
