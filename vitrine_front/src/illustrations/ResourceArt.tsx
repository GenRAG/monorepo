import type { CSSProperties } from "react";
import { Clock, FolderLock, KeyRound, Lock, Sparkles, UsersRound } from "lucide-react";
import type { Entry } from "../pages/updates/entries";
import s from "./ResourceArt.module.css";

/** Rang d'apparition d'un élément (délai calculé dans le CSS). */
const delay = (d: number) => ({ "--d": d }) as CSSProperties;

/** Les derniers mois du journal en fiches empilées, la plus récente au-dessus. */
export function UpdatesArt({ entries }: { entries: Entry[] }) {
  const [latest, ...older] = entries.slice(0, 3);
  return (
    <div className={s.deck}>
      {older.reverse().map((e, i) => (
        <div key={e.date} className={s.sheet} data-depth={older.length - i}>
          <span className={s.sheetDate}>{e.date}</span>
          <p>{e.items[0].title}</p>
        </div>
      ))}
      <div className={`${s.sheet} ${s.front}`}>
        <div className={s.frontHead}>
          <span className={s.spark}>
            <Sparkles size={14} strokeWidth={2} />
          </span>
          <span className={s.sheetDate}>{latest.date}</span>
          <span className={s.count}>{latest.items.length} nouveautés</span>
        </div>
        <strong>{latest.items[0].title}</strong>
        <p dangerouslySetInnerHTML={{ __html: latest.items[0].summary }} />
        <ul>
          {latest.items.slice(1, 4).map((item, i) => (
            <li key={item.title} className={s.step} style={delay(i)}>
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Positions des jalons sur la courbe (en % de la scène), du plus ancien au plus récent
const points = [
  { x: 8, y: 86 },
  { x: 36, y: 66 },
  { x: 64, y: 44 },
  { x: 90, y: 16 },
];

/** Le parcours comme une courbe qui monte, un jalon par chapitre. */
export function StoryArt({ chapters }: { chapters: { date: string; title: string }[] }) {
  return (
    <div className={s.path}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="story-path" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--green-400)" />
            <stop offset="100%" stopColor="var(--violet-500)" />
          </linearGradient>
        </defs>
        <path d="M0 96 C20 90 26 72 36 66 S54 52 64 44 S82 24 100 6" className={s.trail} />
        <path d="M0 96 C20 90 26 72 36 66 S54 52 64 44 S82 24 100 6" stroke="url(#story-path)" className={s.line} />
      </svg>
      {chapters.slice(0, points.length).map((c, i) => (
        <div
          key={c.title}
          className={`${s.milestone} ${s.step}`}
          data-now={i === chapters.length - 1 || undefined}
          style={{ left: `${points[i].x}%`, top: `${points[i].y}%`, ...delay(i) }}
        >
          <span className={s.dot} />
          <span className={s.tagline}>
            <small>{c.date}</small>
            {c.title}
          </span>
        </div>
      ))}
    </div>
  );
}

// Ce que la page Sécurité décrit, du plus large (l'espace) au plus fin (la conservation)
const layers = [
  { icon: FolderLock, label: "Espace propre à l'entreprise", at: "top" },
  { icon: UsersRound, label: "Accès choisis", at: "left" },
  { icon: KeyRound, label: "Drive : accès non conservé", at: "right" },
  { icon: Clock, label: "Questions gardées 90 jours", at: "bottom" },
];

/** Vos documents au centre, entourés des protections décrites sur la page. */
export function SecurityArt() {
  return (
    <div className={s.orbit}>
      <span className={s.ring} data-ring="3" />
      <span className={s.ring} data-ring="2" />
      <span className={s.ring} data-ring="1" />
      <span className={s.lock}>
        <Lock size={28} strokeWidth={1.7} />
      </span>
      {layers.map(({ icon: Icon, label, at }, i) => (
        <span key={label} className={`${s.badge} ${s.step}`} data-at={at} style={delay(i)}>
          <Icon size={13} strokeWidth={2} />
          {label}
        </span>
      ))}
    </div>
  );
}
