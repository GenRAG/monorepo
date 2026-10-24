/** Scénario de la démo de l'éditeur. Données fictives. */
export const builder = {
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
      heading: "Comment la question est-elle améliorée ?",
      steps: ["Analyse de la question", "Reformulation", "Meilleure récupération"],
      original: "C'est quoi les prix ?",
      vague: "prix",
      rewritten: "Quels sont les tarifs et grilles tarifaires de chaque offre ?",
      tags: { intent: "Intention · Tarifs", low: "Précision · faible", high: "Précision · élevée" },
      scores: { before: 34, after: 91, beforeLabel: "Avant", afterLabel: "Après" },
    },
    rank: {
      query: "Class",
      description: "Trie les résultats par ordre de pertinence pour améliorer la réponse",
      heading: "Comment la pertinence est-elle améliorée ?",
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
