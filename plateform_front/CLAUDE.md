# CLAUDE.md — `plateform_front/`

App React de la plateforme (gestion des workspaces, agents, workflows, documents, déploiement, assistant final). Vue d'ensemble du monorepo et carte des features : `../CLAUDE.md`. Modèle de données et flux back : `../plateform_back/CLAUDE.md`. Package du builder : `../packages/workflow/CLAUDE.md`.

## Stack réelle

- **Bundler :** Create React App + `@craco/craco` (`craco.config.js`) — **pas Vite**, malgré ce qu'indiquait une ancienne version de cette doc.
- **React 19**, TypeScript, React Router **v7** (`react-router-dom@^7`).
- **UI principale :** Chakra UI v2.10 + thème custom (`src/themeNew/`).
- **Tailwind CSS v4 :** installé mais **scopé aux composants charts uniquement** (`src/tailwind.src.css`, sans preflight pour ne pas entrer en conflit avec le reset de Chakra). Ne pas l'utiliser ailleurs.
- **State / API :** Redux Toolkit + RTK Query.
- **Workflow builder :** `@genrag/workflow` (ReactFlow).
- **Autres :** Framer Motion, Chart.js + `@visx/*` (charts), Mixpanel (analytics), Stripe (billing).

## Thème et tokens de couleur

- Fichier de thème : `src/themeNew/index.ts` (`extendTheme`), composé depuis `src/themeNew/foundations/` et `src/themeNew/components/`.
- **Semantic color tokens** (à utiliser, jamais de couleur en dur) : `src/themeNew/foundations/colorTokens.ts`. Catégories disponibles : `text*` (`textPrimary`, `textSecondary`, `textLabel`, `textMuted`, `textError`…), `surface*` (`surfaceCard`, `surfaceModal`, `surfaceHover`…), `border*` (`borderDefault`, `borderSubtle`, `borderStrong`…), `input*`, `bubble*` (bulles de chat), `skeleton{Start,End}`, `accentCardBg`/`iconAccent` etc.
- Il n'y a qu'un seul dossier de thème (`themeNew`) — pas d'ancien `theme/` à distinguer.
- **Variantes de texte** : `src/themeNew/foundations/typography.ts`, appliquées via le composant `Text`/`Heading` (`variant="body-sm-semibold"`, `"body-md-muted"`, `"caption-sm"`, `"heading-lg"`, `"display-xl"`, `"number-md"`…). Ne pas créer de nouvelle variante sémantique sans vérifier que l'existant ne convient pas.
- `useColorModeValue` n'est presque plus nécessaire : la plupart des cas sont déjà couverts par les semantic tokens (`_dark` intégré). Ne l'utiliser qu'en dernier recours.

## Organisation des dossiers (`src/`)

Convention : **`hooks/`, `utils/`, `types/`, `constants/`, `services/` vivent à la racine de `src/`**, avec un sous-dossier par feature quand le fichier n'est pas partagé. Vérifier si le sous-dossier existe avant d'en créer un.

