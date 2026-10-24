/** Scénario de la démo de comparaison de sources. Données fictives. */
export const reasoning = {
  alt: "Démonstration : l'assistant retrouve la clause de non-concurrence dans deux documents, compare la durée, la zone géographique et la contrepartie financière, puis résume les écarts",
  question: "Quelle différence entre la clause de non-concurrence du contrat Dupont et celle de notre modèle actuel ?",
  /** Étapes de réflexion affichées avant la réponse : `label` pendant, `done` une fois terminée. */
  trace: [
    { label: "Recherche dans vos documents", done: "2 passages trouvés" },
    { label: "Comparaison des deux clauses", done: "3 écarts relevés" },
  ],
  sources: [
    { label: "Contrat Dupont", name: "Contrat_Dupont.pdf", ref: "Art. 9", kind: "pdf" },
    { label: "Modèle actuel", name: "Modele_contrat_2026.docx", ref: "Art. 11", kind: "doc" },
  ],
  criterion: "Critère",
  /** `values` suit l'ordre de `sources`. */
  rows: [
    { label: "Durée", values: ["24 mois", "12 mois"] },
    { label: "Zone géographique", values: ["France entière", "Île-de-France"] },
    { label: "Contrepartie financière", values: ["30 % du salaire", "50 % du salaire"] },
  ],
  answer:
    "La clause du contrat Dupont est plus contraignante que celle de votre modèle : durée doublée, zone étendue à toute la France et contrepartie plus faible.",
};
