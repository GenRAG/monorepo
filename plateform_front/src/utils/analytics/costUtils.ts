const CREDITS_PER_UNIT = 5000;
const MARGIN_MULTIPLIER = 1.5;

export const usdToCredits = (costUsd: number): number => Math.ceil(costUsd * MARGIN_MULTIPLIER * CREDITS_PER_UNIT);

export const fmtCredits = (value: number): string => {
    const rounded = Math.round(value);
    return `${rounded.toLocaleString("fr-FR")} crédit${rounded !== 1 ? "s" : ""}`;
};
