import { File, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " Go";
}

export function formatDate(date: Date | string | undefined | null): string {
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

export interface FileTypeBadgeConfig {
    label: string;
    bg: string;
    color: string;
}

export function getFileTypeBadgeConfig(mimeType: string): FileTypeBadgeConfig {
    if (mimeType.includes("pdf")) return { label: "PDF", bg: "red.500", color: "white" };
    if (mimeType.includes("word") || mimeType.includes("document"))
        return { label: "DOC", bg: "blue.500", color: "white" };
    if (mimeType.includes("markdown")) return { label: "MD", bg: "green.500", color: "white" };
    return { label: "TXT", bg: "grey.500", color: "white" };
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
        "text/plain": "Texte",
        "text/markdown": "Markdown",
        "application/msword": "Word",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
    };

    return typeMap[mimeType] ?? "Document";
}

export function getFileIcon(mimeType: string): LucideIcon {
    if (mimeType.includes("pdf")) return File;
    if (mimeType.includes("word") || mimeType.includes("document")) return FileText;
    return File;
}

export function getPreviewUrl(mimeType: string, url: string): string {
    const lower = mimeType.toLowerCase();

    if (lower.includes("word") || lower.includes("document") || lower.includes("msword")) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    return url;
}
