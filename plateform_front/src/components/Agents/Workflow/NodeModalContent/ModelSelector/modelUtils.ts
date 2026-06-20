export const formatContextLength = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M tokens`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K tokens`;
    return `${n} tokens`;
};

export const formatPrice = (p: string | undefined): string => {
    if (!p || parseFloat(p) === 0) return "Gratuit";
    const perMillion = parseFloat(p) * 1_000_000;
    return `$${perMillion < 1 ? perMillion.toFixed(3) : perMillion.toFixed(2)}/1M`;
};

export const getProviderName = (id: string, provider?: string): string => {
    const name = provider ?? (id.includes("/") ? id.split("/")[0] : id);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : name;
};

export const seededValue = (seed: string, offset: number): number => {
    let h = (offset + 1) * 2654435761;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 0x9e3779b9 + i + 1);
    }
    h ^= h >>> 16;
    return ((Math.abs(h) % 85) + 15) / 100;
};
