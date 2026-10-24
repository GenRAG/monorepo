import type { CSSProperties } from "react";
import { Database, FileText } from "lucide-react";
import { useCases } from "../pages/cases";
import s from "./TeamsArt.module.css";

/** Rang d'apparition d'un élément (délai calculé dans le CSS). */
const delay = (d: number) => ({ "--d": d }) as CSSProperties;
const docCount = useCases.reduce((n, c) => n + c.documents.length, 0);

/** Une base de documents commune, interrogée par l'assistant de chaque équipe. */
export function TeamsArt() {
  return (
    <div className={s.scene}>
      <div className={s.hub}>
        <div className={s.head}>
          <span className={s.hubIcon}>
            <Database size={14} strokeWidth={1.9} />
          </span>
          <strong>Vos documents</strong>
          <span className={s.pill}>{docCount} documents</span>
        </div>
        <ul className={s.rows}>
          {useCases.map((c, i) => (
            <li key={c.id} data-tone={c.tone} className={s.step} style={delay(i)}>
              <FileText size={13} strokeWidth={1.9} />
              <span>{c.documents[0]}</span>
              <small>{c.team}</small>
            </li>
          ))}
        </ul>
      </div>

      {useCases.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={c.id} className={`${s.team} ${s.step}`} data-tone={c.tone} data-pos={i} style={delay(1.5 + i)}>
            <span className={s.teamIcon}>
              <Icon size={14} strokeWidth={1.9} />
            </span>
            <span className={s.teamText}>
              <strong>{c.assistant}</strong>
              <small>{c.question}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
