import { useState } from "react";
import { X } from "lucide-react";
import { builder } from "../../content";
import type { BuilderDemoState } from "./useBuilderDemo";
import { BlockOverview } from "./BlockOverview";
import { ModelPicker } from "./ModelPicker";
import styles from "./NodePanel.module.css";

/** Panneau latéral de l'app (NodeModal) : aperçu d'un bloc ou choix de son modèle. */
export function NodePanel({ state }: { state: BuilderDemoState }) {
  // Garde le dernier contenu pendant la fermeture, pour qu'il glisse hors du cadre sans se vider.
  const [last, setLast] = useState(state.panel);
  if (state.panel && state.panel !== last) setLast(state.panel);
  const panel = state.panel ?? last;

  const isModels = panel?.view === "models";
  const title = panel ? (isModels ? builder.picker.title : builder.nodes[panel.block]) : "";
  const subtitle = panel ? (isModels ? builder.picker.subtitle : builder.blocks[panel.block].description) : "";

  return (
    <aside className={`${styles.panel} ${state.panel ? styles.open : ""}`} aria-hidden>
      {panel && (
        <>
          <header className={styles.head}>
            <div>
              <p className={styles.title}>{title}</p>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
            <span
              data-demo="panel-close"
              className={`${styles.close} ${state.hover === "panel-close" ? styles.closeHover : ""}`}
            >
              <X size={14} />
            </span>
          </header>

          {isModels ? (
            <ModelPicker block={panel.block} preview={state.preview} picked={state.picked} hover={state.hover} />
          ) : (
            <>
              <nav className={styles.tabs}>
                <span className={styles.tabActive}>{builder.panel.overview}</span>
                <span>{builder.panel.settings}</span>
              </nav>
              <BlockOverview key={panel.block} block={panel.block} chapter={state.chapter} />
            </>
          )}
        </>
      )}
    </aside>
  );
}
