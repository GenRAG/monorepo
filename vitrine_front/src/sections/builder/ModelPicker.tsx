import type { CSSProperties } from "react";
import { Check, Search, ArrowUpDown } from "lucide-react";
import { builder } from "../../content";
import type { BlockId } from "./useBuilderDemo";
import styles from "./ModelPicker.module.css";

const HUES = [160, 262, 28, 200, 330];

/** Sélecteur « Modèle IA » : liste à gauche, détail et benchmark à droite. */
export function ModelPicker({
  block,
  preview,
  picked,
  hover,
}: {
  block: BlockId;
  preview: number;
  picked: number | null;
  hover: string | null;
}) {
  const { models } = builder.catalog[block];
  const t = builder.picker;
  const model = models[preview];

  return (
    <div className={styles.picker}>
      <div className={styles.list}>
        <p className={styles.search}>
          <Search size={11} />
          {t.search}
          <ArrowUpDown size={11} className={styles.sort} />
        </p>
        {models.map((m, i) => (
          <div
            key={m.name}
            data-demo={`pick-${i}`}
            className={`${styles.item} ${i === preview ? styles.itemActive : ""}`}
          >
            <Avatar name={m.name} index={i} />
            <span className={styles.itemText}>
              <span className={styles.itemName}>{m.name}</span>
              <span className={styles.itemHint}>{m.hint}</span>
            </span>
            {picked === i && <Check size={13} className={styles.check} />}
          </div>
        ))}
      </div>

      <div className={styles.detail} key={preview}>
        <div className={styles.detailHead}>
          <Avatar name={model.name} index={preview} large />
          <span className={styles.detailTitle}>
            <span className={styles.detailName}>{model.name}</span>
            <span className={styles.detailMeta}>
              <span className={styles.badge}>{model.badge}</span>
              <span className={styles.itemHint}>{model.hint}</span>
            </span>
          </span>
        </div>

        <p className={styles.perfTitle}>{t.perf}</p>
        {t.axes.map((axis, a) => (
          <div key={axis} className={styles.perf}>
            <p>
              <span>{axis}</span>
              <span>{model.perf[a]}/100</span>
            </p>
            <span className={styles.track}>
              <i
                className={styles[`axis${a}`]}
                style={{ "--w": `${model.perf[a]}%`, "--d": `${a * 90}ms` } as CSSProperties}
              />
            </span>
          </div>
        ))}

        <span
          data-demo="pick-select"
          className={`${styles.select} ${hover === "pick-select" ? styles.selectHover : ""} ${picked === preview ? styles.selectReady : ""}`}
        >
          {t.select}
        </span>
      </div>
    </div>
  );
}

function Avatar({ name, index, large }: { name: string; index: number; large?: boolean }) {
  const hue = HUES[index % HUES.length];
  return (
    <span
      className={`${styles.avatar} ${large ? styles.avatarLarge : ""}`}
      style={{ background: `hsl(${hue} 70% 72%)`, color: `hsl(${hue} 60% 22%)` }}
    >
      {name[0]}
    </span>
  );
}
