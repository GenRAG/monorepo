import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { pages } from "../routes";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import {
  AnalyticsVisual,
  AnswersVisual,
  BuilderVisual,
  DocumentsVisual,
  ModelsVisual,
  ShareVisual,
} from "./platform/Visuals";
import styles from "./Platform.module.css";

interface Card {
  title: string;
  text: string;
  span: "wide" | "narrow" | "full";
  href: string;
  /** Couleur du halo qui déborde de la maquette. */
  wash: "green" | "violet";
  visual: ReactNode;
}

/** Cartes dans l'ordre d'affichage, chacune renvoie vers sa page produit. */
const cards: Card[] = [
  {
    title: "Assemblez votre assistant sans code",
    text: "Partez d'un modèle métier ou glissez les étapes dans GenRAG Studio.",
    span: "wide",
    href: pages.creer.path,
    wash: "green",
    visual: <BuilderVisual />,
  },
  {
    title: "Le bon modèle pour chaque étape",
    text: "Plus de 400 modèles, comparés par qualité, vitesse et prix.",
    span: "narrow",
    href: `${pages.creer.path}#modeles`,
    wash: "violet",
    visual: <ModelsVisual />,
  },
  {
    title: "Vos documents, d'où qu'ils viennent",
    text: "PDF, Word, texte ou pages web, importés ou reliés à Google Drive.",
    span: "narrow",
    href: pages.documents.path,
    wash: "green",
    visual: <DocumentsVisual />,
  },
  {
    title: "Des réponses sourcées",
    text: "Chaque réponse cite le document et le passage d'où elle vient.",
    span: "narrow",
    href: `${pages.documents.path}#raisonnement`,
    wash: "violet",
    visual: <AnswersVisual />,
  },
  {
    title: "Partagez en un clic",
    text: "Une adresse dédiée, aux couleurs de votre entreprise.",
    span: "narrow",
    href: pages.deployer.path,
    wash: "green",
    visual: <ShareVisual />,
  },
  {
    title: "Suivez chaque question",
    text: "Volume, sujets fréquents, temps de réponse et crédits consommés, assistant par assistant.",
    span: "full",
    href: `${pages.deployer.path}#suivi`,
    wash: "violet",
    visual: <AnalyticsVisual />,
  },
];

/** Grille de cartes : une carte par brique du produit, chacune avec sa mini-maquette. */
export function Platform() {
  return (
    <Panel id="plateforme" label="La plateforme" tone="open">
      <SectionIntro
        eyebrow="La plateforme"
        title="Tout pour lancer votre assistant."
        text="Importez vos documents, assemblez votre assistant, partagez-le : chaque étape tient en quelques clics, sans équipe technique."
        split
      />
      <ul className={styles.grid}>
        {cards.map(({ title, text, span, href, wash, visual }, i) => (
          <li key={title} className={`${styles.card} ${styles[span]} ${styles[wash]}`} {...reveal(2 + i)}>
            <a href={href} className={styles.link}>
              <div className={styles.head}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.text}>{text}</p>
              </div>
              <span className={styles.more} aria-hidden>
                <ArrowUpRight size={16} />
              </span>
              <div className={styles.visual} aria-hidden>
                {visual}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
