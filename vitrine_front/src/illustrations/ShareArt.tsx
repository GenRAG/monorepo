import type { CSSProperties } from "react";
import { ArrowUp, Bot, Link2, Users } from "lucide-react";
import s from "./ShareArt.module.css";

/** Rang d'apparition d'un élément (délai calculé dans le CSS). */
const delay = (d: number) => ({ "--d": d }) as CSSProperties;

const week = [38, 52, 47, 66, 58, 12, 9];
const max = Math.max(...week);
const total = week.reduce((n, q) => n + q, 0);

/** L'assistant publié, ouvert sur le téléphone d'un collègue : le lien qui circule, les questions qui arrivent. */
export function ShareArt() {
  return (
    <div className={s.scene}>
      <div className={s.phone}>
        <span className={s.notch} />
        <div className={s.appHead}>
          <span className={s.avatar}>
            <Users size={13} strokeWidth={1.9} />
          </span>
          <strong>Assistant RH</strong>
        </div>
        <div className={s.body}>
          <p className={`${s.user} ${s.step}`} style={delay(0)}>
            Comment poser un jour de télétravail ?
          </p>
          <div className={`${s.bot} ${s.step}`} style={delay(1)}>
            <span className={s.botIcon}>
              <Bot size={11} />
            </span>
            <p>Depuis l'outil RH, onglet Absences, au moins 48 h avant.</p>
          </div>
        </div>
        <div className={s.input}>
          Posez votre question…
          <span>
            <ArrowUp size={11} />
          </span>
        </div>
      </div>

      <span className={`${s.link} ${s.step}`} style={delay(0.5)}>
        <span className={s.linkIcon}>
          <Link2 size={13} strokeWidth={2} />
        </span>
        genrag.app/c/acme-rh
        <b>Copié</b>
      </span>

      <div className={`${s.stats} ${s.step}`} style={delay(3)}>
        <span className={s.label}>Cette semaine</span>
        <strong>{total} questions</strong>
        <span className={s.bars}>
          {week.map((q, i) => (
            <i key={i} style={{ height: `${(q / max) * 100}%`, ...delay(i) }} />
          ))}
        </span>
      </div>
    </div>
  );
}
