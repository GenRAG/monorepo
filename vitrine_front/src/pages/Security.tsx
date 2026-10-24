import { CreditCard, FolderLock, Hourglass, KeyRound, Quote, UsersRound } from "lucide-react";
import { Layout } from "../components/Layout";
import { CtaBand } from "../components/CtaBand";
import { PageHero } from "../components/PageHero";
import { Panel } from "../components/Panel";
import { reveal } from "../components/reveal";
import { SecurityArt } from "../illustrations/ResourceArt";
import styles from "./pages.module.css";

// TODO: compléter avec ce qui est validé (hébergement, sous-traitants, durée de conservation, RGPD).
// Ne rien affirmer ici qui ne soit pas vérifiable dans le code ou validé.
const items = [
  {
    title: "Un espace par entreprise",
    text: "Les documents de chaque entreprise sont indexés dans un espace qui lui est propre. Un assistant ne cherche que dans les bases que vous lui avez données.",
  },
  {
    title: "Des réponses limitées à vos documents",
    text: "L'assistant répond à partir de vos documents et cite ses sources : vous vérifiez d'où vient chaque information.",
  },
  {
    title: "Google Drive, sans accès permanent",
    text: "L'accès à Drive est demandé au moment de l'import, pour les seuls fichiers choisis. Il n'est jamais conservé.",
  },
  {
    title: "Vous choisissez la conservation",
    text: "Pour chaque assistant, vous fixez combien de temps les questions posées sont gardées. Au-delà, elles sont supprimées automatiquement.",
  },
  {
    title: "Qui a accès, c'est vous qui décidez",
    text: "Vous choisissez qui peut utiliser chaque assistant, et vous retirez un accès quand vous le souhaitez.",
  },
  {
    title: "Paiements via Stripe",
    text: "Les paiements passent par Stripe. Vos coordonnées bancaires ne transitent jamais par nos serveurs.",
  },
];

// Même ordre que `items`.
const icons = [FolderLock, Quote, KeyRound, Hourglass, UsersRound, CreditCard];

export function SecurityPage() {
  return (
    <Layout page="securite">
      <PageHero
        eyebrow="Sécurité"
        title="Vos documents restent les vôtres."
        text="Ce que fait GenRAG de vos documents et de vos données, en clair."
        art={<SecurityArt />}
      />
      <Panel id="engagements" label="Engagements" tone="open">
        <ul className={styles.grid3}>
          {items.map((item, i) => {
            const Icon = icons[i];
            return (
              <li key={item.title} className={styles.cell} {...reveal(i % 3)}>
                <span className={styles.cellIcon}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden />
                </span>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </li>
            );
          })}
        </ul>
        <p className={styles.pending}>
          Hébergement, sous-traitants et conformité : cette page sera complétée prochainement.
        </p>
      </Panel>
      <CtaBand />
    </Layout>
  );
}
