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

export const formatPricePerMillion = (pricePerMillion: number): string => {
    if (pricePerMillion === 0) return "Gratuit";
    return `$${pricePerMillion < 1 ? pricePerMillion.toFixed(3) : pricePerMillion.toFixed(2)}`;
};

const WORDS_PER_MILLION_TOKENS = 750_000;

const formatUsdAmount = (amount: number): string => {
    if (amount === 0) return "0";
    if (amount < 0.01) return amount.toFixed(4);
    if (amount < 1) return amount.toFixed(3);
    return amount.toFixed(2);
};

const WORDS_PER_TOKEN = 0.75;
const WORDS_PER_PAGE = 500;

const formatWordsCount = (words: number): string => {
    if (words >= 1_000_000) return `${(words / 1_000_000).toFixed(1)}M mots`;
    if (words >= 1_000) return `${Math.round(words / 1_000)}K mots`;
    return `${Math.round(words)} mots`;
};

export const formatContextTooltip = (contextTokens: number): string => {
    const words = contextTokens * WORDS_PER_TOKEN;
    const pages = Math.max(1, Math.round(words / WORDS_PER_PAGE));
    return `Contexte : volume total de texte (votre question, les documents, l'historique de conversation et la réponse) que le modèle peut traiter en une fois. Environ ${formatWordsCount(words)} (~${pages} pages).`;
};

export const formatMaxOutputTooltip = (maxOutputTokens: number): string => {
    const words = maxOutputTokens * WORDS_PER_TOKEN;
    const pages = Math.max(1, Math.round(words / WORDS_PER_PAGE));
    return `Réponse max : longueur maximale que le modèle peut générer en une seule réponse. Environ ${formatWordsCount(words)} (~${pages} pages).`;
};

const TOKEN_DIRECTION_EXPLANATION: Record<"input" | "output", string> = {
    input: "Tokens d'entrée : le texte envoyé au modèle (votre question, le contexte, les documents récupérés).",
    output: "Tokens de sortie : le texte généré par le modèle en réponse.",
};

export const formatPriceConversionTooltip = (pricePerMillion: number, direction: "input" | "output"): string => {
    const explanation = TOKEN_DIRECTION_EXPLANATION[direction];
    if (pricePerMillion === 0) return `${explanation} Ce modèle est gratuit, quel que soit le volume de texte.`;
    const per1000Words = (pricePerMillion / WORDS_PER_MILLION_TOKENS) * 1_000;
    return `${explanation} Environ $${formatUsdAmount(per1000Words)} pour 1 000 mots (soit $${formatUsdAmount(pricePerMillion)} pour 750 000 mots, ~1M tokens).`;
};

export const MODEL_BADGE_CONFIG: Record<string, { label: string; hue: string }> = {
    smart: { label: "Intelligent", hue: "purple" },
    fast: { label: "Rapide", hue: "blue" },
    cheap: { label: "Économique", hue: "green" },
    excellent: { label: "Excellent", hue: "gold" },
    value: { label: "Bon rapport qualité-prix", hue: "teal" },
    premium: { label: "Premium", hue: "pink" },
    efficient: { label: "Efficace", hue: "cyan" },
    balanced: { label: "Équilibré", hue: "grey" },
};
