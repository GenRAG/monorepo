# Audit ponytail — `plateform_front/` (origin/dev, 904c1d3)

**What this repo does:** `plateform_front` est l'application web de GenRAG. Une entreprise s'y inscrit, crée ses agents RAG (des chatbots qui répondent à partir de ses documents), les règle dans un éditeur de workflow, importe ses documents, teste l'agent dans un « bac à sable », le déploie, puis ses utilisateurs finaux discutent avec lui dans l'écran « Assistant ». Toutes les données viennent de `plateform_back` par RTK Query (une couche de cache des requêtes HTTP) ; les réponses de l'IA arrivent en SSE (un flux d'événements que le serveur pousse au navigateur).
Charge supposée : un SaaS B2B en bêta, quelques dizaines d'entreprises, un workspace par utilisateur, sans rôles, et des utilisateurs finaux qui gardent l'onglet ouvert longtemps et posent plusieurs questions d'affilée. Côté front, la « charge » à surveiller, c'est la durée de vie d'un onglet (sessions de 7 jours, plusieurs onglets) et les flux SSE qui tournent en parallèle.

Statut par rapport à l'audit précédent (`AUDIT_REPORT.md`) : F-01, F-02, F-03, F-04, F-05, F-06, F-14, F-17, F-21 et F-22 sont corrigés. F-16 est corrigé pour `User` (le back renvoie bien `hasPassword` / `isEmailVerified` depuis #92) ; il ne reste que `CurrentDeployment.activeWorkflow.{version,name}`, qui n'est lu nulle part, donc pas de cas d'échec. F-23 est corrigé dans le `CLAUDE.md` racine mais pas dans celui du front (voir 20). Les constats encore ouverts sont signalés par leur ID ci-dessous.

---

## Must fix

1. **Changer de conversation pendant une réponse ramène sur l'ancienne** (`src/pages/Assistant/Assistant.tsx:57-66`, `:86-96`) — NOUVEAU
   - **What this is:** Quand une réponse se termine, `getResponse` écrit l'ID de conversation renvoyé par le serveur dans `currentConversationIdRef` et dans `currentConversationId`.
   - **Problem:** Il l'écrit sans vérifier que l'utilisateur est encore sur cette conversation. Cas concret : je pose une question dans A, puis je clique sur B (ou sur « Nouvelle conversation ») pendant que A répond. B s'affiche. Quand A finit, l'écran rebascule sur A alors que l'URL indique toujours `/conversations/B`, et ma question suivante part dans A. Autre souci : une nouvelle conversation ne met jamais l'URL à jour, donc un F5 la fait disparaître de l'écran.
   - **Fix:** Garder l'ID de départ (`const startId = currentConversationIdRef.current`) et, après le `await`, ne rien mettre à jour si `currentConversationIdRef.current !== startId`. Quand `wasNewConversation` est vrai, faire `navigate(\`/assistants/${assistantId}/conversations/${newConvId}\`, { replace: true })`.
   - **If we skip it:** L'utilisateur final lit et écrit dans la mauvaise conversation sans s'en rendre compte.

2. **Le flux SSE n'est jamais fermé quand on quitte la page** (`src/hooks/chat/useSSEStream.ts:41-91`) — NOUVEAU
   - **What this is:** `stream()` ouvre un `EventSource` et ne le ferme qu'à la réception de `done`, d'une `error` ou en cas d'échec réseau.
   - **Problem:** Aucun nettoyage au démontage. Cas concret : je pose une longue question puis je change de page, ou je passe à un autre assistant (`ChatRoute` remonte le composant via `key={assistantId}`). La connexion reste ouverte jusqu'à la fin de la réponse : le serveur continue de générer et de décompter des crédits pour une réponse que plus personne ne lit, et les `setMessages` visent un composant qui n'existe plus. Avec plusieurs allers-retours, plusieurs flux tournent en même temps et chacun compte dans la limite de 20 requêtes par minute du back.
   - **Fix:** Dans `useSSEStream`, garder les `EventSource` ouverts dans un `useRef<Set<EventSource>>` et les fermer dans le `return` d'un `useEffect(() => () => …, [])`. Rejeter alors avec une erreur « annulée » que `useChat` ignore. Une dizaine de lignes, aucune nouvelle couche.
   - **If we skip it:** Des crédits sont consommés pour rien, et l'erreur « trop de requêtes » arrive plus tôt que prévu.

