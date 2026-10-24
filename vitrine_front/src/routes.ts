/**
 * Structure du site : adresse, titre d'onglet, description et libellé de menu de chaque page, puis la barre du haut
 * et le plan du pied de page. Les textes des pages, eux, sont écrits dans leurs composants.
 */

export const pages = {
  accueil: {
    path: "/",
    title: "GenRAG — Un assistant qui connaît vos documents",
    description:
      "GenRAG transforme les documents de votre entreprise en un assistant qui répond à votre équipe, sources à l'appui. Sans code, en quelques minutes.",
  },
  creer: {
    path: "/produit/creer",
    label: "Créer un assistant",
    title: "Créer un assistant — GenRAG",
    description: "Partez d'un modèle métier ou assemblez votre assistant bloc par bloc, sans écrire de code.",
  },
  documents: {
    path: "/produit/documents",
    label: "Vos documents",
    title: "Vos documents — GenRAG",
    description: "Importez vos fichiers ou reliez Google Drive : l'assistant répond en citant ses sources.",
  },
  deployer: {
    path: "/produit/deployer",
    label: "Partager et suivre",
    title: "Partager et suivre — GenRAG",
    description: "Publiez votre assistant pour votre équipe et suivez les questions posées.",
  },
  "cas-usage": {
    path: "/cas-usage",
    label: "Cas d'usage",
    title: "Cas d'usage — GenRAG",
    description: "Ce que GenRAG change pour les RH, le support et les équipes commerciales.",
  },
  tarifs: {
    path: "/tarifs",
    label: "Tarifs",
    title: "Tarifs — GenRAG",
    description: "Une offre Découverte pour essayer, un abonnement à 50 € HT par mois pour vos équipes.",
  },
  "mises-a-jour": {
    path: "/mises-a-jour",
    label: "Mises à jour",
    title: "Mises à jour — GenRAG",
    description: "Le journal des nouveautés de la plateforme GenRAG.",
  },
  "a-propos": {
    path: "/a-propos",
    label: "Notre histoire",
    title: "Notre histoire — GenRAG",
    description: "Comment est né GenRAG, et ce que nous construisons.",
  },
  securite: {
    path: "/securite",
    label: "Sécurité",
    title: "Sécurité — GenRAG",
    description: "Comment GenRAG traite vos documents et vos données.",
  },
  contact: {
    path: "/contact",
    label: "Contact",
    title: "Demander un accès — GenRAG",
    description: "Laissez-nous vos coordonnées pour obtenir un accès à GenRAG.",
  },
} as const;

export type PageId = keyof typeof pages;

/** Barre du haut : un lien direct ou un menu déroulant. */
export const menu: ({ label: string; page: PageId } | { label: string; items: PageId[] })[] = [
  { label: "Produit", items: ["creer", "documents", "deployer", "cas-usage"] },
  { label: "Tarifs", page: "tarifs" },
  { label: "Ressources", items: ["mises-a-jour", "a-propos", "securite"] },
];

export const footerNav = {
  columns: [
    { title: "Produit", items: ["creer", "documents", "deployer", "cas-usage"] as PageId[] },
    { title: "Offre", items: ["tarifs", "contact"] as PageId[] },
    { title: "Ressources", items: ["mises-a-jour", "a-propos", "securite"] as PageId[] },
  ],
};
