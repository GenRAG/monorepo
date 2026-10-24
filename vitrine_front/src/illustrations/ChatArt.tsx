import type { CSSProperties } from "react";
import { ArrowUp, Bot, Check, FileText, Users } from "lucide-react";
import s from "./ChatArt.module.css";

/** Rang d'apparition d'un message (délai calculé dans le CSS). */
const delay = (d: number) => ({ "--d": d }) as CSSProperties;

/** Conversation entre un salarié et l'assistant RH, qui s'affiche message par message. */
export function ChatArt() {
  return (
    <div className={s.scene}>
      <div className={s.window}>
        <div className={s.head}>
          <span className={s.avatar}>
            <Users size={15} strokeWidth={1.8} />
          </span>
          <span className={s.name}>
            <strong>Assistant RH</strong>
            <small>Acme</small>
          </span>
          <span className={s.online}>En ligne</span>
        </div>

        <div className={s.body}>
          <p className={`${s.user} ${s.step}`} style={delay(0)}>
            Peut-on reporter des congés sur l'année suivante ?
          </p>
          <div className={`${s.bot} ${s.step}`} style={delay(1)}>
            <span className={s.botAvatar}>
              <Bot size={13} />
            </span>
            <div>
              <p>Oui, jusqu'à 5 jours, à poser avant le 31 mars. Au-delà, ils sont perdus.</p>
              <span className={s.source}>
                <FileText size={11} />
                Accord_conges_2026.pdf · p. 4
              </span>
            </div>
          </div>
          <p className={`${s.user} ${s.step}`} style={delay(2)}>
            Et pour un temps partiel ?
          </p>
          <div className={`${s.bot} ${s.step}`} style={delay(3)}>
            <span className={s.botAvatar}>
              <Bot size={13} />
            </span>
            <span className={s.typing}>
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>

        <div className={s.input}>
          <span>Posez votre question…</span>
          <span className={s.send}>
            <ArrowUp size={13} />
          </span>
        </div>
      </div>

      <span className={`${s.badge} ${s.step}`} style={delay(1.5)}>
        <span className={s.badgeIcon}>
          <Check size={11} strokeWidth={3} />
        </span>
        Réponse sourcée
      </span>
    </div>
  );
}
