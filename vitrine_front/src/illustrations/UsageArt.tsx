import type { CSSProperties } from "react";
import { Briefcase, Calculator, Users } from "lucide-react";
import s from "./UsageArt.module.css";

const QUOTA = 50_000;
const assistants = [
  { name: "RH", icon: Users, credits: 13_180, color: "var(--violet-500)" },
  { name: "Commercial", icon: Briefcase, credits: 9_420, color: "var(--green-400)" },
  { name: "Finance", icon: Calculator, credits: 8_640, color: "var(--violet-300)" },
];
const used = assistants.reduce((sum, a) => sum + a.credits, 0);
const fmt = (n: number) => n.toLocaleString("fr-FR");
// Anneau : circonférence d'un cercle de rayon 84, un petit vide entre deux segments
const RING = 2 * Math.PI * 84;
const GAP = 6;
const segments = assistants.map((a, i) => {
  const start = assistants.slice(0, i).reduce((n, b) => n + b.credits, 0);
  return { ...a, length: (a.credits / QUOTA) * RING - GAP, offset: -(start / QUOTA) * RING };
});

/** Quota du mois en anneau, un segment par assistant, le reste disponible. */
export function UsageArt() {
  return (
    <div className={s.scene}>
      <div className={s.ringWrap}>
        <svg viewBox="0 0 200 200" className={s.ring} aria-hidden>
          <circle cx="100" cy="100" r="84" className={s.track} />
          {segments.map((seg, i) => (
            <circle
              key={seg.name}
              cx="100"
              cy="100"
              r="84"
              className={s.segment}
              stroke={seg.color}
              style={{ "--len": seg.length, "--ring": RING, "--offset": seg.offset, "--d": i } as CSSProperties}
            />
          ))}
        </svg>
        <div className={s.center}>
          <span className={s.label}>Restants ce mois</span>
          <strong>{fmt(QUOTA - used)}</strong>
          <span className={s.sub}>sur {fmt(QUOTA)} crédits</span>
        </div>
        <span className={s.token}>−32</span>
      </div>

      <ul className={s.legend}>
        {assistants.map(({ name, icon: Icon, credits, color }) => (
          <li key={name} style={{ "--c": color } as CSSProperties}>
            <Icon size={13} strokeWidth={1.9} />
            {name}
            <b>{fmt(credits)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
