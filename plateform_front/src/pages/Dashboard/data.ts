import { AgentDeploymentStatus } from "types/agent/agent";

export type Period = "24h" | "7j" | "30j";

export const SPARK_DATA = {
    conversations: [
        80, 95, 88, 110, 105, 130, 125, 140, 145, 150, 148, 160, 175, 168, 180,
        172, 190, 195, 200, 210,
    ],
    latency: [
        180, 160, 155, 170, 140, 130, 150, 120, 140, 130, 140, 150, 130, 120,
        140, 150, 130, 140, 140, 140,
    ],
    errors: [
        20, 30, 25, 40, 35, 30, 45, 50, 40, 35, 40, 45, 50, 40, 35, 40, 50, 55,
        40, 40,
    ],
    documents: [
        180, 190, 195, 200, 205, 210, 215, 220, 222, 225, 228, 230, 232, 235,
        238, 240, 242, 244, 246, 248,
    ],
};

const hours24 = Array.from({ length: 24 }, (_, i) => `${i}h`);
const days7 = [
    "Lun",
    "Mar",
    "Mer",
    "Jeu",
    "Ven",
    "Sam",
    "Dim",
    "Lun",
    "Mar",
    "Mer",
    "Jeu",
    "Ven",
    "Sam",
    "Dim",
    "Lun",
    "Mar",
    "Mer",
    "Jeu",
    "Ven",
    "Sam",
    "Dim",
    "Lun",
    "Mar",
    "Mer",
    "Jeu",
    "Ven",
    "Sam",
    "Dim",
    "Lun",
    "Mar",
];
const days30 = Array.from({ length: 30 }, (_, i) => `J-${30 - i}`);

export const ACTIVITY_DATA: Record<
    Period,
    { labels: string[]; values: number[] }
> = {
    "24h": {
        labels: hours24,
        values: [
            40, 55, 70, 62, 80, 110, 130, 145, 160, 142, 130, 150, 170, 190,
            210, 195, 220, 240, 230, 260, 280, 270, 300, 310,
        ],
    },
    "7j": {
        labels: days7,
        values: [
            320, 280, 350, 420, 380, 450, 490, 520, 480, 550, 580, 540, 600,
            620, 580, 650, 680, 720, 700, 750, 780, 760, 820, 850, 880, 860,
            900, 920, 960, 970,
        ],
    },
    "30j": {
        labels: days30,
        values: [
            280, 310, 290, 340, 380, 360, 410, 430, 400, 460, 490, 470, 520,
            550, 530, 580, 600, 570, 630, 660, 640, 690, 720, 700, 750, 780,
            760, 810, 840, 870,
        ],
    },
};

export interface AgentEntry {
    initials: string;
    name: string;
    status: AgentDeploymentStatus;
    version: string;
    conv: string;
    p95: string;
    err: string;
    errWarning?: boolean;
}

export const AGENTS: AgentEntry[] = [
    {
        initials: "AI",
        name: "Assistant juridique",
        status: "PRODUCTION",
        version: "v12",
        conv: "482",
        p95: "1,2 s",
        err: "0.2%",
    },
    {
        initials: "Sc",
        name: "Support client FR",
        status: "PRODUCTION",
        version: "v8",
        conv: "612",
        p95: "1,5 s",
        err: "0.6%",
    },
    {
        initials: "RI",
        name: "Recherche interne",
        status: "PRODUCTION",
        version: "v4",
        conv: "124",
        p95: "2,1 s",
        err: "1.4%",
        errWarning: true,
    },
    {
        initials: "OR",
        name: "Onboarding RH",
        status: "DEVELOPMENT",
        version: "v2",
        conv: "30",
        p95: "1,8 s",
        err: "0.0%",
    },
];

export interface AlertEntry {
    accentColor: string;
    title: string;
    description: string;
    time: string;
    source: string;
    severity: "error" | "warning" | "info";
}

export const ALERTS: AlertEntry[] = [
    {
        accentColor: "#EF4444",
        severity: "error",
        title: "Pic d'erreurs sur Recherche interne",
        description:
            "14 réponses 500 entre 10:42 et 10:58. Modèle de retrieval en timeout.",
        time: "Il y a 12 min",
        source: "Recherche interne",
    },
    {
        accentColor: "#F59E0B",
        severity: "warning",
        title: "6 documents en échec d'indexation",
        description: "PDF chiffrés ou corrompus. À ré-uploader ou supprimer.",
        time: "Il y a 1 h",
        source: "Documents",
    },
    {
        accentColor: "#3B82F6",
        severity: "info",
        title: "Nouveau modèle disponible",
        description:
            "claude-sonnet-4-5 — testez-le sur staging avant promotion.",
        time: "Il y a 3 h",
        source: "Plateforme",
    },
];

export interface ActivityEntry {
    iconName: "message" | "upload" | "arrow";
    title: string;
    subtitle: string;
    time: string;
}

export const RECENT_ACTIVITY: ActivityEntry[] = [
    {
        iconName: "message",
        title: "Customer Support — Politique de remboursement",
        subtitle: "SupportBot · résolu",
        time: "Il y a 2 min",
    },
    {
        iconName: "upload",
        title: "Téléversement : Convention-Syntec-IDCC-1486.pdf",
        subtitle: "Documents · Indexé",
        time: "Il y a 18 min",
    },
    {
        iconName: "arrow",
        title: "Promotion en production · v12",
        subtitle: "Assistant juridique",
        time: "Il y a 1 h",
    },
];
