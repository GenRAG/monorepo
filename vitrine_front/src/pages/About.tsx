import { Layout } from "../components/Layout";
import { CtaBand } from "../components/CtaBand";
import { PageHero } from "../components/PageHero";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { StoryArt } from "../illustrations/ResourceArt";
import styles from "./pages.module.css";

// TODO: relire et compléter ce récit (prénoms, déclic de départ, école, dates clés) avant publication.
const chapters = [
  {
    date: "Avril 2025",
    title: "Le point de départ",
    text: "GenRAG démarre comme un projet d'étudiants. Une idée : donner aux équipes sans service informatique les assistants IA que seules les grandes entreprises savent construire.",
  },
  {
    date: "Février 2026",
    title: "Un éditeur pour tous",
    text: "Plutôt qu'une boîte noire, nous construisons un éditeur visuel : chaque étape de l'assistant devient un bloc que l'on règle à la souris.",
  },
  {
    date: "Juillet 2026",
    title: "La revue de projet",
    text: "Le projet passe sa revue d'étape. La plateforme est mise en production, avec un premier suivi de la consommation.",
  },
  {
    date: "Aujourd'hui",
    title: "La bêta fermée",
    text: "La bêta s'ouvre à quelques entreprises pilotes. Leurs retours décident de ce que nous construisons ensuite.",
  },
];

const values = [
  {
    title: "Des réponses vérifiables",
    text: "Chaque réponse cite ses sources. On ne croit pas l'assistant sur parole.",
  },
  { title: "Sans compétence technique", text: "Si une étape demande un développeur, c'est à nous de la simplifier." },
  {
    title: "Construit avec nos utilisateurs",
    text: "Les entreprises pilotes voient les nouveautés en premier et les façonnent.",
  },
];

export function AboutPage() {
  return (
    <Layout page="a-propos">
      <PageHero
        eyebrow="Notre histoire"
        title="Né d'une question simple : où est la bonne réponse ?"
        text="Dans une entreprise, l'information existe presque toujours. Elle est dans un PDF, un tableur, un mail. Ce qui manque, c'est le temps de la retrouver."
        art={<StoryArt chapters={chapters} />}
      />
      <Panel id="parcours" label="Parcours" tone="open">
        <ol className={styles.chapters}>
          {chapters.map((c, i) => (
            <li key={c.title} className={styles.chapter} {...reveal(i)}>
              <span className={styles.chapterDate}>{c.date}</span>
              <h2 className={styles.chapterTitle}>{c.title}</h2>
              <p>{c.text}</p>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel id="valeurs" label="Ce qui nous guide" tone="light">
        <SectionIntro eyebrow="Ce qui nous guide" title="Trois principes, depuis le premier jour." />
        <ul className={styles.grid3}>
          {values.map((v, i) => (
            <li key={v.title} className={styles.cell} {...reveal(i)}>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </li>
          ))}
        </ul>
      </Panel>
      <CtaBand />
    </Layout>
  );
}
