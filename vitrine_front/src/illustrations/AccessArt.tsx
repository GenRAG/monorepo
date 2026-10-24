import type { CSSProperties } from "react";
import { Bot, Check, FileText, Users } from "lucide-react";
import { LogoMark } from "../components/Logo";
import s from "./AccessArt.module.css";

const steps = [
  { icon: FileText, label: "Documents importés", detail: "24 fichiers" },
  { icon: Bot, label: "Assistant RH créé", detail: "Prêt à répondre" },
  { icon: Users, label: "Équipe invitée", detail: "12 personnes" },
];
const team = ["CL", "MD", "AB"];

/** Espace de travail prêt : les étapes se cochent une à une, puis l'équipe arrive. */
export function AccessArt() {
  return (
    <div className={s.scene}>
      <div className={s.card}>
        <div className={s.head}>
          <span className={s.logo}>
            <LogoMark />
          </span>
          <span className={s.title}>
            <strong>Votre espace est prêt</strong>
            <small>Acme · bêta</small>
          </span>
        </div>
        <ul className={s.steps}>
          {steps.map(({ icon: Icon, label, detail }, i) => (
            <li key={label} style={{ "--d": i } as CSSProperties}>
              <span className={s.icon}>
                <Icon size={14} strokeWidth={1.8} />
              </span>
              <span className={s.label}>
                {label}
                <small>{detail}</small>
              </span>
              <span className={s.check}>
                <Check size={11} strokeWidth={3} />
              </span>
            </li>
          ))}
        </ul>
        <div className={s.bar}>
          <span />
        </div>
      </div>

      <div className={s.team}>
        <span className={s.faces}>
          {team.map((t) => (
            <i key={t}>{t}</i>
          ))}
        </span>
        +9 collègues
      </div>
    </div>
  );
}
