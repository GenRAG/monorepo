/**
 * Tous les textes du site. Modifier ici, pas dans les composants.
 * Les données affichées dans les maquettes (Acme, chiffres, noms de fichiers) sont fictives.
 */

export const site = {
  name: "GenRAG",
  primaryCta: "Demander un accès",
  secondaryCta: "Voir comment ça marche",
  demoLabel: "Données de démonstration",
};

/**
 * Ordre des sections = ordre de la navigation latérale.
 * `short` : libellé affiché dans la barre du haut (absent = section non listée dans la barre).
 */
export const nav = [
  { id: "accueil", label: "Accueil" },
  { id: "constat", label: "Le constat", short: "Constat" },
  { id: "etapes", label: "Comment ça marche", short: "Étapes" },
  { id: "assistants", label: "Assistants métier", short: "Assistants" },
  { id: "editeur", label: "Éditeur", short: "Éditeur" },
  { id: "connecteurs", label: "Vos documents", short: "Documents" },
  { id: "raisonnement", label: "Recherche et raisonnement", short: "Analyse" },
  { id: "partage", label: "Partage", short: "Partage" },
  { id: "suivi", label: "Suivi", short: "Suivi" },
  { id: "pourquoi", label: "Pourquoi GenRAG", short: "Pourquoi" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof nav)[number]["id"];

export const hero = {
  eyebrow: "Assistant IA pour les équipes",
  title: "Vos documents éparpillés, enfin connectés.",
  subtitle:
    "GenRAG transforme vos documents en un assistant qui répond à votre équipe, sources à l'appui. Sans une ligne de code.",
  floatingDocs: [
    { name: "Contrat_cadre.pdf", kind: "pdf" },
    { name: "Tarifs_2026.xlsx", kind: "sheet" },
    { name: "Livret_accueil.docx", kind: "doc" },
    { name: "RE: Relance fournisseur", kind: "mail" },
    { name: "Procédures qualité", kind: "folder" },
    { name: "Notes_de_frais.pdf", kind: "pdf" },
  ],
  coreLabel: "Base de connaissances",
};

export const problem = {
  eyebrow: "Le constat",
  title: "L'information existe. Personne ne la trouve.",
  text: "Un contrat sur le Drive, une procédure dans un PDF, des tarifs dans un Excel, la réponse dans un mail. Chaque question devient une chasse au fichier.",
  search: "contrat durand préavis",
  resultsLabel: "résultats",
  results: [
    { name: "Contrat_Durand_v2.docx", where: "Drive › Commercial › 2024", kind: "doc" },
    { name: "Contrat_Durand_v2_FINAL.docx", where: "Bureau", kind: "doc" },
    { name: "Contrat_Durand_v3_signé.pdf", where: "Téléchargements", kind: "pdf" },
    { name: "RE: RE: TR: contrat Durand", where: "Boîte mail", kind: "mail" },
    { name: "Suivi_clients.xlsx", where: "Drive › Direction", kind: "sheet" },
  ],
  footnote: "Laquelle est la bonne version ?",
};

export const steps = {
  eyebrow: "Comment ça marche",
  title: "Trois étapes. Aucune compétence technique.",
  items: [
    {
      title: "Connectez vos documents",
      text: "Importez vos fichiers ou reliez vos espaces de stockage.",
    },
    {
      title: "Choisissez votre assistant",
      text: "Partez d'un modèle métier ou assemblez le vôtre, bloc par bloc.",
    },
    {
      title: "Partagez-le à votre équipe",
      text: "Chacun pose ses questions et obtient une réponse sourcée.",
    },
  ],
};

export const assistants = {
  eyebrow: "Assistants métier",
  title: "Un assistant prêt pour chaque service.",
  text: "Démarrez avec un modèle adapté à votre métier, puis ajustez-le à votre façon de travailler.",
  chatTitle: "Assistant",
  inputPlaceholder: "Posez votre question…",
  sourcesLabel: "Sources",
  discover: "Découvrez l'assistant",
  editable: "Modifiable après import",
  more: "Et tout ce que contiennent vos documents.",
  pause: "Mettre en pause le défilement",
  play: "Reprendre le défilement",
  items: [
    {
      id: "commercial",
      label: "Commercial",
      description: "Offres, tarifs, argumentaires, conditions de vente.",
      question: "Quelle remise peut-on accorder pour 50 licences sur l'offre Pro ?",
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
      question: "Combien de jours de télétravail par semaine sont autorisés ?",
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
      question: "Quel est le plafond d'une note de frais pour un repas ?",
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
      question: "Quand expire le contrat de maintenance des copieurs ?",
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
      question: "Quel ton adopter sur nos publications LinkedIn ?",
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

export const connectors = {
  eyebrow: "Vos documents",
  title: "Vos outils restent les mêmes.",
  text: "Reliez vos espaces de stockage ou importez vos fichiers. Quand un document change, l'assistant est à jour.",
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
  picker: {
    hint: "Choisissez les fichiers à synchroniser",
    add: "Ajouter",
    save: "Enregistrer",
  },
  pause: "Mettre en pause l'animation",
  play: "Reprendre l'animation",
  base: {
    title: "Base de connaissances",
    subtitle: "Acme · Assistant RH",
    sync: "Synchronisé il y a 2 min",
    indexed: "Indexé",
    pending: "En cours",
  },
};

export const reasoning = {
  eyebrow: "Recherche et raisonnement",
  title: "Il ne retrouve pas seulement. Il compare.",
  text: "Posez une question qui croise plusieurs documents. L'assistant récupère les bons passages, les confronte et rédige la synthèse : le travail de comparaison est fait pour vous.",
  points: ["Plusieurs sources par question", "Comparaison point par point", "Synthèse sourcée"],
  alt: "Démonstration : l'assistant retrouve la clause de non-concurrence dans deux documents, compare la durée, la zone géographique et la contrepartie financière, puis résume les écarts",
  question: "Quelle différence entre la clause de non-concurrence du contrat Dupont et celle de notre modèle actuel ?",
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
    "La clause du contrat Dupont est plus contraignante que celle de votre modèle : durée doublée, zone étendue à toute la France et contrepartie plus faible.",
  pause: "Mettre en pause l'animation",
  play: "Reprendre l'animation",
};

export const builder = {
  eyebrow: "Éditeur sans code",
  title: "Construisez votre assistant comme un schéma.",
  /** Mot de liaison avec la section précédente (« Un assistant prêt pour chaque service »). */
  bridge: "ou",
  text: "Vous voulez plus de contrôle ? Reliez des blocs entre eux. Chaque étape est visible, chaque réglage à portée de clic.",
  sidebar: {
    agent: "Assistant RH",
    groups: [
      { label: "Développement", items: ["Test & chat", "Documents", "Architecture"] },
      { label: "Production", items: ["Analytics", "Déploiement"] },
    ],
    active: "Architecture",
  },
  nodes: {
    question: "Question",
    rewrite: "Reformulation",
    search: "Recherche",
    rank: "Classement",
    answer: "Réponse",
    model: "Modèle d'IA",
    modelHint: "Cliquer pour modifier",
    instruction: "Instruction",
    instructionText: "Réponds de façon concise et cite toujours tes sources.",
    start: "Départ",
    end: "Fin",
    input: "Entrée",
    output: "Sortie",
    modelRow: "Modèle IA",
    instructionRow: "Instruction",
    rewriteRow: "Modèle de reformulation",
    rankRow: "Modèle de tri",
  },
  models: { answer: "Précis · rédaction" },
  url: "studio.genrag.app/acme/assistant-rh/architecture",
  modelPlaceholder: "Choisir un modèle",
  pause: "Mettre en pause l'animation",
  play: "Reprendre l'animation",
  palette: {
    search: "Chercher des blocs…",
    available: "Disponibles",
    used: "Déjà dans le workflow",
    usedTag: "Utilisé",
    hints: [
      { keys: ["↑", "↓"], label: "naviguer" },
      { keys: ["↵"], label: "ajouter" },
      { keys: ["⌘", "K"], label: "fermer" },
    ],
    /** Blocs affichés dans la palette pour montrer le catalogue ; la démo ne les ajoute pas. */
    extraBlocks: [
      { id: "web", label: "Recherche web", description: "Complète vos documents avec des résultats du web" },
      { id: "memory", label: "Mémoire", description: "Garde le contexte des échanges précédents" },
      { id: "guard", label: "Filtre de sécurité", description: "Bloque les questions et réponses hors périmètre" },
      { id: "translate", label: "Traduction", description: "Répond dans la langue de l'utilisateur" },
      { id: "summary", label: "Synthèse", description: "Résume les passages trouvés avant la réponse" },
    ],
    usedBlocks: [
      { id: "answer", description: "Génère la réponse finale à partir des documents trouvés" },
      { id: "search", description: "Recherche les passages pertinents dans vos documents" },
      { id: "question", description: "La question posée à votre assistant" },
    ],
  },
  panel: { overview: "Aperçu", settings: "Paramètres" },
  /** Blocs ajoutés par la démo, dans l'ordre. `query` est tapé dans la palette. */
  blocks: {
    rewrite: {
      query: "Refo",
      description: "Reformule la question pour améliorer la recherche dans vos documents",
      heading: "Comment la question est-elle améliorée ?",
      steps: ["Analyse de la question", "Reformulation", "Meilleure récupération"],
      original: "C'est quoi les prix ?",
      vague: "prix",
      rewritten: "Quels sont les tarifs et grilles tarifaires de chaque offre ?",
      tags: { intent: "Intention · Tarifs", low: "Précision · faible", high: "Précision · élevée" },
      scores: { before: 34, after: 91, beforeLabel: "Avant", afterLabel: "Après" },
    },
    rank: {
      query: "Class",
      description: "Trie les résultats par ordre de pertinence pour améliorer la réponse",
      heading: "Comment la pertinence est-elle améliorée ?",
      steps: ["Évaluation de la pertinence", "Réorganisation", "Résultats optimisés"],
      results: [
        { name: "faq_produit.txt", sim: 0.82, score: 0.41 },
        { name: "Livret_accueil.docx · §3", sim: 0.79, score: 0.94 },
        { name: "onboarding.pdf", sim: 0.77, score: 0.23 },
        { name: "Livret_accueil.docx · §5", sim: 0.74, score: 0.87 },
      ],
      dropped: "écarté",
    },
  },
  picker: {
    title: "Modèle IA",
    subtitle: "Comparez et sélectionnez un modèle pour votre bloc.",
    search: "Rechercher…",
    select: "Sélectionner",
    perf: "Benchmark",
    axes: ["Qualité", "Vitesse", "Économie"],
  },
  /** Catalogue illustratif du sélecteur. `pick` = modèle choisi par le curseur, `browse` = modèles survolés avant. */
  catalog: {
    rewrite: {
      pick: 1,
      browse: [0, 2],
      models: [
        { name: "Précis · raisonnement", hint: "Questions complexes", badge: "Premium", perf: [94, 58, 42] },
        { name: "Rapide · économique", hint: "Idéal pour reformuler", badge: "Économique", perf: [76, 92, 95] },
        { name: "Équilibré", hint: "Polyvalent", badge: "Équilibré", perf: [85, 78, 70] },
        { name: "Multilingue", hint: "Plus de 30 langues", badge: "Langues", perf: [82, 74, 72] },
        { name: "Open source", hint: "Hébergé en Europe", badge: "Souverain", perf: [74, 80, 88] },
      ],
    },
    rank: {
      pick: 0,
      browse: [2, 1],
      models: [
        { name: "Tri de pertinence", hint: "Recommandé", badge: "Précis", perf: [93, 80, 72] },
        { name: "Tri multilingue", hint: "Documents en plusieurs langues", badge: "Langues", perf: [86, 76, 74] },
        { name: "Tri rapide", hint: "Grands volumes", badge: "Rapide", perf: [78, 95, 86] },
        { name: "Tri open source", hint: "Hébergé en Europe", badge: "Souverain", perf: [81, 84, 93] },
      ],
    },
  },
};

export const share = {
  eyebrow: "Déploiement",
  title: "En ligne en un clic, à vos couleurs.",
  text: "Choisissez une adresse et les couleurs de votre entreprise, puis déployez. Votre équipe utilise l'assistant dans la minute, sans rien installer.",
  points: ["Déployé en un clic", "Sous-domaine dédié", "Couleurs de votre entreprise"],
  url: "acme-rh.genrag.app",
  subdomain: "acme-rh",
  domain: ".genrag.app",
  setup: {
    url: "studio.genrag.app/acme/assistant-rh/deploiement",
    title: "Déployer l'assistant",
    subtitle: "Assistant RH · version 3",
    address: "Adresse",
    color: "Couleur",
    deploy: "Déployer",
    deploying: "Déploiement…",
    steps: ["Assistant publié", "Certificat HTTPS activé", "Couleurs appliquées"],
  },
  inputPlaceholder: "Votre question…",
  online: "En ligne",
  company: "Acme",
  assistantName: "Assistant RH",
  welcome: "Bonjour Camille, que puis-je faire pour vous ?",
  question: "Comment poser un jour de congé ?",
  answer: "Depuis l'espace salarié, rubrique « Absences ». Votre responsable valide sous 48 h.",
  source: "Livret_accueil.docx",
  colorLabel: "Couleur de l'entreprise",
  pause: "Mettre en pause l'animation",
  play: "Reprendre l'animation",
  colors: [
    { name: "Menthe", value: "#34D3A9", ink: "#0B0E11" },
    { name: "Bleu", value: "#3B6FE0", ink: "#FFFFFF" },
    { name: "Corail", value: "#E8603C", ink: "#FFFFFF" },
    { name: "Prune", value: "#8E3F7E", ink: "#FFFFFF" },
  ],
};

export const analytics = {
  eyebrow: "Suivi",
  title: "Sachez ce que votre équipe demande.",
  text: "Volume de questions, sujets fréquents, temps de réponse et crédits consommés, assistant par assistant.",
  kpis: [
    { label: "Questions ce mois", value: 1284, format: "int" },
    { label: "Temps de réponse moyen", value: 2.1, format: "sec" },
    { label: "Crédits consommés ce mois", value: 1284, format: "credits" },
  ],
  creditUnit: "crédits",
  chartTitle: "Volume de questions",
  chartPeriod: "30 derniers jours",
  topicsTitle: "Questions fréquentes",
  topics: [
    { label: "Télétravail", value: 142 },
    { label: "Congés", value: 118 },
    { label: "Notes de frais", value: 87 },
    { label: "Mutuelle", value: 61 },
    { label: "Tickets restaurant", value: 44 },
  ],
  // 30 points fictifs
  series: [
    18, 22, 20, 26, 31, 12, 9, 34, 38, 36, 41, 44, 15, 11, 40, 46, 43, 49, 52, 19, 14, 47, 55, 51, 58, 61, 22, 17, 57,
    64,
  ],
};

export const why = {
  eyebrow: "Pourquoi GenRAG",
  title: "Pensé pour les équipes sans service informatique.",
  items: [
    {
      title: "Sans code",
      text: "Tout se fait à la souris : importer, assembler, publier. Aucune compétence technique requise.",
    },
    {
      title: "Des réponses sourcées",
      text: "Chaque réponse s'appuie sur vos documents et indique d'où elle vient. Vous vérifiez en un clic.",
    },
    {
      title: "Vous gardez la main",
      text: "Vous choisissez les documents, les réglages et qui a accès à chaque assistant.",
    },
  ],
  // TODO: section sécurité / conformité / RGPD à rédiger et faire valider (hébergement, sous-traitants,
  // durée de conservation). Ne rien affirmer sur le site tant que ce n'est pas validé.
};

export const contact = {
  eyebrow: "Accès anticipé",
  title: "Donnez à votre équipe un assistant qui connaît vos documents.",
  text: "Laissez-nous vos coordonnées. Nous revenons vers vous pour organiser un accès.",
  fields: {
    email: "Email professionnel",
    company: "Entreprise",
    role: "Votre rôle",
    optional: "facultatif",
  },
  submit: "Demander un accès",
  sending: "Envoi…",
  success: "Merci, votre demande est bien arrivée. Nous vous recontactons rapidement.",
  error: "L'envoi a échoué. Réessayez dans un instant.",
  notConfigured: "Formulaire non configuré (VITE_CONTACT_ENDPOINT manquant).",
  invalidEmail: "Indiquez une adresse email valide.",
  requiredCompany: "Indiquez le nom de votre entreprise.",
};

export const footer = {
  tagline: "Des assistants qui connaissent vos documents.",
  // TODO: compléter les liens légaux (mentions légales, confidentialité) et l'email de contact.
  links: [] as { label: string; href: string }[],
  copyright: `© ${new Date().getFullYear()} GenRAG`,
};
