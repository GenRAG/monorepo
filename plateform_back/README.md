# GenRAG — API de la plateforme (`plateform_back`)

API NestJS de GenRAG : authentification, workspaces, agents, workflows, documents (S3 + file d'indexation), runtime RAG en SSE, crédits et analytics. Elle appelle le moteur RAG externe (`RAGENGINE_URL`).

La documentation de référence (modules, modèle de données, flux, conventions) est dans [`CLAUDE.md`](./CLAUDE.md) ; la vue d'ensemble du monorepo dans [`../CLAUDE.md`](../CLAUDE.md).

## Prérequis

- Node.js 22 et Yarn 1
- PostgreSQL et Redis : le `docker-compose.yml` à la racine du monorepo les fournit (`postgres` sur 5433, `postgres_test` sur 5434, `redis` sur 6379)

## Installation

```bash
yarn install --frozen-lockfile
cp .env.example .env          # puis renseigner les valeurs (voir les commentaires du fichier)
yarn prisma generate
npx prisma migrate deploy
```

## Commandes

```bash
yarn start:dev           # serveur de dev (nodemon + ts-node), port PORT (8080)
yarn build:production    # nest build + copie du client Prisma généré dans dist/
yarn start:prod          # lance dist/main
yarn lint                # ESLint (avec --fix)
yarn test                # tests unitaires (Jest)
yarn test:e2e            # tests e2e : .env.test + postgres_test (../scripts/dev.sh e2e)
yarn test:cov            # couverture
```

Migrations Prisma : `../scripts/migrate.sh <nom>` (dans le container `server`). Documentation de l'API : `/docs` (Scalar).

## Variables d'environnement

Toutes les variables lues par l'application sont listées et commentées dans [`.env.example`](./.env.example).
