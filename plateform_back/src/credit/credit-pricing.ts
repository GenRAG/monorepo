export const CREDITS_PER_UNIT = 5000;
export const MARGIN_MULTIPLIER = 1.5;

/** Billed for an answer whose real cost never arrived. */
export const MIN_QUERY_CREDITS = 1;

export function costToCredits(totalCost: number): number {
    const rawCredits = Math.round(totalCost * MARGIN_MULTIPLIER * CREDITS_PER_UNIT * 1e6) / 1e6;
    return Math.max(1, Math.ceil(rawCredits));
}
