const AVATAR_PALETTE = [
    { bg: "#A5B4FC", color: "#3730A3" },
    { bg: "#86EFAC", color: "#166534" },
    { bg: "#F9A8D4", color: "#9D174D" },
    { bg: "#FCD34D", color: "#92400E" },
    { bg: "#FDBA74", color: "#9A3412" },
    { bg: "#D8B4FE", color: "#6B21A8" },
    { bg: "#67E8F9", color: "#155E75" },
    { bg: "#FCA5A5", color: "#991B1B" },
];

const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

export const getAgentAvatar = (name: string) => AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length];