3. **Session expirée : l'app reste ouverte mais plus rien ne marche** (`src/services/api.ts:26-35`, `src/app/AuthContext.tsx:19-24`) — NOUVEAU
   - **What this is:** L'état « connecté » ne vient que de `GET /users/me`, appelé au démarrage puis seulement quand le tag `Users` est invalidé.
   - **Problem:** Un 401 renvoyé par une autre requête ne change rien à cet état. Cas concret : le JWT expire (`JWT_EXPIRATION=7d`), ou je me déconnecte dans un autre onglet (le jeton est mis en liste noire). L'onglet resté ouvert affiche « Impossible de charger… » partout, chaque action donne un toast d'erreur, et je ne suis jamais renvoyé vers `/login`. Le seul moyen d'en sortir est de recharger la page.
   - **Fix:** Dans `baseQueryWithErrorUnwrap`, si `result.error?.status === 401` et que l'URL ne commence pas par `/auth/`, appeler `api.dispatch(backendApi.util.invalidateTags([Tag.Users]))`. `getMe` répond alors 401, `AuthContext` passe à « déconnecté » et `PrivateRoute` redirige vers `/login`. Trois lignes.
   - **If we skip it:** Tous les utilisateurs qui gardent un onglet ouvert plus d'une semaine tombent sur une app cassée.

4. **Une question de plus de 4000 caractères affiche « Erreur de connexion au serveur »** (`src/components/ui/chat/ChatInput.tsx:14-57`, `src/components/Assistant/AssistantInput.tsx:83`, `src/hooks/chat/useSSEStream.ts:87-90`) — NOUVEAU
   - **What this is:** Les trois routes SSE du back (`agent-runtime.controller.ts:48`, `conversation.controller.ts:50`, `onboarding.controller.ts:111`) refusent avec un 400 toute question de plus de `MAX_RUNTIME_QUERY_LENGTH = 4000` caractères.
   - **Problem:** Les champs de saisie n'ont aucune limite. Un `EventSource` ne voit pas le statut HTTP, donc le 400 arrive dans `onerror` et l'utilisateur lit « Erreur de connexion au serveur. ». Cas concret : je colle un extrait de contrat de 5000 caractères. Le message parle d'une panne, je réessaie, et ça échoue à chaque fois. Le 429 (limite de 20 requêtes par minute) donne exactement le même message.
   - **Fix:** `maxLength={4000}` sur l'`Input` de `ChatInput` et le `Textarea` d'`AssistantInput`, avec un petit compteur près de la limite. Dans `onerror`, remplacer le texte par « Le serveur a refusé la question (trop longue ou trop de questions d'affilée). ».
   - **If we skip it:** Les utilisateurs pensent que le service est en panne et ouvrent des tickets au support.

5. **Des réglages factices font croire à des choix RGPD qui n'existent pas** (`src/pages/Agents/Deployment/Settings.tsx:61`, `src/components/Deployment/Settings/DataPrivacy.tsx:108-113`, `src/components/Legal/ContactForm.tsx:65-67`) — F-11, toujours ouvert (l'achat de crédits et la clé API factices ne sont plus montés, voir 16)
   - **What this is:** L'interrupteur « Logs API détaillés — Conservation des logs API pendant 90 jours » et le bouton « Envoyer le message » de la page Contact.
   - **Problem:** L'interrupteur ne change qu'un `useState` local, qui cache le tableau des logs : rien n'est envoyé au serveur. Cas concret : un admin le désactive pour se mettre en règle, croit que les logs ne sont plus gardés, alors que le back continue de les conserver selon `retentionDays`. Le bouton de contact n'a pas de `onClick` : le message est perdu sans aucun retour.
   - **Fix:** Supprimer la ligne « Logs API détaillés » et l'état `apiLogs` (toujours afficher `QueryLogsTable`). Remplacer le bouton de contact par un lien `mailto:`. Ça ne fait que supprimer du code.
   - **If we skip it:** Le client prend une décision de conformité sur une fausse information, et ses demandes de contact se perdent.

