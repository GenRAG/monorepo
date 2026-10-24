import { ArrowRight } from "lucide-react";
import { pages } from "../routes";
import { Panel } from "../components/Panel";
import { ButtonLink, SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useAnchor } from "../motion/MotionContext";
import { ProviderStrip } from "./hero/ProviderStrip";
import { Ribbon } from "./hero/Ribbon";
import styles from "./Hero.module.css";

export function Hero() {
  const anchor = useAnchor();
  return (
    <Panel id="accueil" label="Accueil" tone="open" className={styles.hero}>
      <div className={styles.art}>
        <Ribbon />
      </div>
      <div className={styles.copy}>
        <SectionIntro
          as="h1"
          split
          title="Vos documents éparpillés, enfin connectés."
          text="GenRAG transforme vos documents en un assistant qui répond à votre équipe, sources à l'appui. Sans une ligne de code."
        />
        <div className={styles.ctas} {...reveal(3)}>
          <ButtonLink href={pages.contact.path}>
            Demander un accès
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <ButtonLink href="#plateforme" variant="ghost" onClick={anchor("plateforme")}>
            Voir comment ça marche
          </ButtonLink>
        </div>
      </div>
      <div {...reveal(4)}>
        <ProviderStrip />
      </div>
    </Panel>
  );
}
