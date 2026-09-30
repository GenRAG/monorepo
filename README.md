# GenRAG — monorepo

GenRAG est une plateforme SaaS B2B pour créer, sans code, des assistants RAG qui répondent à partir des documents d'une entreprise. Ce dépôt contient la plateforme (API + application web), le package du builder de workflow et le site vitrine. Le moteur RAG est une API externe (`RAGENGINE_URL`) dont une copie de dev est dans `rag-engine/`.

La documentation de référence est dans les fichiers `CLAUDE.md` : [`CLAUDE.md`](./CLAUDE.md) pour la vue d'ensemble (dossiers, carte des features, règles transverses), puis celui de chaque dossier.

| Dossier | Rôle | Documentation |
|---|---|---|
| [`plateform_back/`](./plateform_back) | API NestJS (auth, workspaces, agents, documents, runtime RAG, crédits) | [`README`](./plateform_back/README.md) · [`CLAUDE.md`](./plateform_back/CLAUDE.md) |
| [`plateform_front/`](./plateform_front) | Application React de la plateforme | [`README`](./plateform_front/README.md) · [`CLAUDE.md`](./plateform_front/CLAUDE.md) |
| [`packages/workflow/`](./packages/workflow) | Package `@genrag/workflow` (builder ReactFlow, sérialisation du pipeline) | [`CLAUDE.md`](./packages/workflow/CLAUDE.md) |
| [`vitrine_front/`](./vitrine_front) | Site vitrine statique (Vite) | [`README`](./vitrine_front/README.md) · [`CLAUDE.md`](./vitrine_front/CLAUDE.md) |
| [`rag-engine/`](./rag-engine) | Copie de dev du moteur RAG externe (Python) | [`CLAUDE.md`](./rag-engine/CLAUDE.md) |

## Démarrage rapide

```bash
yarn install --frozen-lockfile          # workspaces : packages/* et plateform_front
(cd plateform_back && yarn install --frozen-lockfile)
./scripts/dev.sh                        # docker compose : postgres, redis, pgadmin, API (port 8080)
(cd plateform_front && yarn start)      # application web (port 3000)
```

Voir `scripts/dev.sh` (`clean`, `build`, `rebuild`, `deps`, `e2e`, `unit`) et `scripts/migrate.sh` pour les migrations Prisma.

## Déploiement (procédure temporaire, dépôt miroir)

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```