6. **Les documents Word des clients sont envoyés à Microsoft pour l'aperçu** (`src/utils/documentFormatters.ts:59-64`) — F-08, toujours ouvert
   - **What this is:** `getPreviewUrl` met l'URL S3 présignée d'un `.docx` dans `view.officeapps.live.com`.
   - **Problem:** Cas concret : un membre ouvre l'aperçu d'un contrat confidentiel, et les serveurs de Microsoft téléchargent le fichier. C'est un sous-traitant que le client n'a jamais accepté.
   - **Fix:** Supprimer la branche Word : le drawer affiche alors déjà « Aperçu non disponible — téléchargez le fichier » (`DocumentPreview.tsx:126-131`). Si un aperçu est indispensable, le faire générer en PDF par le back.
   - **If we skip it:** C'est un point bloquant dans une revue RGPD ou un questionnaire de sécurité client.

7. **Mixpanel suit les utilisateurs sans leur consentement, email compris** (`src/lib/mixpanel.ts:10`, `src/pages/Auth/Login/PasswordForm.tsx:64-67`, `src/components/Auth/GoogleLoginButton.tsx:22-25`) — F-10, toujours ouvert
   - **What this is:** `opt_in_tracking()` est appelé dès le chargement, puis `people.set({ $name, $email })` à chaque connexion.
   - **Problem:** Cas concret : un visiteur européen se connecte, et son nom et son email partent chez Mixpanel avant tout accord de sa part.
   - **Fix:** Remplacer `opt_in_tracking()` par l'option `opt_out_tracking_by_default: true` et n'activer le suivi qu'après un clic « J'accepte ». En attendant, retirer `$email` et `$name` de `people.set`.
   - **If we skip it:** Non-conformité RGPD visible par n'importe quel client qui regarde l'onglet Réseau.

## Should fix

8. **Supprimer son compte ne vide pas le cache, contrairement à la déconnexion** (`src/pages/Profile/ProfileContent.tsx:73-82` contre `src/app/Navigation/SidebarFooterPanel.tsx:88-100`) — NOUVEAU
   - **What this is:** La déconnexion appelle `resetApiState()` et `mixpanel.reset()`. La suppression du compte ne fait que `logout()` puis `navigate("/login")`.
   - **Problem:** Le cache RTK garde 60 s les données qui ne sont plus affichées. Cas concret : sur un poste partagé, je supprime mon compte, puis quelqu'un clique tout de suite sur « Continuer avec Google » avec un autre compte. `DefaultRedirect` lit la liste des workspaces encore en cache, l'envoie sur `/workspaces/<ancien id>/agents`, et `WorkspaceGuard` le laisse passer grâce au même cache : il voit les agents du compte supprimé.
   - **Fix:** Sortir les quatre lignes de `SidebarFooterPanel` dans un hook `useLogout()` (reset du cache, `mixpanel.reset()`, `logout()`, `navigate`) et l'appeler aux deux endroits. Une seule logique au lieu de deux qui divergent.
   - **If we skip it:** Fuite de données (déjà supprimées) vers l'utilisateur suivant sur le même navigateur.

