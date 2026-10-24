import { Search, CornerDownLeft } from "lucide-react";
import { Panel } from "../components/Panel";
import { DocIcon, SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import styles from "./Problem.module.css";

const results = [
  { name: "Contrat_Durand_v2.docx", where: "Drive › Commercial › 2024", kind: "doc" },
  { name: "Contrat_Durand_v2_FINAL.docx", where: "Bureau", kind: "doc" },
  { name: "Contrat_Durand_v3_signé.pdf", where: "Téléchargements", kind: "pdf" },
  { name: "RE: RE: TR: contrat Durand", where: "Boîte mail", kind: "mail" },
  { name: "Suivi_clients.xlsx", where: "Drive › Direction", kind: "sheet" },
];

const highlight = (name: string) =>
  name
    .split(/(Durand)/i)
    .map((part, i) => (/durand/i.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>));

export function Problem() {
  return (
    <Panel id="constat" label="Le constat" tone="open" className={styles.grid}>
      <SectionIntro
        eyebrow="Le constat"
        title="L'information existe. Personne ne la trouve."
        text="Un contrat sur le Drive, une procédure dans un PDF, des tarifs dans un Excel, la réponse dans un mail. Chaque question devient une chasse au fichier."
      />

      <div
        className={styles.window}
        {...reveal(2)}
        role="img"
        aria-label="Une recherche de fichiers qui renvoie plusieurs versions d'un même contrat"
      >
        <div className={styles.searchBar}>
          <Search size={16} aria-hidden />
          <span className={styles.query}>contrat durand préavis</span>
          <span className={styles.caret} aria-hidden />
          <kbd className={styles.kbd}>
            <CornerDownLeft size={12} aria-hidden />
          </kbd>
        </div>
        <p className={styles.count}>{results.length} résultats</p>
        <ul className={styles.results}>
          {results.map((r, i) => (
            <li key={r.name} className={styles.row} {...reveal(3 + i)}>
              <DocIcon kind={r.kind} />
              <span className={styles.name}>{highlight(r.name)}</span>
              <span className={styles.where}>{r.where}</span>
            </li>
          ))}
        </ul>
        <p className={styles.footnote} {...reveal(9)}>
          Laquelle est la bonne version ?
        </p>
      </div>
    </Panel>
  );
}
