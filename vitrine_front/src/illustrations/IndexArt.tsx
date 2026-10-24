import type { CSSProperties } from "react";
import { Database } from "lucide-react";
import { DocIcon, type DocKind } from "../components/ui";
import s from "./IndexArt.module.css";

/** Rang d'apparition d'un élément (délai calculé dans le CSS). */
const delay = (d: number) => ({ "--d": d }) as CSSProperties;

const files: { name: string; kind: DocKind; status: "done" | "running" }[] = [
  { name: "Convention.pdf", kind: "pdf", status: "done" },
  { name: "Tarifs_2026.xlsx", kind: "sheet", status: "done" },
  { name: "Retours_v3.docx", kind: "doc", status: "running" },
  { name: "Livret_accueil.pdf", kind: "pdf", status: "done" },
];

/** Fichiers qui affluent vers la base de l'entreprise, le long de flux animés. */
export function IndexArt() {
  return (
    <div className={s.scene}>
      <ul className={s.files}>
        {files.map((f, i) => (
          <li key={f.name} className={s.step} style={delay(i)}>
            <DocIcon kind={f.kind} size={13} />
            <span>{f.name}</span>
            <i data-status={f.status} />
          </li>
        ))}
      </ul>

      <svg className={s.lanes} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {files.map((f, i) => {
          const y = 12.5 + i * 25;
          return <path key={f.name} d={`M0 ${y} C55 ${y} 45 50 100 50`} style={delay(i)} />;
        })}
      </svg>

      <div className={s.hub}>
        <span className={s.core}>
          <Database size={26} strokeWidth={1.6} />
        </span>
        <strong>Base Entreprise</strong>
        <small>1 248 passages</small>
      </div>
    </div>
  );
}
