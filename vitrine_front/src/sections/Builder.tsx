import { useRef, useState } from "react";
import { Lock, Pause, Play, RotateCw } from "lucide-react";
import { builder } from "../content";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { DemoCursor } from "../components/DemoCursor";
import { AppSidebar } from "../mockups/AppSidebar";
import { BuilderCanvas } from "../mockups/BuilderCanvas";
import { useActivePanel } from "../motion/store";
import { sectionIndex } from "../motion/MotionContext";
import { prefersReducedMotion } from "../motion/reduced";
import { useBuilderDemo } from "./builder/useBuilderDemo";
import { NodePalette } from "./builder/NodePalette";
import { NodePanel } from "./builder/NodePanel";
import styles from "./Builder.module.css";

const INDEX = sectionIndex("editeur");

export function Builder() {
  const canvas = useRef<HTMLDivElement | null>(null);
  const [stopped, setStopped] = useState(false);
  const reduced = prefersReducedMotion();
  const isActive = useActivePanel() === INDEX;

  const demo = useBuilderDemo(isActive && !stopped, reduced, {
    locate: (key) => {
      const root = canvas.current;
      if (!root) return null;
      const box = root.getBoundingClientRect();
      if (key === "rest") return { x: box.width * 0.6, y: box.height * 0.84 };
      const el = root.querySelector(`[data-demo="${key}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (!r.width) return null;
      // Sur un champ ou une ligne, on vise le début du texte plutôt que le centre.
      const fx = key === "palette-search" ? 0.2 : key.startsWith("palette-") || key.startsWith("pick-") ? 0.4 : 0.5;
      return { x: r.left - box.left + r.width * fx, y: r.top - box.top + r.height * 0.55 };
    },
  });

  return (
    <Panel id="editeur" label="Éditeur sans code" tone="open" className={styles.layout}>
      <div className={styles.bridge} aria-hidden {...reveal(0)}>
        <span>{builder.bridge}</span>
      </div>
      <div className={styles.head}>
        <SectionIntro
          index={5}
          eyebrow={builder.eyebrow}
          title={builder.title}
          text={builder.text}
          align="center"
          wide
        />
      </div>

      <div className={styles.demo} {...reveal(4)}>
        <div
          className={styles.browser}
          role="img"
          aria-label="Démonstration de l'éditeur GenRAG : on ajoute les blocs Reformulation puis Classement depuis la palette, on découvre leur fonctionnement, puis on leur choisit un modèle d'IA"
        >
          <div className={styles.chrome} aria-hidden>
            <span className={styles.lights}>
              <i />
              <i />
              <i />
            </span>
            <div className={styles.url}>
              <Lock size={12} />
              <span>{builder.url}</span>
            </div>
            <RotateCw size={13} className={styles.reload} />
          </div>
          <div className={styles.window}>
            <AppSidebar active={builder.sidebar.active} />
            <BuilderCanvas view={demo} rootRef={canvas}>
              <NodePalette state={demo} />
              <NodePanel state={demo} />
              <DemoCursor cursor={demo.cursor} />
            </BuilderCanvas>
          </div>
        </div>

        {!reduced && (
          <button
            type="button"
            className={styles.pause}
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? builder.play : builder.pause}
          >
            {stopped ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
          </button>
        )}
      </div>
    </Panel>
  );
}
