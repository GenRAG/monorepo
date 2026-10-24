import { marked } from "marked";

/**
 * Journal des mises à jour : un fichier `AAAA-MM.md` par mois dans ce dossier.
 * En-tête `date` et `tag` entre `---`, puis une section `## Titre` par nouveauté :
 * son premier paragraphe est le résumé (visible fermé), la suite le détail (markdown libre).
 */
// TODO: relire les détails (tirés du code et de l'historique du dépôt) et dater l'abonnement au jour de sa mise en production.
const files = import.meta.glob<string>("./*.md", { query: "?raw", import: "default", eager: true });

export type Change = { title: string; summary: string; details: string };
export type Entry = { date: string; tag: string; items: Change[] };

function parse(file: string, source: string): Entry {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source.replace(/\r\n/g, "\n"));
  if (!match) throw new Error(`${file} : en-tête --- manquant`);
  const meta = Object.fromEntries(
    match[1].split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
  );
  const items = match[2]
    .split(/^## /m)
    .slice(1)
    .map((section) => {
      const [title, ...body] = section.split("\n");
      const [summary = "", ...details] = body
        .join("\n")
        .trim()
        .split(/\n\s*\n/);
      return {
        title: title.trim(),
        summary: marked.parseInline(summary, { async: false }),
        details: marked.parse(details.join("\n\n"), { async: false }),
      };
    });
  if (!meta.date || !meta.tag || !items.length) throw new Error(`${file} : date, tag ou nouveautés manquants`);
  return { date: meta.date, tag: meta.tag, items };
}

/** Du mois le plus récent au plus ancien (ordre des noms de fichiers). */
export const entries = Object.entries(files)
  .sort(([a], [b]) => b.localeCompare(a))
  .map(([file, source]) => parse(file, source));
