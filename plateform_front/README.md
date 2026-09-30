# GenRAG — application web (`plateform_front`)

Application React de la plateforme GenRAG : dashboard, agents, builder de workflow, documents, déploiement, billing, et interface de l'assistant pour l'utilisateur final.

La documentation de référence (stack, organisation des dossiers, thème, RTK Query, routes) est dans [`CLAUDE.md`](./CLAUDE.md) ; la vue d'ensemble du monorepo dans [`../CLAUDE.md`](../CLAUDE.md).

## Stack

React 19, TypeScript, Create React App + craco, Chakra UI 2, Redux Toolkit / RTK Query, React Router 7, `@genrag/workflow` (builder ReactFlow, dans `../packages/workflow`).

## Installation

Le front fait partie des workspaces Yarn de la racine du monorepo :

```bash
# depuis la racine du monorepo
yarn install --frozen-lockfile
cp plateform_front/.env.example plateform_front/.env   # puis renseigner les valeurs
```

L'API (`../plateform_back`) doit être démarrée et autoriser l'origine du front (`FRONTEND_URL`).

## Commandes (depuis `plateform_front/`)

```bash
yarn start        # build Tailwind + watch + serveur de dev (http://localhost:3000)
yarn build        # build de production dans build/
yarn lint         # ESLint (avec --fix)
yarn format       # Prettier
yarn test         # craco test (aucun test pour l'instant)
```

Le package `@genrag/workflow` est résolu depuis ses sources par `craco.config.js` en dev ; le build Vercel (`../vercel.json`) le compile avant l'application.

## Variables d'environnement

Voir [`.env.example`](./.env.example) : `REACT_APP_BACKEND_URL`, `REACT_APP_GOOGLE_CLIENT_ID`.
