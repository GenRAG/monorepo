import { FileSpreadsheet, FileText, Folder, Mail, FileType2 } from "lucide-react";
import styles from "./ui.module.css";

export type DocKind = "pdf" | "sheet" | "doc" | "mail" | "folder";

const kindIcon = { pdf: FileType2, sheet: FileSpreadsheet, doc: FileText, mail: Mail, folder: Folder };

export function DocIcon({ kind, size = 16 }: { kind: string; size?: number }) {
    const Icon = kindIcon[kind as DocKind] ?? FileText;
    return (
        <span className={`${styles.docIcon} ${styles[`k_${kind}`] ?? ""}`}>
            <Icon size={size} strokeWidth={1.75} aria-hidden />
        </span>
    );
}
