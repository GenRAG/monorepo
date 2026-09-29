import type { ReactNode } from "react";
import styles from "./Panel.module.css";

interface PanelProps {
  id: string;
  label: string;
  /**
   * open  : section posée sur le fond continu de la page (pas de bord).
   * slab  : dalle sombre arrondie, en retrait des bords, qui se détache de la base.
   * light : dalle claire (une seule sur le parcours).
   */
  tone?: "open" | "slab" | "light";
  scrub?: string;
  glow?: boolean;
  /** Première section : occupe tout l'écran. */
  full?: boolean;
  className?: string;
  children: ReactNode;
}

export function Panel({ id, label, tone = "open", scrub, glow, full, className, children }: PanelProps) {
  const isSlab = tone !== "open";
  return (
    <section
      id={id}
      aria-label={label}
      data-panel
      data-slab={isSlab || undefined}
      data-theme={tone === "light" ? "light" : "dark"}
      data-scrub={scrub}
      className={`${styles.panel} ${styles[tone]} ${full ? styles.full : ""}`}
    >
      <div className={styles.inner}>
        {glow && <div className={styles.glow} aria-hidden />}
        <div className={`${styles.container} ${className ?? ""}`}>{children}</div>
      </div>
    </section>
  );
}
