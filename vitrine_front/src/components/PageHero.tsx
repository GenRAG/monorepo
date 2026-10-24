import type { ReactNode } from "react";
import { Panel } from "./Panel";
import { SectionIntro } from "./ui";
import { reveal } from "./reveal";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  text: string;
  /** Illustration à droite du titre. */
  art?: ReactNode;
  children?: ReactNode;
}

/** Ouverture d'une page secondaire : titre de page (h1) et illustration. */
export function PageHero({ eyebrow, title, text, art, children }: PageHeroProps) {
  return (
    <Panel id="intro" label={eyebrow} tone="open" glow className={art ? styles.withArt : styles.solo}>
      <SectionIntro numbered={false} as="h1" eyebrow={eyebrow} title={title} text={text}>
        {children}
      </SectionIntro>
      {art && (
        <div className={styles.art} {...reveal(2)} aria-hidden>
          {art}
        </div>
      )}
    </Panel>
  );
}
