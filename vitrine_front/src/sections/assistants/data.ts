/** Assistants métier présentés par la section. Données fictives. */
export const assistants = {
  items: [
    {
      id: "commercial",
      label: "Commercial",
      description: "Offres, tarifs, argumentaires, conditions de vente.",
      question: "Quelle remise peut-on accorder pour 50 licences sur l'offre Pro ?",
      answer: "Jusqu'à 12 % sans validation. Au-delà, la demande doit être validée par la direction commerciale.",
      sources: ["Grille_tarifaire_2026.xlsx", "Process_remises.pdf"],
      skills: [
        "Retrouve tarifs, remises et conditions de vente",
        "Résume une offre ou un contrat client",
        "Cite toujours la bonne version du document",
      ],
    },
    {
      id: "rh",
      label: "RH",
      description: "Accords, congés, télétravail, accueil des nouveaux arrivants.",
      question: "Combien de jours de télétravail par semaine sont autorisés ?",
      answer: "Deux jours par semaine maximum, à fixer avec votre responsable. Les jours non pris ne se reportent pas.",
      sources: ["Accord_teletravail.pdf"],
      skills: [
        "Répond sur les congés, absences et télétravail",
        "Accompagne l'arrivée des nouveaux salariés",
        "S'appuie sur vos accords et votre livret d'accueil",
      ],
    },
    {
      id: "finance",
      label: "Finance",
      description: "Notes de frais, budgets, délais de paiement, procédures.",
      question: "Quel est le plafond d'une note de frais pour un repas ?",
      answer: "25 € par repas lors d'un déplacement, sur justificatif. Les repas d'affaires suivent une règle à part.",
      sources: ["Politique_frais.docx", "FAQ_comptabilite.pdf"],
      skills: [
        "Explique les règles de notes de frais",
        "Retrouve délais de paiement et procédures",
        "Indique la politique interne applicable",
      ],
    },
    {
      id: "admin",
      label: "Administration",
      description: "Contrats fournisseurs, locaux, équipements, échéances.",
      question: "Quand expire le contrat de maintenance des copieurs ?",
      answer: "Le 31 mars. Le préavis de résiliation est de trois mois, soit avant le 31 décembre.",
      sources: ["Contrats_fournisseurs.xlsx"],
      skills: [
        "Suit les contrats fournisseurs et leurs échéances",
        "Renseigne sur les locaux et les équipements",
        "Oriente vers le bon interlocuteur",
      ],
    },
    {
      id: "marketing",
      label: "Marketing",
      description: "Charte graphique, messages clés, calendrier éditorial.",
      question: "Quel ton adopter sur nos publications LinkedIn ?",
      answer: "Un ton direct et chaleureux, avec vouvoiement. Pas plus de trois emojis par publication.",
      sources: ["Charte_editoriale_v3.pdf"],
      skills: [
        "Rappelle la charte graphique et le ton",
        "Retrouve les messages clés par offre",
        "Aide à préparer vos publications",
      ],
    },
  ],
};
