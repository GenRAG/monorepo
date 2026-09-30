import { ArrowRight } from "lucide-react";
import { hero, site } from "../content";
import { Panel } from "../components/Panel";
import { ButtonLink, SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useAnchor } from "../motion/MotionContext";
import { useActivePanel } from "../motion/store";
import { Ingestion } from "./hero/Ingestion";
import styles from "./Hero.module.css";

export function Hero() {
  const anchor = useAnchor();
  const isActive = useActivePanel() === 0;
  return (
    <Panel id="accueil" label="Accueil" tone="open" glow full className={styles.grid}>
      <div className={styles.copy}>
        <SectionIntro index={1} eyebrow={hero.eyebrow} title={hero.title} text={hero.subtitle} as="h1" />
        <div className={styles.ctas} {...reveal(3)}>
          <ButtonLink href="#contact" onClick={anchor("contact")}>
            {site.primaryCta}
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <ButtonLink href="#etapes" variant="ghost" onClick={anchor("etapes")}>
            {site.secondaryCta}
          </ButtonLink>
        </div>
      </div>
      <div {...reveal(2)} className={styles.visualWrap}>
        <Ingestion paused={!isActive} />
      </div>
    </Panel>
  );
}
