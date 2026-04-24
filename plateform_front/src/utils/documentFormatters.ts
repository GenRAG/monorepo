import { File, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export function formatDate(date: Date | string | undefined | null): string {
    if (!date) return "-";

    const parsedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";

    const now = new Date();
    const diff = now.getTime() - parsedDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;

    return parsedDate.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
        year:
            parsedDate.getFullYear() !== now.getFullYear()
                ? "numeric"
                : undefined,
    });
}

export function formatDateTime(date: Date | string | undefined | null): string {
    if (!date) return "-";

    const parsedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function getFileTypeLabel(mimeType: string): string {
    const typeMap: Record<string, string> = {
        "application/pdf": "PDF",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "Word",
        "application/msword": "Word",
        "text/plain": "Texte",
        "text/markdown": "Markdown",
    };

    return typeMap[mimeType] ?? "Document";
}

export function getFileIcon(mimeType: string): LucideIcon {
    if (mimeType.includes("pdf")) return File;
    if (mimeType.includes("word") || mimeType.includes("document"))
        return FileText;
    return File;
}

export function getPreviewUrl(mimeType: string, url: string): string {
    const lower = mimeType.toLowerCase();

    if (
        lower.includes("word") ||
        lower.includes("document") ||
        lower.includes("msword")
    ) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    return url;
}
