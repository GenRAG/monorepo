import { Briefcase, Headphones, Users } from "lucide-react";

/** Cas d'usage, partagés par la page Cas d'usage et la liste de l'accueil. `id` = ancre de la section. */
export const useCases = [
  {
    id: "rh",
    team: "Ressources humaines",
    assistant: "Assistant RH",
    icon: Users,
    tone: "violet",
    pitch:
      "Les questions sur les congés, la mutuelle ou les notes de frais arrivent tous les jours. L'assistant y répond à partir du règlement et de la convention.",
    documents: ["Règlement intérieur", "Convention collective", "Livret d'accueil"],
    question: "Combien de jours de congé pour un mariage ?",
    answer: "4 jours ouvrés pour votre propre mariage ou PACS, à poser dans le mois qui suit l'événement.",
    source: "Convention collective, article 28",
  },
  {
    id: "support",
    team: "Support client",
    assistant: "Assistant Support",
    icon: Headphones,
    tone: "green",
    pitch:
      "Les conseillers trouvent la procédure en quelques secondes, avec le lien vers la fiche, au lieu de fouiller la base documentaire.",
    documents: ["Fiches produit", "Procédures de retour", "Conditions générales"],
    question: "Un client peut-il retourner un produit ouvert ?",
    answer: "Oui, sous 14 jours, s'il est complet et dans son emballage. Le remboursement suit la réception du colis.",
    source: "Procédure de retour v3, étape 2",
  },
  {
    id: "commercial",
    team: "Équipes commerciales",
    assistant: "Assistant Commercial",
    icon: Briefcase,
    tone: "mix",
    pitch: "Tarifs, remises, clauses de contrat : la bonne version, tout de suite, même en rendez-vous client.",
    documents: ["Grille tarifaire", "Contrats cadres", "Plaquettes"],
    question: "Quelle remise maximale pour un contrat de 3 ans ?",
    answer: "12 % sur le tarif public, à valider par la direction commerciale au-delà de 8 %.",
    source: "Grille tarifaire 2026, onglet Remises",
  },
];