9. **Une erreur serveur donne un chargement sans fin ou une fausse page 404** (`src/app/DefaultRedirect.tsx:39-41`, `src/app/WorkspaceGuard.tsx:22-24`) — NOUVEAU
   - **What this is:** `DefaultRedirect` affiche le loader tant que `!workspaces?.length` ; `WorkspaceGuard` affiche `NotFound` dès que `isError` est vrai.
   - **Problem:** Cas concret : `GET /workspaces` renvoie un 500 ou le réseau coupe. Le loader tourne à l'infini, sans message ni bouton « Réessayer ». Une erreur 500 passagère sur `GET /workspaces/:id` affiche « page introuvable » alors que l'entreprise existe bien.
   - **Fix:** Dans `DefaultRedirect`, lire `isError` et afficher un message avec `refetch`. Dans `WorkspaceGuard`, n'afficher `NotFound` que pour un statut 403 ou 404, et un message « Réessayer » sinon.
   - **If we skip it:** Le moindre incident côté back passe pour une app bloquée ou une donnée perdue.

10. **Le workflow non enregistré se perd sans avertissement au rechargement** (`src/hooks/useUnsavedChangesBlocker.ts:60-86`) — NOUVEAU
    - **What this is:** `useBlocker` bloque la navigation à l'intérieur de l'app quand le workflow a des changements non enregistrés.
    - **Problem:** Il ne gère pas `beforeunload`. Cas concret : après 20 minutes de réglages dans le builder, Cmd+R, la fermeture de l'onglet ou un lien externe effacent tout sans aucune alerte.
    - **Fix:** Dans le même hook : `useEffect(() => { if (!isDirty) return; const h = (e: BeforeUnloadEvent) => e.preventDefault(); window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [isDirty]);`
    - **If we skip it:** Du travail perdu dans l'écran le plus long à remplir de l'app.

11. **Les aperçus HTML exécutent le JavaScript du fichier importé** (`src/components/Document/Drawer/DocumentPreview.tsx:115-124`, `src/components/Assistant/Drawer/QuerySourcesTab.tsx:58`) — F-09, toujours ouvert
    - **What this is:** Des iframes sans `sandbox` affichent l'URL S3 des documents, et `text/html` fait partie des types acceptés (`useUploadDocuments.ts:11`).
    - **Problem:** Cas concret : un `.html` importé dans une base contient un faux formulaire de connexion avec du script. Un utilisateur final qui ouvre la source dans l'Assistant voit une vraie page active, encadrée par l'app.
    - **Fix:** Ajouter `sandbox=""` à l'iframe quand `mimeType` vaut `text/html` (les PDF restent sans `sandbox`). Deux lignes.
    - **If we skip it:** Un vecteur de phishing ouvert à quiconque peut importer un document.

12. **La recherche de documents ne cherche que dans la page affichée** (`src/components/Document/Table/DocumentList.tsx:55-65`) — F-13, toujours ouvert
    - **What this is:** Le filtre par nom et par type tourne sur les 8 documents de la page (`PAGE_SIZE = 8`, `DatasetDocumentsTab.tsx:20`).
    - **Problem:** Cas concret : une base de 40 documents, je cherche « contrat-2024 » qui est en page 3. Je lis « aucun résultat ».
    - **Fix:** Envoyer `q` à `getDatasetDocuments` (le back a déjà `DocumentPaginationQuery`, il faut y ajouter `q` avec un `contains` Prisma) et supprimer le filtre local.
    - **If we skip it:** Dès qu'une base dépasse 8 documents, les utilisateurs croient que leurs fichiers ont disparu.

