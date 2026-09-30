import { Search, CornerDownLeft } from "lucide-react";
import { problem } from "../content";
import { Panel } from "../components/Panel";
import { DocIcon, SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import styles from "./Problem.module.css";

const highlight = (name: string) =>
  name
    .split(/(Durand)/i)
    .map((part, i) => (/durand/i.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>));

export function Problem() {
  return (
    <Panel id="constat" label="Le constat" tone="open" className={styles.grid}>
      <SectionIntro index={2} eyebrow={problem.eyebrow} title={problem.title} text={problem.text} />

      <div
        className={styles.window}
        {...reveal(2)}
        role="img"
        aria-label="Une recherche de fichiers qui renvoie plusieurs versions d'un même contrat"
      >
        <div className={styles.searchBar}>
          <Search size={16} aria-hidden />
          <span className={styles.query}>{problem.search}</span>
          <span className={styles.caret} aria-hidden />
          <kbd className={styles.kbd}>
            <CornerDownLeft size={12} aria-hidden />
          </kbd>
        </div>
        <p className={styles.count}>
          {problem.results.length} {problem.resultsLabel}
        </p>
        <ul className={styles.results}>
          {problem.results.map((r, i) => (
            <li key={r.name} className={styles.row} {...reveal(3 + i)}>
              <DocIcon kind={r.kind} />
              <span className={styles.name}>{highlight(r.name)}</span>
              <span className={styles.where}>{r.where}</span>
            </li>
          ))}
        </ul>
        <p className={styles.footnote} {...reveal(9)}>
          {problem.footnote}
        </p>
      </div>
    </Panel>
  );
}
