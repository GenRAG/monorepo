import { ArrowRight } from "lucide-react";
import { pages } from "../routes";
import { Panel } from "./Panel";
import { ButtonLink } from "./ui";
import { reveal } from "./reveal";
import { AccessArt } from "../illustrations/AccessArt";
import styles from "./CtaBand.module.css";

/** Dernière section des pages : renvoie vers le formulaire d'accès et les tarifs. */
export function CtaBand({ pricingLink = true }: { pricingLink?: boolean }) {
  return (
    <Panel id="acces" label="Demander un accès" tone="slab" glow className={styles.band}>
      <div className={styles.copy}>
        <h2 className={styles.title} {...reveal(0)}>
          Prêt à essayer sur vos propres documents ?
        </h2>
        <p className={styles.text} {...reveal(1)}>
          GenRAG est en bêta fermée. Laissez-nous vos coordonnées, nous organisons votre accès.
        </p>
        <div className={styles.actions} {...reveal(2)}>
          <ButtonLink href={pages.contact.path}>
            Demander un accès
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          {pricingLink && (
            <ButtonLink href={pages.tarifs.path} variant="ghost">
              Voir les tarifs
            </ButtonLink>
          )}
        </div>
      </div>
      <div className={styles.art} {...reveal(2)} aria-hidden>
        <AccessArt />
      </div>
    </Panel>
  );
}