- ✅ `src/hooks/chat/useChat.ts`, `src/hooks/sidebar/useActiveSidebarItem.ts` — déjà pratiqué dans ce repo.
- ✅ `src/types/agent/agent.ts`, `src/types/workflow/workflow.ts`, `src/types/deployment/deployment.ts`.
- ✅ `src/utils/analytics/dateUtils.ts` — un élément transverse (`src/utils/validateEmail.ts`, `src/utils/agentAvatar.ts`) reste à la racine du dossier.
- `src/lib/` est distinct de `src/utils/` : réservé aux petits wrappers de librairie (`lib/utils.ts` → `cn()` clsx+tailwind-merge pour les composants Tailwind, `lib/mixpanel.ts` → client Mixpanel). Ne pas y mettre de logique métier.
- `src/store/` : `navigationSlice.ts` (état client pur — sidebar/nav), `index.ts` (configureStore), `reduxProvider.tsx`. N'y ajouter que de l'état UI/client, jamais des données serveur (RTK Query cache s'en charge).
- Routing : `src/app/Router.tsx` délègue à `src/app/Routes/{AppRoutes,AgentRoutes,AuthRoutes,LegalRoutes}.tsx`. Layouts : `PrivateAppLayout` (sidebar principale), `PrivateAgentAppLayout` (sidebar agent). Guards : `PrivateRoute`, `WorkspaceGuard` (vérifie l'accès au `workspaceId` de l'URL).

## Routes

- Auth (publiques) : `/login`, `/register`, `/validate`, `/reset-password`, `/new-password` (+ `/test`, écran de bienvenue de dev).
- Hors workspace : `/profile`, `/assistants` (interface utilisateur final), `/billing`, `/onboarding/:workspaceId`.
- Workspace : `/workspaces/:workspaceId/{dashboard,assistants[/:assistantId],billing,agents}`.
- Agent : `/workspaces/:workspaceId/agents/:agentId/{playground,workflow,documents,deploy,access-control,analytics,settings}` (la racine redirige vers `playground`).
- Légal : `/legal/{privacy,terms,notices,contact}`. Il n'y a plus de `/dashboard` ni de liste `/workspaces` hors contexte.

## Composants

- Organisation **par feature**, pas Atoms/Molecules : `components/Agents/`, `components/Assistant/`, `components/Auth/`, `components/Billing/`, `components/Dashboard/`, `components/Deployment/`, `components/Document/`, `components/Legal/`, `components/Onboarding/`, `components/charts/`.
- `components/ui/` = composants génériques réutilisables inter-features (`Button.tsx`, `Modal.tsx`, `Drawer.tsx`, `ActionMenu.tsx`, `EntityCard.tsx`, `CustomTooltip.tsx`, `MenuDropDown.tsx`, `chat/`, `workflow-preview/`, `GlassNav/`…). Chercher ici avant de créer un nouveau composant partagé.
- Un composant destiné à l'aperçu du workflow existe déjà : `components/ui/workflow-preview/WorkflowPreview.tsx`.
- Animations explicatives des nodes (onglet « Aperçu » du workflow) : moteur `hooks/demo/useDemoScript.ts` (scénario async avec curseur : `moveTo`, `click`, `type`, `chapter`…) + composants `components/ui/demo/` (`DemoStage`, `DemoCursor`, `DemoChatInput`, `DemoWords`, `DemoCountUp`). Mise en page commune : `components/Agents/Workflow/NodeModalContent/NodeOverviewLayout.tsx` (liste d'étapes synchronisée). Une animation = `XxxAnimation.tsx` (script) + fichiers de scène ; le curseur vise les éléments `data-demo="…"`.
- Un fichier `.tsx` ne dépasse pas 200 lignes — **actuellement violé** dans `components/charts/*` (jusqu'à ~700 lignes) et dans une dizaine d'autres fichiers (`NodeSettingsEditor.tsx`, `ModelSelector/ModelDetailPanel.tsx`, `pages/Agents/Workflow/MenuNodeModal.tsx`…). Ne pas les prendre comme modèle, découper le nouveau code.
- Props typées, interfaces explicites, pas de `any`.

## RTK Query

- Une seule base API : `services/api.ts` exporte `backendApi` (`createApi`, `reducerPath: "backendApi"`), avec la liste des `tagTypes` définie dans `services/tags/tag.ts` (`enum Tag`).
- La `baseQuery` (`baseQueryWithErrorUnwrap`) déballe automatiquement le format d'erreur du backend (`AllExceptionsFilter` → `{ statusCode, timestamp, path, error }`) pour que `err.data` corresponde directement au contenu de `error`. Ne pas réimplémenter ce unwrap ailleurs.
- Chaque feature a son fichier dans `services/<feature>/<feature>.ts` avec `backendApi.injectEndpoints(...)` (voir `services/agent/agent.ts` pour le pattern `providesTags`/`invalidatesTags`). Le fichier doit être importé au moins une fois pour enregistrer ses endpoints (voir l'import de `services/agent/agent` dans `store/index.ts`).
- `providesTags` sur les queries, `invalidatesTags` sur les mutations — pas de refetch manuel quand un tag suffit.
- **Un appel `fetch()` direct bypasse encore RTK Query** : `hooks/useUploadDocuments.ts` (polling du statut d'un document). Ne pas reproduire ce pattern — passer par un endpoint RTK Query.
- Slices existants (`services/<feature>/<feature>.ts`) : `auth`, `workspace`, `agent` (+ `agentMembers.ts`), `workflow`, `document`, `deployment`, `chat` (assistant final + conversations), `agentRuntime`, `analytics`, `credit`, `billing` (Stripe), `models` (listes de modèles LLM / rerank), `onboarding`. `tags/tag.ts` n'est que le registre des tags.
- SSE (playground `…/runtime/playground`, assistant `/assistants/:agentId/stream`) : pas via RTK Query mais `hooks/chat/useSSEStream.ts` (`EventSource`, query en query-string).
- Jamais de logique serveur recopiée dans `store/navigationSlice.ts` ou un `useState` : le cache RTK Query est la source de vérité pour les données serveur.

## États de chargement, erreur, vide

- Skeleton Chakra dédié et colocalisé avec la feature (ex. `components/Document/Table/DocumentSkeletonRow.tsx`, `components/Assistant/HistoryLoadingSkeleton.tsx`), pas de spinner plein écran. Le composant `Skeleton` a son propre thème (`themeNew/components/skeleton.ts`) et ses tokens (`skeletonStart`/`skeletonEnd`).
- `isLoading` → skeleton ; `isFetching` seul ne doit pas faire disparaître le contenu déjà chargé.
- Gérer explicitement l'état d'erreur (`error` de RTK Query) et l'état vide (liste vide), pas seulement le cas nominal.

## Workflow builder (`pages/Agents/Workflow/`)

- `index.tsx` charge le workflow actif (`useGetActiveWorkflowQuery`), passe les nodes/edges par `sanitizeWorkflowEdges`, puis `useWorkflowCanvas` + `<ReactFlow>`. Sauvegarde : `serializeWorkflow(nodes, edges)` puis mutation `updateWorkflow` / `createWorkflow`.
- `NodeModal.tsx` (panneau latéral par type de node → `components/Agents/Workflow/NodeModalContent/`), `MenuNodeModal.tsx` (palette d'ajout, filtrée par `getAddableTaskTypes`).
- Avant sauvegarde, `hooks/useIncompleteNodesGuard.tsx` signale les nodes de réglage non configurés (`isPlaceholder`).
- Le package se rebuild (`yarn --cwd ../packages/workflow build`) après toute modification de `packages/workflow`.

## Tests

**Aucun test frontend n'existe actuellement** (`find src -iname "*.test.*" -o -iname "*.spec.*"` ne retourne rien), bien que `@testing-library/react`, `jest-dom`, `user-event` soient installés et que `craco test` soit configuré. Ne pas imposer un framework différent de celui déjà présent (Jest + Testing Library via `craco test`) si des tests sont ajoutés — mais ne pas prétendre qu'une couverture existe.

## Commandes (depuis `plateform_front/`)

```bash
yarn start        # build Tailwind + watch + craco start (dev server)
yarn build        # build Tailwind + craco build (prod)
yarn test         # craco test
yarn lint         # eslint --fix sur src/**/*.{ts,tsx}
yarn format       # prettier --write
```

`REACT_APP_BACKEND_URL` doit pointer vers `plateform_back` (`.env`, cookies cross-origin via `credentials: "include"`).
