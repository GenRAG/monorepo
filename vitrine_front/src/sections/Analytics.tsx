import { useEffect, useState, type CSSProperties } from "react";
import { MessagesSquare, Timer, Coins, Info } from "lucide-react";
import { analytics, site } from "../content";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useHasEntered } from "../motion/store";
import { sectionIndex } from "../motion/MotionContext";
import { prefersReducedMotion } from "../motion/reduced";
import styles from "./Analytics.module.css";

const INDEX = sectionIndex("suivi");
const kpiIcons = [MessagesSquare, Timer, Coins];
const CHART = { w: 640, h: 200, pad: 8 };

const fmt = (value: number, format: string) => {
  if (format === "sec")
    return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
  if (format === "eur")
    return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  return Math.round(value).toLocaleString("fr-FR");
};

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start || prefersReducedMotion()) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return start && prefersReducedMotion() ? target : v;
}

/** Courbe lissée (Catmull-Rom → Bézier). */
function smoothPath(values: number[]) {
  const max = Math.max(...values) * 1.15;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * CHART.w,
    y: CHART.h - CHART.pad - (v / max) * (CHART.h - CHART.pad * 2),
  }));
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return { line: d, area: `${d}L${CHART.w} ${CHART.h}L0 ${CHART.h}Z` };
}

const { line, area } = smoothPath(analytics.series);
const topicMax = Math.max(...analytics.topics.map((t) => t.value));

function Kpi({
  label,
  value,
  format,
  index,
  start,
}: {
  label: string;
  value: number;
  format: string;
  index: number;
  start: boolean;
}) {
  const v = useCountUp(value, start);
  const Icon = kpiIcons[index];
  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>
        <Icon size={14} aria-hidden /> {label}
      </p>
      <p className={styles.kpiValue}>{fmt(v, format)}</p>
    </div>
  );
}

export function Analytics() {
  const entered = useHasEntered(INDEX);
  return (
    <Panel id="suivi" label="Suivi" tone="open" className={styles.layout}>
      <SectionIntro index={8} eyebrow={analytics.eyebrow} title={analytics.title} text={analytics.text} />

      <div
        className={`${styles.dash} ${entered ? styles.live : ""}`}
        {...reveal(3)}
        role="img"
        aria-label="Tableau de bord d'exemple : nombre de questions, temps de réponse, coût du mois, évolution sur 30 jours et questions fréquentes"
      >
        <span className={styles.demo}>{site.demoLabel}</span>
        <div className={styles.kpis} aria-hidden>
          {analytics.kpis.map((k, i) => (
            <Kpi key={k.label} {...k} index={i} start={entered} />
          ))}
        </div>

        <div className={styles.charts} aria-hidden>
          <div className={`${styles.card} ${styles.chartCard}`}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>
                {analytics.chartTitle} <Info size={12} />
              </p>
              <span className={styles.periods}>
                <i>7j</i>
                <i className={styles.periodOn}>30j</i>
                <i>90j</i>
              </span>
            </div>
            <svg className={styles.chart} viewBox={`0 0 ${CHART.w} ${CHART.h}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#34D3A9" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#34D3A9" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1="0"
                  x2={CHART.w}
                  y1={CHART.h * f}
                  y2={CHART.h * f}
                  className={styles.gridLine}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path d={area} fill="url(#area)" className={styles.area} />
              <path d={line} pathLength={1} className={styles.line} vectorEffect="non-scaling-stroke" />
            </svg>
            <div className={styles.axis}>
              <span>30 août</span>
              <span>7 sept.</span>
              <span>14 sept.</span>
              <span>21 sept.</span>
              <span>28 sept.</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>{analytics.topicsTitle}</p>
            </div>
            <ul className={styles.topics}>
              {analytics.topics.map((t, i) => (
                <li key={t.label} style={{ "--w": t.value / topicMax, "--d": `${i * 90}ms` } as CSSProperties}>
                  <span className={styles.topicLabel}>{t.label}</span>
                  <span className={styles.topicValue}>{t.value}</span>
                  <span className={styles.bar} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  );
}