13. **Le suivi d'indexation continue après la fermeture de la fenêtre d'import** (`src/hooks/useUploadDocuments.ts:55-89`, `:192-196`) — F-15, à moitié corrigé (le `fetch()` est remplacé par une lazy query, mais les minuteurs restent)
    - **What this is:** Chaque fichier importé lance une chaîne de `setTimeout` (jusqu'à 40 fois 3 s).
    - **Problem:** Ni le démontage ni `reset()` n'arrêtent ces chaînes. Cas concret : j'importe 3 fichiers et je ferme la fenêtre. Pendant 2 minutes, 120 requêtes partent encore en arrière-plan, en plus du polling déjà fait par `DatasetDocumentsTab` (`:58-63`).
    - **Fix:** Dans `reset()` et dans le nettoyage d'un `useEffect`, ajouter tous les `sources[].id` à `cancelledPolls`. Ou plus simple : supprimer ce polling et laisser l'état venir de la liste, qui se rafraîchit déjà toutes les 3 s.
    - **If we skip it:** Des requêtes inutiles, et un `CLAUDE.md` qui décrit encore un `fetch()` qui n'existe plus.

14. **La CI ne bloque jamais le lint du front** (`.github/workflows/jobs.yml:140-145`, `eslint.config.mjs`) — NOUVEAU, lié à F-19 toujours ouvert
    - **What this is:** Le job front lance `yarn lint` avec `continue-on-error: true`, à cause des 42 erreurs `react/prop-types` de `components/charts/`.
    - **Problem:** Cas concret : une vraie erreur ajoutée demain (`react-hooks/rules-of-hooks`, un hook appelé dans un `if`) passe au vert en CI. Le lint ne protège plus rien.
    - **Fix:** Désactiver `react/prop-types` pour `**/*.tsx` dans `eslint.config.mjs` (TypeScript type déjà les props), ce qui fait tomber les erreurs à 0, puis retirer `continue-on-error`.
    - **If we skip it:** La seule vérification automatique du front reste décorative.

15. **Aucun test sur les deux contrats avec le back** (`src/hooks/chat/useSSEStream.ts:45-85`, `src/services/api.ts:26-35`) — NOUVEAU
    - **What this is:** Le front n'a aucun test (`craco test` en trouve 0). Les deux morceaux qui suivent le format du back à la main sont le décodeur SSE (`chunk`, `citedSources`, `sources`, `status`, `error` + `isOutOfCredits`, `done`) et le déballage de `{ statusCode, timestamp, path, error }`.
    - **Problem:** Cas concret : `runtime-sse-event.ts` côté back renomme `citedSources` ou change la forme de `error`. Rien ne casse en CI, et les sources ou le message « Crédits épuisés » disparaissent en production.
    - **Fix:** Un seul fichier `useSSEStream.test.ts` avec un faux `EventSource` (une classe de 15 lignes) qui envoie les 6 types d'événements et vérifie le texte, les sources et `InsufficientCreditsError`, plus un cas pour `baseQueryWithErrorUnwrap`.
    - **If we skip it:** Le prochain changement du format côté back casse le chat sans que personne ne le voie.

16. **Environ 2950 lignes de code mort** (liste ci-dessous) — NOUVEAU (en partie F-11 et F-19)
    - **What this is:** Des fichiers qui ne sont importés nulle part. J'ai vérifié par grep sur tout `src/` et sur `packages/workflow/src`, en cherchant aussi les chaînes et les imports dynamiques.
    - **Problem:** `app/Navigation/{SidebarHeader,SidebarItem,SidebarSection}.tsx`, `components/Agents/Workflow/NodeModalContent/SettingPlaceholderContent.tsx`, `components/Deployment/AccessControl/{ApiKeysSection,VisibilitySection}.tsx` (fausse clé `sk_live_…`), `components/Deployment/{LiveDot,Settings/HostingRegion}.tsx`, `components/ui/{CardHeader,CustomTooltip,Drawer,MenuDropDown,Modal,RowContainer}.tsx`, `components/ui/chat/ChatHeader.tsx`, `components/ui/workflow-preview/index.ts`, `hooks/{useCopyToClipboard,useDownloadFile}.ts`, `services/billing/billing.ts`, `components/Billing/{BuyCreditsSection,CreditsOrderSummary,ChangePlanSection,PlanTierCard}.tsx` (commentés dans `pages/Billing/index.tsx:6-7,26-30`), soit environ 1600 lignes, plus 8 fichiers de `components/charts/` (`area-chart-loading`, `background`, `bar-chart-loading`, `bar-squares`, `line-chart-loading`, `line-series-terminal-marker`, `projection-line(-end-marker)`), soit 1355 lignes. Cas concret : `plateform_front/CLAUDE.md` envoie les développeurs vers `Modal.tsx`, `Drawer.tsx`, `CustomTooltip.tsx` et `MenuDropDown.tsx` comme composants partagés, alors qu'aucun écran ne les utilise.
    - **Fix:** Supprimer ces fichiers (git les garde) et retirer les quatre composants de la liste du `CLAUDE.md`.
    - **If we skip it:** Du code à lire, à mettre à jour et à corriger pour rien, et de fausses pistes pour qui arrive sur le projet.

17. **Routes et endpoints morts ou cassés** (`src/app/Routes/AuthRoutes.tsx:17`, `src/app/Routes/AppRoutes.tsx:20,25`, `src/services/agentRuntime/agentRuntime.ts:22-29`, `src/hooks/chat/useAgentQuery.ts:24-25`) — F-12 et F-07 toujours ouverts, plus deux routes NOUVELLES
    - **What this is:** Des routes et des appels que rien n'atteint.
    - **Problem:** `/test` est une page publique (écran de bienvenue sans `onDone`, son bouton ne fait rien). `/billing` (hors workspace) n'a pas de `workspaceId`, donc ses deux requêtes sont sautées : cas concret, la page affiche « 0 crédit » et une consommation vide. `/workspaces/:id/assistants/:assistantId` n'est la cible d'aucun lien (`AssistantsTable.tsx:59` ouvre `/assistants/:id`). `executeAgentRuntime` (`POST …/runtime`) et l'URL par défaut `…/runtime/stream` n'existent pas côté back.
    - **Fix:** Supprimer ces trois routes, l'endpoint `executeAgentRuntime`, et rendre `streamUrl` obligatoire dans `useAgentQuery` (tous les appelants le passent déjà).
    - **If we skip it:** Des pages trompeuses accessibles par simple URL, et un piège à 404 pour le prochain développeur.

18. **8 dépendances inutilisées et deux copies de la librairie d'animation** (`package.json`) — NOUVEAU, complète F-18 toujours ouvert
    - **What this is:** `@stripe/react-stripe-js`, `@stripe/stripe-js`, `chart.js`, `react-chartjs-2`, `uuid`, `dotenv`, `react-hook-use-form` et `lucide` (le paquet sans React) ne sont importés nulle part dans `src/`, `scripts/` ou `craco.config.js`.
    - **Problem:** L'app importe `framer-motion` (12.38, 47 fichiers) et `motion/react` (44 fichiers, presque tous dans `components/charts/`). Or `motion@13.1.1` embarque sa propre copie `framer-motion@13.1.1` (`node_modules/motion/node_modules/framer-motion`). Cas concret : le bundle livre deux moteurs d'animation complets. Et les outils de dev (eslint, prettier, typescript, @types, testing-library) sont toujours dans `dependencies`.
    - **Fix:** Retirer les 8 paquets. Remplacer `from "motion/react"` par `from "framer-motion"` dans les charts et retirer `motion` (vérifier ensuite `yarn build` : l'API est la même pour les usages des charts). Déplacer l'outillage dans `devDependencies`.
    - **If we skip it:** Un bundle plus lourd, des installations plus longues et des alertes de vulnérabilité sur du code jamais utilisé.

## Nice to have

19. **Cinq copies d'un formateur de date relative, dont deux se trompent de jour** (`src/components/Assistant/AssistantsTable.tsx:10-17`, `src/components/Assistant/ConversationSidebar.tsx:9-15`, `src/pages/Assistant/AssistantHome.tsx:12-18`, `src/components/Dashboard/RecentActivityCard.tsx:60-69`, contre `src/utils/date.ts:1`) — NOUVEAU
    - **What this is:** Chaque écran recalcule « aujourd'hui / hier / il y a N j » à partir de tranches de 24 h.
    - **Problem:** Cas concret : un message envoyé hier à 23 h, vu aujourd'hui à 8 h (9 h d'écart, donc `days = 0`), est marqué « Aujourd'hui » dans `AssistantsTable` et dans `AssistantHome`. De la même façon, l'URL du back est recalculée à la main dans `pages/Agents/Chat/index.tsx:17`, `TestAssistantStep.tsx:21` et `ImproveAssistantStep.tsx:26`, alors que `BACKEND_URL` est déjà exporté par `useSSEStream.ts:6`.
    - **Fix:** Garder `formatRelativeDate` de `utils/date.ts`, lui faire comparer des jours du calendrier (`toDateString()`), supprimer les quatre copies et importer `BACKEND_URL`.
    - **If we skip it:** De petites erreurs de date, et cinq endroits à corriger chaque fois que le libellé change.

20. **Docs du front qui décrivent un code qui n'existe plus** (`plateform_front/CLAUDE.md:60,76`, `plateform_front/REFACTOR_PLAN.md`, `plateform_front/docs/ARCHITECTURE.md`) — F-20 et F-23 toujours ouverts (côté front)
    - **What this is:** La doc que lisent les développeurs et Claude Code avant de toucher au front.
    - **Problem:** `CLAUDE.md:60` signale un `fetch()` direct dans `useUploadDocuments` qui n'existe plus. `CLAUDE.md:76` dit de rebuild le package après chaque modification, alors que craco compile `packages/workflow/src` (le `CLAUDE.md` racine a été corrigé, celui du front non). `REFACTOR_PLAN.md` (416 lignes) présente comme « bug critique » le hook conditionnel de `NodeModal`, déjà corrigé. `ARCHITECTURE.md` décrit des routes supprimées.
    - **Fix:** Corriger les deux lignes du `CLAUDE.md` et supprimer `REFACTOR_PLAN.md` et `ARCHITECTURE.md` (le `CLAUDE.md` couvre déjà l'architecture).
    - **If we skip it:** Du temps perdu à chasser des problèmes déjà réglés.

Constats plus petits laissés de côté : 4. Le choix de rétention (`Settings.tsx:67-69`) échoue sans message. `WorkspaceGuard` charge le détail complet du workspace (agents, workflows, utilisateurs) juste pour vérifier l'accès. Les libellés de jour du graphique de consommation (`ConsumptionCard.tsx:49-54`) sont en heure locale alors que les données sont groupées par jour UTC. L'aperçu Markdown des documents (`DocumentPreview.tsx:94`) charge les images distantes.

---

**Verdict:** La base est saine (`tsc` passe, le cache RTK est bien invalidé, le Markdown de l'IA est sûr), mais il faut corriger d'abord le chat : 1 (mauvaise conversation), 2 (flux jamais fermé) et 3 (session expirée), puis retirer les réglages factices (5) et régler les deux points RGPD (6, 7).

**Lean:** -2950 lignes, -9 dépendances possibles (les 8 inutilisées, plus `motion`).

**Not checked:**
- Je n'ai pas lancé l'app ni de navigateur : les constats 1, 2, 9 et 10 viennent de la lecture du code et des contrats du back, pas d'un essai réel.
- `components/charts/` (vendu, F-19) n'a pas été lu en détail. Je n'ai pas lu ligne à ligne les écrans d'animation du builder (`NodeModalContent/*Animation*`, `hooks/demo` : il a un nettoyage par `AbortController`), `components/Agents/Analytics`, `components/Dashboard` ni les pages légales.
- `packages/workflow` est hors périmètre ; seul son usage par l'app a été lu.
- Le bundle n'a pas été mesuré.
- Le lint a été lancé sans `--fix` : 42 erreurs, toutes `react/prop-types` dans les charts.
- Pour l'auditeur du back : `AllExceptionsFilter` (`plateform_back/src/exeptions/interceptor.service.ts:26-31`) écrit `request.url` en entier dans les logs, donc la question de l'utilisateur quand une route SSE renvoie une erreur (par exemple une question trop longue). Le sérialiseur pino, lui, coupe bien la query string.
