import { FolderUp, Workflow, Users } from "lucide-react";
import { steps } from "../content";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import styles from "./Steps.module.css";

const icons = [FolderUp, Workflow, Users];
const tags = ["Départ", null, "Fin"];

export function Steps() {
  return (
    <Panel id="etapes" label="Comment ça marche" tone="open">
      <SectionIntro index={3} eyebrow={steps.eyebrow} title={steps.title} align="center" />
      <ol className={styles.track}>
        <span className={styles.line} aria-hidden />
        {steps.items.map((step, i) => {
          const Icon = icons[i];
          return (
            <li key={step.title} className={styles.step} {...reveal(3 + i * 2)}>
              <span className={styles.handle} aria-hidden />
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.icon}>
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className={styles.num}>Étape {i + 1}</span>
                  {tags[i] && <span className={styles.tag}>{tags[i]}</span>}
                </div>
                <h3 className={styles.title}>{step.title}</h3>
                <p className={styles.text}>{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
