import { useState } from "react";
import { Check, Pause, Play } from "lucide-react";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useIsActivePanel } from "../motion/store";
import { prefersReducedMotion } from "../motion/reduced";
import { useReasoningDemo } from "./reasoning/useReasoningDemo";
import { ReasoningChat } from "./reasoning/ReasoningChat";
import styles from "./Reasoning.module.css";

const points = ["Plusieurs sources par question", "Comparaison point par point", "Synthèse sourcée"];

const ID = "raisonnement";

export function Reasoning() {
  const [stopped, setStopped] = useState(false);
  const reduced = prefersReducedMotion();
  const isActive = useIsActivePanel(ID);
  const demo = useReasoningDemo(isActive && !stopped, reduced);

  return (
    <Panel id="raisonnement" label="Recherche et raisonnement" tone="open" className={styles.grid}>
      <SectionIntro
        eyebrow="Recherche et raisonnement"
        title="Il ne retrouve pas seulement. Il compare."
        text="Posez une question qui croise plusieurs documents. L'assistant récupère les bons passages, les confronte et rédige la synthèse : le travail de comparaison est fait pour vous."
      >
        <ul className={styles.points} {...reveal(3)}>
          {points.map((p) => (
            <li key={p}>
              <Check size={14} strokeWidth={3} aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </SectionIntro>

      <div className={styles.demo} {...reveal(2)}>
        <ReasoningChat state={demo} />
        {!reduced && (
          <button
            type="button"
            className={styles.pause}
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? "Reprendre l'animation" : "Mettre en pause l'animation"}
          >
            {stopped ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
          </button>
        )}
      </div>
    </Panel>
  );
}
