export function formatRelativeDate(date: Date | string | undefined | null): string {
    if (!date) return "-";

    const parsedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";

    const now = new Date();
    const diffMs = now.getTime() - parsedDate.getTime();
    const mins = Math.floor(diffMs / 60_000);
    const hours = Math.floor(diffMs / 3_600_000);
    const days = Math.floor(diffMs / 86_400_000);

    if (mins < 1) return "À l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    if (hours < 24) return `il y a ${hours} h`;
    if (days < 30) return `il y a ${days} j`;

    return parsedDate.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
        year: parsedDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

export function formatAbsoluteDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
