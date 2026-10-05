/**
 * Textes des démos reprises du site vitrine (vitrine_front/src/content.ts). Données fictives.
 */

export const reasoning = {
    eyebrow: "Recherche et raisonnement",
    title: "Il ne retrouve pas seulement. Il compare.",
    text: "Posez une question qui croise plusieurs documents. L'assistant récupère les bons passages, les confronte et rédige la synthèse : le travail de comparaison est fait pour vous.",
    points: ["Plusieurs sources par question", "Comparaison point par point", "Synthèse sourcée"],
    alt: "Démonstration : l'assistant retrouve la clause de non-concurrence dans deux documents, compare la durée, la zone géographique et la contrepartie financière, puis résume les écarts",
    question:
        "Quelle différence entre la clause de non-concurrence du contrat Dupont et celle de notre modèle actuel ?",
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
    answer: "La clause du contrat Dupont est plus contraignante que celle de votre modèle : durée doublée, zone étendue à toute la France et contrepartie plus faible.",
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
            {
                id: "guard",
                label: "Filtre de sécurité",
                description: "Bloque les questions et réponses hors périmètre",
            },
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
                {
                    name: "Tri multilingue",
                    hint: "Documents en plusieurs langues",
                    badge: "Langues",
                    perf: [86, 76, 74],
                },
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
