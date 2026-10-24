import { MousePointerClick, Quote, SlidersHorizontal, FileText, Check } from "lucide-react";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import styles from "./Why.module.css";

const icons = [MousePointerClick, Quote, SlidersHorizontal];

const items = [
  {
    title: "Sans code",
    text: "Tout se fait à la souris : importer, assembler, publier. Aucune compétence technique requise.",
  },
  {
    title: "Des réponses sourcées",
    text: "Chaque réponse s'appuie sur vos documents et indique d'où elle vient. Vous vérifiez en un clic.",
  },
  {
    title: "Vous gardez la main",
    text: "Vous choisissez les documents, les réglages et qui a accès à chaque assistant.",
  },
];

/** Petite preuve visuelle sous chaque point. */
const proofs = [
  <div className={styles.chain} key="chain">
    <span>Question</span>
    <i />
    <span>Recherche</span>
    <i />
    <span>Réponse</span>
  </div>,
  <span className={styles.chip} key="chip">
    <FileText size={12} /> Accord_teletravail.pdf · p. 3
  </span>,
  <div className={styles.checks} key="checks">
    <span>
      <Check size={12} strokeWidth={3} /> Documents choisis
    </span>
    <span>
      <Check size={12} strokeWidth={3} /> Accès : équipe RH
    </span>
  </div>,
];

export function Why() {
  return (
    <Panel id="pourquoi" label="Pourquoi GenRAG" tone="open">
      <SectionIntro eyebrow="Pourquoi GenRAG" title="Pensé pour les équipes sans service informatique." wide />
      {/* TODO: pas d'affirmation sécurité / conformité / RGPD tant qu'elle n'est pas validée (hébergement, sous-traitants, durée de conservation à faire valider). */}
      <ul className={styles.list}>
        {items.map((item, i) => {
          const Icon = icons[i];
          return (
            <li key={item.title} className={styles.item} {...reveal(2 + i)}>
              <span className={styles.icon}>
                <Icon size={20} strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
              <div className={styles.proof} aria-hidden>
                {proofs[i]}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
