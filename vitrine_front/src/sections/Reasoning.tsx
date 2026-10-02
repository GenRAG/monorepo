import { useState } from "react";
import { Check, Pause, Play } from "lucide-react";
import { reasoning } from "../content";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useActivePanel } from "../motion/store";
import { sectionIndex } from "../motion/MotionContext";
import { prefersReducedMotion } from "../motion/reduced";
import { useReasoningDemo } from "./reasoning/useReasoningDemo";
import { ReasoningChat } from "./reasoning/ReasoningChat";
import styles from "./Reasoning.module.css";

const INDEX = sectionIndex("raisonnement");

export function Reasoning() {
  const [stopped, setStopped] = useState(false);
  const reduced = prefersReducedMotion();
  const isActive = useActivePanel() === INDEX;
  const demo = useReasoningDemo(isActive && !stopped, reduced);

  return (
    <Panel id="raisonnement" label="Recherche et raisonnement" tone="open" className={styles.grid}>
      <SectionIntro index={7} eyebrow={reasoning.eyebrow} title={reasoning.title} text={reasoning.text}>
        <ul className={styles.points} {...reveal(3)}>
          {reasoning.points.map((p) => (
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
            aria-label={stopped ? reasoning.play : reasoning.pause}
          >
            {stopped ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
          </button>
        )}
      </div>
    </Panel>
  );
}
