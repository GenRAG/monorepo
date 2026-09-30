import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { hero } from "../../content";
import { DocIcon } from "../../components/ui";
import { ICO_FACES } from "../../components/icoFaces";
import styles from "./Ingestion.module.css";

/**
 * Visuel du Hero : des documents arrivent des bords en spirale, sont aspirés par le cœur (l'icosaèdre
 * de l'assistant) et s'y dissolvent. Boucle continue en CSS, calée sur un repère 560×560.
 */

const STAGE = 560;
/** Durée du trajet d'un document, et écart entre deux arrivées (s). */
const TRAVEL = 9;
const GAP = TRAVEL / hero.floatingDocs.length;
/** Instant (fraction du trajet) où le document atteint le cœur : voir @keyframes ingest. */
const ARRIVAL = 0.88;

/** Angle de départ (0° = droite, sens horaire) et distance au cœur. Rien ne part de la zone du texte, à gauche. */
const STARTS = [
  { a: -100, r: 290 },
  { a: 12, r: 290 },
  { a: 150, r: 250 },
  { a: -40, r: 300 },
  { a: 85, r: 280 },
  { a: -155, r: 240 },
];

const vars = (v: Record<string, string | number>) => v as CSSProperties;

export function Ingestion({ paused }: { paused: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / STAGE));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      className={`${styles.frame} ${paused ? styles.paused : ""}`}
      role="img"
      aria-label="Des documents de différents formats sont absorbés par l'assistant GenRAG, qui en fait sa base de connaissances"
      style={vars({ "--travel": `${TRAVEL}s`, "--gap": `${GAP}s`, "--flash-delay": `${(ARRIVAL * TRAVEL) % GAP}s` })}
    >
      <div className={styles.stage} style={{ width: STAGE, height: STAGE, transform: `scale(${scale})` }}>
        <div className={styles.halo} aria-hidden />
        <div className={styles.rings} aria-hidden>
          <i />
          <i />
        </div>

        {hero.floatingDocs.map((doc, i) => {
          const flow = vars({
            "--a0": `${STARTS[i].a}deg`,
            "--r0": `${STARTS[i].r}px`,
            animationDelay: `${-i * GAP}s`,
          });
          return (
            <div key={doc.name} className={`${styles.flow} ${styles.doc}`} style={flow} aria-hidden>
              <DocIcon kind={doc.kind} size={14} />
              <span>{doc.name}</span>
            </div>
          );
        })}

        <div className={styles.core} aria-hidden>
          <span className={styles.shock} />
          <svg className={styles.ico} viewBox="0 0 978 935">
            {ICO_FACES.map((f, i) => (
              <g key={f.points}>
                <polygon points={f.points} className={styles.face} style={vars({ "--shade": f.shade })} />
                <polygon points={f.points} className={styles.glow} style={vars({ "--i": i })} />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
