import styles from "./Ribbon.module.css";

const LINES = 28;

type Pt = [number, number];

/** Une courbe en S qui traverse le cadre ; `t` (0 → 1) la décale d'un bord du ruban à l'autre. */
const points = (t: number): [Pt, Pt, Pt, Pt] => {
  const x = (a: number, b: number) => a + (b - a) * t;
  return [
    [x(420, 820), -80],
    [x(960, 1080), 220],
    [x(-120, 240), 540],
    [x(260, 780), 1080],
  ];
};

const f = ([x, y]: Pt) => `${x.toFixed(1)} ${y}`;
const curve = (t: number) => {
  const [p0, c1, c2, p3] = points(t);
  return `M ${f(p0)} C ${f(c1)}, ${f(c2)}, ${f(p3)}`;
};

// Surface du ruban : le bord gauche à l'aller, le bord droit au retour.
const [a0, a1, a2, a3] = points(0);
const [b0, b1, b2, b3] = points(1);
const surface = `M ${f(a0)} C ${f(a1)}, ${f(a2)}, ${f(a3)} L ${f(b3)} C ${f(b2)}, ${f(b1)}, ${f(b0)} Z`;

const lines = Array.from({ length: LINES }, (_, i) => {
  const t = i / (LINES - 1);
  // Les lignes s'estompent vers les bords : le ruban a un relief, sans cassure.
  return { d: curve(t), opacity: 0.25 + 0.75 * Math.sin(t * Math.PI) };
});

/** Ruban en dégradé (vert → violet) : la signature visuelle de l'accueil. */
export function Ribbon() {
  return (
    <svg className={styles.ribbon} viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="ribbon-stroke" gradientUnits="userSpaceOnUse" x1="200" y1="0" x2="700" y2="1000">
          <stop offset="0" className={styles.stopA} />
          <stop offset="0.45" className={styles.stopB} />
          <stop offset="0.75" className={styles.stopC} />
          <stop offset="1" className={styles.stopD} />
        </linearGradient>
      </defs>
      <g className={styles.wave}>
        <path className={styles.surface} d={surface} fill="url(#ribbon-stroke)" />
        {lines.map((line, i) => (
          <path
            key={i}
            className={styles.line}
            d={line.d}
            pathLength={1}
            stroke="url(#ribbon-stroke)"
            style={{ "--i": i, "--o": line.opacity } as React.CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}
