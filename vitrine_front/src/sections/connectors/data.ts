/** Scénario de la démo des connecteurs. Données fictives. */
export const connectors = {
  /**
   * `demo` : connecteur animé (le curseur y coche `picked`, les ajoute puis les retire).
   * Les autres connecteurs sont déjà branchés : leurs fichiers `picked` sont dans la base.
   * `files` = contenu de la mini-fenêtre.
   */
  demo: "drive",
  sources: [
    {
      id: "drive",
      label: "Google Drive",
      files: ["Accord_interessement.pdf", "Grille_salaires_2026.xlsx", "CR_reunion_CSE.docx"],
      picked: [0, 2],
    },
    {
      id: "sharepoint",
      label: "SharePoint · OneDrive",
      files: ["Reglement_interieur.pdf", "Organigramme_2026.pdf", "Charte_informatique.pdf"],
      picked: [0],
    },
    {
      id: "notion",
      label: "Notion",
      files: ["Onboarding nouveaux arrivants", "FAQ paie", "Process recrutement"],
      picked: [0, 1],
    },
    {
      id: "upload",
      label: "Import de fichiers",
      files: ["Mutuelle_2026.pdf", "Note_de_service_mars.docx", "Planning_astreintes.xlsx"],
      picked: [0],
    },
  ],
};
