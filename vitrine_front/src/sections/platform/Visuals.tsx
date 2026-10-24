import { Check, FileText, Globe, Lock, Sparkles, Users } from "lucide-react";
import { DocIcon } from "../../components/ui";
import { providerMask } from "../../components/providerLogos";
import styles from "./Visuals.module.css";

export function BuilderVisual() {
  return (
    <div className={styles.canvas}>
      {["Question", "Recherche", "Réponse"].map((node, i) => (
        <div key={node} className={styles.nodeWrap} style={{ "--n": i } as React.CSSProperties}>
          <div className={`${styles.node} ${i === 2 ? styles.nodeAi : ""}`}>
            <span className={styles.nodeIcon}>{i === 2 ? <Sparkles size={14} /> : <FileText size={14} />}</span>
            <span className={styles.nodeLabel}>{node}</span>
            {i === 2 && <span className={styles.modelChip}>Modèle IA</span>}
          </div>
          {i < 2 && <span className={styles.edge} />}
        </div>
      ))}
    </div>
  );
}

const modelRows = [
  { slug: "anthropic", name: "Anthropic", hint: "Raisonnement" },
  { slug: "openai", name: "OpenAI", hint: "Polyvalent" },
  { slug: "mistral", name: "Mistral AI", hint: "Économique" },
];

export function ModelsVisual() {
  return (
    <ul className={styles.models}>
      {modelRows.map((row, i) => (
        <li key={row.slug} className={`${styles.modelRow} ${i === 0 ? styles.picked : ""}`}>
          <span className={styles.modelLogo} style={{ maskImage: providerMask(row.slug) }} />
          <span className={styles.modelName}>
            {row.name}
            <small>{row.hint}</small>
          </span>
          {i === 0 && (
            <span className={styles.pickedTag}>
              <Check size={12} strokeWidth={3} /> Choisi
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

const files = [
  { name: "Convention.pdf", kind: "pdf" },
  { name: "Livret_accueil.docx", kind: "doc" },
  { name: "Notes_de_frais.md", kind: "doc" },
];

export function DocumentsVisual() {
  return (
    <div className={styles.docs}>
      <ul className={styles.files}>
        {files.map((file, i) => (
          <li key={file.name} style={{ "--n": i } as React.CSSProperties}>
            <DocIcon kind={file.kind} size={13} /> {file.name}
          </li>
        ))}
      </ul>
      <div className={styles.base}>
        <strong>Base RH</strong>
        <span className={styles.progress} />
        <span className={styles.indexed}>
          <Check size={12} strokeWidth={3} /> Indexé
        </span>
      </div>
    </div>
  );
}

export function AnswersVisual() {
  return (
    <div className={styles.chat}>
      <p className={styles.question}>Combien de jours de télétravail par semaine ?</p>
      <div className={styles.answer}>
        <span className={styles.answerIcon}>
          <Sparkles size={13} />
        </span>
        <div>
          Jusqu'à 2 jours par semaine, après accord du manager.
          <span className={styles.source}>
            <FileText size={12} /> Accord_teletravail.pdf · p. 3
          </span>
        </div>
      </div>
    </div>
  );
}

export function ShareVisual() {
  return (
    <div className={styles.browser}>
      <div className={styles.bar}>
        <i />
        <i />
        <i />
        <span className={styles.url}>
          <Lock size={11} /> acme-rh.genrag.app
        </span>
      </div>
      <div className={styles.page}>
        <span className={styles.live}>
          <Globe size={13} /> En ligne
        </span>
        <span className={styles.people}>
          <Users size={13} /> Équipe RH
        </span>
      </div>
    </div>
  );
}

const bars = [32, 44, 38, 56, 49, 61, 72, 58, 66, 80, 74, 91, 86, 98];

export function AnalyticsVisual() {
  const max = Math.max(...bars);
  return (
    <div className={styles.chart}>
      <p className={styles.chartLabel}>Questions par jour</p>
      <div className={styles.bars}>
        {bars.map((v, i) => (
          <span key={i} style={{ height: `${(v / max) * 100}%`, "--n": i } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
