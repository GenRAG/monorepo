const AVATAR_PALETTE = [
    { bg: "#E0E7FF", color: "#3730A3" },
    { bg: "#DCFCE7", color: "#166534" },
    { bg: "#FCE7F3", color: "#9D174D" },
    { bg: "#FEF3C7", color: "#92400E" },
    { bg: "#FDE8D8", color: "#9A3412" },
    { bg: "#F3E8FF", color: "#6B21A8" },
    { bg: "#CFFAFE", color: "#155E75" },
    { bg: "#FEE2E2", color: "#991B1B" },
];

const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

export const getAgentAvatar = (name: string) => AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length];
