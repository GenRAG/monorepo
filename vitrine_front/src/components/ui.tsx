import type { ReactNode } from "react";
import { FileSpreadsheet, FileText, Folder, Mail, FileType2 } from "lucide-react";
import styles from "./ui.module.css";

import { reveal } from "./reveal";

interface SectionIntroProps {
  index: number;
  eyebrow: string;
  title: string;
  text?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  wide?: boolean;
  children?: ReactNode;
}

export function SectionIntro({
  index,
  eyebrow,
  title,
  text,
  align = "left",
  as = "h2",
  wide,
  children,
}: SectionIntroProps) {
  const Title = as;
  return (
    <div className={`${styles.intro} ${align === "center" ? styles.center : ""} ${wide ? styles.wide : ""}`}>
      <p className={styles.eyebrow} {...reveal(0)}>
        <span className={styles.eyebrowIndex}>{String(index).padStart(2, "0")}</span>
        {eyebrow}
      </p>
      <Title className={as === "h1" ? styles.display : styles.title} {...reveal(1)}>
        {title}
      </Title>
      {text && (
        <p className={styles.lead} {...reveal(2)}>
          {text}
        </p>
      )}
      {children}
    </div>
  );
}

interface ButtonProps {
  href: string;
  variant?: "primary" | "ghost";
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}

export function ButtonLink({ href, variant = "primary", onClick, children }: ButtonProps) {
  return (
    <a href={href} onClick={onClick} className={`${styles.button} ${styles[variant]}`}>
      {children}
    </a>
  );
}

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
