# CLAUDE.md — `plateform_front/`

Conventions spécifiques au frontend. Vue d'ensemble du projet, modèle de données et flux back : voir `../CLAUDE.md`.

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
- Routing : `src/app/Router.tsx` délègue à `src/app/Routes/{AppRoutes,AgentRoutes,AuthRoutes,LegalRoutes}.tsx`. Layouts : `PrivateAppLayout`, `PrivateAgentAppLayout`. Guards : `PrivateRoute`, `WorkspaceGuard`.

## Composants

- Organisation **par feature**, pas Atoms/Molecules : `components/Agents/`, `components/Assistant/`, `components/Auth/`, `components/Billing/`, `components/Dashboard/`, `components/Deployment/`, `components/Document/`, `components/Legal/`, `components/Onboarding/`, `components/charts/`.
- `components/ui/` = composants génériques réutilisables inter-features (`Button.tsx`, `Modal.tsx`, `Drawer.tsx`, `ActionMenu.tsx`, `EntityCard.tsx`, `CustomTooltip.tsx`, `MenuDropDown.tsx`, `chat/`, `workflow-preview/`, `GlassNav/`…). Chercher ici avant de créer un nouveau composant partagé.
- Un composant destiné à l'aperçu du workflow existe déjà : `components/ui/workflow-preview/WorkflowPreview.tsx`.
- Un fichier `.tsx` ne dépasse pas 200 lignes — **actuellement violé dans `components/charts/*` (plusieurs fichiers > 400-700 lignes) et certains `NodeModalContent/*OverviewTab.tsx`** ; ne pas suivre ces fichiers comme modèle, découper le nouveau code plutôt que de l'y ajouter.
- Props typées, interfaces explicites, pas de `any`.

## RTK Query

- Une seule base API : `services/api.ts` exporte `backendApi` (`createApi`, `reducerPath: "backendApi"`), avec la liste des `tagTypes` définie dans `services/tags/tag.ts` (`enum Tag`).
- La `baseQuery` (`baseQueryWithErrorUnwrap`) déballe automatiquement le format d'erreur du backend (`AllExceptionsFilter` → `{ statusCode, timestamp, path, error }`) pour que `err.data` corresponde directement au contenu de `error`. Ne pas réimplémenter ce unwrap ailleurs.
- Chaque feature a son fichier dans `services/<feature>/<feature>.ts` avec `backendApi.injectEndpoints(...)` (voir `services/agent/agent.ts` pour le pattern `providesTags`/`invalidatesTags`). Le fichier doit être importé au moins une fois pour enregistrer ses endpoints (voir l'import de `services/agent/agent` dans `store/index.ts`).
- `providesTags` sur les queries, `invalidatesTags` sur les mutations — pas de refetch manuel quand un tag suffit.
- **Deux appels `fetch()` directs bypassent RTK Query aujourd'hui** : `hooks/useUploadDocuments.ts` (polling du statut d'un document) et `components/Deployment/Settings/UserRights.tsx` (téléchargement d'exports). Ne pas reproduire ce pattern pour du nouveau code — passer par un endpoint RTK Query.
- Jamais de logique serveur recopiée dans `store/navigationSlice.ts` ou un `useState` : le cache RTK Query est la source de vérité pour les données serveur.

## États de chargement, erreur, vide

- Skeleton Chakra dédié et colocalisé avec la feature (ex. `components/Document/Table/DocumentSkeletonRow.tsx`, `components/Assistant/HistoryLoadingSkeleton.tsx`), pas de spinner plein écran. Le composant `Skeleton` a son propre thème (`themeNew/components/skeleton.ts`) et ses tokens (`skeletonStart`/`skeletonEnd`).
- `isLoading` → skeleton ; `isFetching` seul ne doit pas faire disparaître le contenu déjà chargé.
- Gérer explicitement l'état d'erreur (`error` de RTK Query) et l'état vide (liste vide), pas seulement le cas nominal.

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
