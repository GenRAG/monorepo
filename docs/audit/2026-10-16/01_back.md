# Audit `plateform_back/` — origin/dev (904c1d3)

**What this repo does:** `plateform_back` est l'API NestJS de GenRAG. Elle gère les comptes, l'unique workspace de chaque client, les agents, leurs workflows, les bases de documents (fichiers dans S3, puis une file de tâches BullMQ qui les envoie au moteur RAG externe pour l'indexation), les crédits, et les réponses de l'assistant envoyées en direct au navigateur (SSE : le serveur pousse le texte morceau par morceau). Chaque réponse réussie débite des crédits.
Charge supposée : le document d'hébergement (`docs/demande_infrastructure_ecole.md`) prévoit une bêta fermée de 10 à 30 utilisateurs et 5 entreprises, sur une seule VM (API + Postgres + Redis). J'ai quand même vérifié le code pour des requêtes simultanées (plusieurs onglets, plusieurs utilisateurs finaux), et je signale ce qui casserait avec une deuxième instance de l'API.

Vérifié en lançant les outils : `tsc --noEmit` passe sans erreur, et `jest` passe (48 suites, 450 tests).

## Must fix

1. **Crédits gratuits sans limite via l'onboarding** (`src/onboarding/onboarding.service.ts:60`, `:95-100`, `prisma/schema/onboarding.prisma:14`) — NOUVEAU
   - **What this is:** Le premier `POST …/onboarding/start` d'un workspace crée un agent de démo et offre 20 crédits, mais seulement si le workspace n'a encore aucune session d'onboarding.
   - **Problem:** La session est supprimée en cascade avec l'agent de démo (`onDelete: Cascade`). Donc : on supprime l'agent de démo (`DELETE …/agents/:id`), on rappelle `start`, et `countByWorkspace` renvoie 0, ce qui redonne 20 crédits. Deux requêtes par boucle, sans fin.
   - **Fix:** Décider du bonus d'après le registre des crédits, pas d'après les sessions : `creditTransaction.count({ where: { workspaceId, metadata: { path: ['source'], equals: 'onboarding_bonus' } } }) === 0`. Ajouter un test « supprimer la démo puis relancer start ne crédite pas deux fois ».
   - **If we skip it:** N'importe quel compte gratuit s'offre autant d'appels LLM qu'il veut, et c'est la plateforme qui paie.

2. **Fermer l'onglet avant la fin donne une réponse gratuite** (`src/agent-runtime/streaming/rag-stream-forwarder.service.ts:32-38`, `src/credit/usage-tracker.service.ts:34-54`) — reste ouvert de B-36 (corrigé en partie)
   - **What this is:** Quand le client se déconnecte, le flux RAG est détruit, puis l'événement `close` enregistre l'usage.
   - **Problem:** `close` est toujours noté `ERROR`, et `recordQuery` ne débite que les `SUCCESS` (`creditsUsed: 0`). Un script lit tous les morceaux de texte puis coupe la connexion juste avant `end` : il a toute la réponse et ne paie rien. Un utilisateur qui ferme l'onglet en pleine réponse ne paie pas non plus, alors que l'appel LLM est déjà payé par la plateforme.
   - **Fix:** Dans le handler `close`, si `accumulator.buildOutcome().fullText` n'est pas vide, appeler `settle({ kind: 'end', … })` au lieu de `kind: 'error'`. Les sinks enregistrent alors un `SUCCESS` (coût réel, ou 1 crédit par défaut). Adapter le test du forwarder qui attend `ERROR`.
   - **If we skip it:** Le solde de crédits ne protège plus rien : n'importe qui peut obtenir des réponses sans payer.

3. **La migration des datasets plante la mise en production et coupe les documents de leurs agents** (`prisma/schema/migrations/20261005224546_add_dataset_model/migration.sql:19-20`, `Dockerfile:15`) — NOUVEAU
   - **What this is:** `main` s'arrête à la migration `20260907…`. Sur `main`, les documents ont un `agentId` et ont été indexés avec `org_id = agentId`. Le conteneur lance `prisma migrate deploy` avant de démarrer l'API.
   - **Problem:** La migration supprime `agentId` et ajoute `"datasetId" TEXT NOT NULL` sans valeur par défaut. Si la table `Document` contient au moins une ligne, Postgres refuse, la migration échoue, et l'API ne démarre pas. Si on contourne l'erreur à la main (valeur par défaut, ou table vidée), on perd le lien entre agent et documents, et les vecteurs déjà indexés (`org_id = agentId`) ne sont plus jamais cherchés. L'index unique `(datasetId, name)` de `20261010…` échoue aussi s'il existe des homonymes (cas possible avant, cf. B-16).
   - **Fix:** Tant que la migration n'est appliquée nulle part, la réécrire : ajouter `datasetId` sans `NOT NULL` ; créer un `Dataset` par agent qui a des documents, avec `id = agent.id` (ainsi les vecteurs `org_id = agentId` restent valides) ; `UPDATE "Document" SET "datasetId" = "agentId"` ; créer les liens `AgentDataset(agentId, agentId)` ; puis `SET NOT NULL` et `DROP COLUMN`. Renommer les homonymes avant l'index unique.
   - **If we skip it:** Le premier déploiement de `dev` en prod est une panne, ou une perte silencieuse de toutes les bases documentaires des clients de la bêta.

4. **Un document supprimé pendant son indexation continue de nourrir les réponses** (`src/document/handlers/index-document.handler.ts:29-31`, `src/document/document.service.ts:211-219`) — NOUVEAU
   - **What this is:** L'indexation attend la fin du job du moteur RAG (jusqu'à 5 min de polling), puis passe le document à `INDEXED`.
   - **Problem:** Si l'utilisateur supprime le document pendant ce temps, `deleteDocument` reçoit un 404 du moteur (pas encore indexé). Ce 404 est ignoré, puis le fichier S3 et la ligne en base sont supprimés. Ensuite le moteur termine et enregistre les vecteurs. `updateStatus` échoue (P2025), le job est retenté 5 fois sans rien nettoyer, et l'agent cite encore le document « supprimé ».
   - **Fix:** Dans `execute`, si l'`updateStatus(INDEXED)` échoue avec P2025, appeler `ragEngineService.deleteDocument(command.name, command.datasetId)` puis s'arrêter sans relancer d'erreur. Ajouter le cas au test du handler.
   - **If we skip it:** Un client retire un document confidentiel, et l'assistant continue d'en citer le contenu à ses utilisateurs.

5. **Changer d'email sans le vérifier permet de piéger un futur compte Google** (`src/users/users.service.ts:54-60`, `src/auth/auth.service.ts:170-178`) — reste ouvert de B-11 (2)
   - **What this is:** `PATCH /users/me` change l'email tout de suite, et `isEmailVerified` reste `true`. La connexion Google ouvre le compte qui porte l'email, quel que soit ce compte.
   - **Problem:** Un attaquant vérifié met `dg@client.com` (pas encore inscrit) comme email. Quand le vrai `dg@client.com` clique plus tard sur « Continuer avec Google », il entre dans le compte de l'attaquant et y importe ses documents. L'attaquant se reconnecte avec son mot de passe et lit tout.
   - **Fix:** Ne plus changer l'email directement : enregistrer le nouvel email dans une colonne `pendingEmail`, lui envoyer un code (réutiliser `generateAndSendVerificationToken`), et faire le changement seulement après ce code.
   - **If we skip it:** Prise de contrôle des données d'une entreprise sans aucune faille côté victime.

6. **`PATCH …/workflow/activate` permet de modifier ce qui tourne en production sans déployer** (`src/workflow/workflow.controller.ts:40-42`, `src/workflow/workflow.repository.ts:39-53`, `src/workflow/workflow.service.ts:75-82`) — NOUVEAU
   - **What this is:** Un déploiement fige un snapshot (instantané : une copie `isActive: false`, version N). La production exécute `findByVersion(agentId, N)`. Le brouillon, c'est le workflow `isActive: true`.
   - **Problem:** `activate` accepte n'importe quel workflow de l'agent, y compris le snapshot N. Ensuite, chaque sauvegarde du builder (`PATCH …/workflow`) réécrit ce snapshot. L'assistant en production exécute donc le brouillon tout de suite, et un rollback vers N ne ramène plus l'ancienne version. Le front n'appelle jamais `activate` (grep : seuls les tests e2e l'utilisent).
   - **Fix:** Supprimer la route, `WorkflowService.activate`, `WorkflowRepository.activate`, `ActivateWorkflowRequest` et leurs tests e2e (environ 50 lignes en moins).
   - **If we skip it:** Un brouillon à moitié fini part en production sans que personne l'ait déployé, et le journal des versions devient faux.

7. **Le blocage après 5 essais se contourne avec des requêtes en parallèle** (`src/auth/login-attempt.service.ts:23-33`, `src/auth/auth.service.ts:94-107`, `:186-211`, `src/auth/token.service.ts:69-89`) — NOUVEAU (B-42 parlait d'un autre problème : le déni de service)
   - **What this is:** Pour le login, le code de vérification et le code de reset (OTP : code à 6 chiffres reçu par email), on lit d'abord le compteur (`isBlocked`), on teste, puis on fait `INCR` en cas d'échec.
   - **Problem:** C'est une course « lire puis écrire » : 500 requêtes envoyées en même temps lisent toutes un compteur sous 5, avant le premier `INCR`. Le throttler limite à 5 requêtes par minute et par IP, et il garde ses compteurs en mémoire de chaque instance. Avec un lot d'IP, on teste des milliers de codes de reset par fenêtre de 15 min au lieu de 5.
   - **Fix:** Compter la tentative avant de vérifier : `const n = await redis.incr(key); if (n === 1) await redis.expire(key, ttl); if (n > max) throw …`, et remettre à zéro en cas de succès. Utiliser ce même appel aux trois endroits.
   - **If we skip it:** Le code de reset peut être deviné par force brute, ce qui donne la prise de contrôle du compte.

## Should fix

8. **La vérification d'email s'éteint si `NODE_ENV` n'est pas exactement `production`** (`src/auth/auth.service.ts:31`, `:86`, `:113`, `Dockerfile`, `.env.example:5`) — NOUVEAU
   - **What this is:** L'envoi du code d'inscription, l'obligation d'avoir un email vérifié et le cookie `Secure` dépendent tous de `NODE_ENV === 'production'`.
   - **Problem:** Le `Dockerfile` ne fixe pas `NODE_ENV`, et `.env.example` commence par `NODE_ENV=development`. Une image lancée avec un env copié de l'exemple accepte `POST /auth/register` avec `dg@client.com` et ouvre une session sans aucune preuve que l'email appartient à la personne. C'est aussi la porte d'entrée du piège du point 5.
   - **Fix:** Ajouter `ENV NODE_ENV=production` dans le `Dockerfile` (une ligne).
   - **If we skip it:** Une erreur de configuration au déploiement désactive sans bruit la vérification des comptes.

9. **Le quota de stockage se contourne en créant plus de bases** (`src/document/document.service.ts:77-78`, `src/document/document.repository.ts:112`, `src/plans/plans.config.ts`) — NOUVEAU
   - **What this is:** L'upload refuse un fichier si la base de connaissances dépasse 100 Mo.
   - **Problem:** Le quota est compté par dataset, et le nombre de datasets par workspace n'a pas de limite. 50 bases × 100 Mo = 5 Go, alors que le budget S3 demandé est de 20 € par an.
   - **Fix:** Compter la somme sur le workspace : `document.aggregate({ where: { dataset: { workspaceId } }, _sum: { size: true } })`, en passant `workspaceId` (déjà dans la route) à `ingestFile`.
   - **If we skip it:** Un seul compte gratuit peut faire exploser la facture de stockage.

10. **Supprimer son compte laisse les fichiers S3 et les vecteurs** (`src/users/user.repository.ts:59-80`) — reste ouvert de B-35 (corrigé seulement pour la suppression d'un dataset)
    - **What this is:** `DELETE /users/me` supprime le workspace en cascade dans la base.
    - **Problem:** La cascade ne touche que Postgres. Les fichiers S3 et les vecteurs du moteur RAG de tous les datasets restent. Le job `DATASET_CLEANUP_QUEUE`, qui sait déjà les supprimer, n'est appelé que par `DatasetService.delete`.
    - **Fix:** Dans `UsersService.delete`, appeler d'abord `datasetService.delete(id, workspaceId)` pour chaque dataset du workspace que l'utilisateur est seul à avoir, puis supprimer l'utilisateur.
    - **If we skip it:** Les documents d'un client qui a demandé la suppression de son compte restent stockés (RGPD).

11. **La durée de rétention ne supprime pas les questions des logs** (`src/retention/retention-cleanup.service.ts:22-29`) — reste ouvert de B-22
    - **What this is:** `Agent.retentionDays` doit limiter la durée pendant laquelle on garde les échanges des utilisateurs finaux.
    - **Problem:** La purge supprime les `Conversation`, mais pas les `AgentQueryLog`, qui gardent le texte de chaque question (500 caractères). Avec une rétention de 30 jours, les questions restent visibles pour toujours dans `…/runtime/query-logs` et `…/analytics/query-logs`.
    - **Fix:** Dans la même transaction, ajouter `agentQueryLog.deleteMany({ where: { agentId, createdAt: { lt: cutoff } } })`, ou au moins vider `query` à la place.
    - **If we skip it:** La promesse de rétention faite au client est fausse pour une partie des données personnelles.

12. **Des dépendances inutiles, et d'autres utilisées sans être déclarées** (`package.json:35,41,45-48,71-72,95`) — NOUVEAU (B-06 ne couvrait que Brevo)
    - **What this is:** Le code importe `bcryptjs` (`auth.service.ts:3`), `ioredis` (`redis.module.ts:3`) et `form-data` (`rag-execution.service.ts:6`).
    - **Problem:** Aucune de ces trois n'est dans `package.json`. Elles arrivent par d'autres paquets (`@types/bcryptjs`, un paquet de types obsolète ; `bullmq` ; `axios`), donc une mise à jour de ces paquets peut casser le build. À l'inverse, `bcrypt`, `@types/bcrypt`, `@types/bcryptjs`, `@prisma/adapter-pg` (version 7 pour un client Prisma 6), `@nestjs/mapped-types`, `@swc/cli`, `@swc/core` et `ts-loader` ne sont importés nulle part (vérifié par grep sur src, test et les fichiers de config).
    - **Fix:** Supprimer ces 8 paquets, et déclarer `bcryptjs`, `ioredis` et `form-data` aux versions déjà présentes dans `yarn.lock`.
    - **If we skip it:** Un jour, un `yarn upgrade` casse l'authentification ou l'indexation, et l'image Docker garde un module natif (`bcrypt`) qui ne sert à rien.

## Nice to have

13. **Le bus d'événements ne sert qu'à écrire des logs** (`src/lib/event-bus.ts`, `src/events/**`, émis dans `deployment.service.ts:50-60`, `index-document.handler.ts:35,55`, `agent-runtime.orchestrator.ts:90`) — NOUVEAU
    - **What this is:** Un `EventEmitter` global, 6 fichiers d'événements et 2 fichiers de listeners.
    - **Problem:** Les listeners font seulement `logger.log`, et `AGENT_QUERY_COMPLETED` n'a aucun listener. Environ 140 lignes ne servent qu'à appeler un logger, en passant par un intermédiaire.
    - **Fix:** Remplacer chaque `EventBus.emit` par un `this.logger.log(...)` à la même place, puis supprimer `lib/event-bus.ts`, `events/` et les hooks `onModuleInit` / `onModuleDestroy` des modules (et retirer la règle du CLAUDE.md).
    - **If we skip it:** Du code à lire et à maintenir pour rien.

14. **Méthodes mortes** (`src/agent-runtime/agent-query-log.repository.ts:45-84`, `src/credit/credit-transaction.service.ts:9-20`, `src/credit/credit-transaction.repository.ts:9-30`, `src/users/user.repository.ts:40-42`) — NOUVEAU
    - **What this is:** `getConsumptionByAgent`, `getConsumptionByWorkspace`, `CreditTransactionService.create` / `findAll` (et leur repository), et `UserRepository.findAll`.
    - **Problem:** Grep sur tout le dépôt : seules leurs propres specs les appellent. `workspace-stats.service.ts` refait déjà ce calcul de consommation.
    - **Fix:** Les supprimer avec leurs tests (environ 130 lignes).
    - **If we skip it:** Deux versions du calcul de consommation qui finiront par donner des chiffres différents.

15. **Les questions des utilisateurs finaux partent dans les logs d'erreur** (`src/exeptions/interceptor.service.ts:29`, `:37`) — NOUVEAU
    - **What this is:** Le logger HTTP retire volontairement la query-string (`app.module.ts:39-44`), parce que les routes SSE portent la question dans `?query=`.
    - **Problem:** Le filtre d'erreurs logge et renvoie `request.url` en entier. Un 429 (trop de requêtes) ou un 400 sur `/assistants/:id/stream?query=…` écrit donc la question en clair dans les logs.
    - **Fix:** Utiliser `request.url.split('?')[0]` aux deux endroits.
    - **If we skip it:** Des données personnelles se retrouvent dans les logs, contre la règle que le code se fixe lui-même.

16. **Deux lectures du même utilisateur à chaque requête** (`src/auth/strategies/jwt.strategy.ts:33`, `src/users/pipes/user-validation.pipe.ts:12`) — NOUVEAU
    - **What this is:** La stratégie JWT charge l'utilisateur pour vérifier qu'il existe, puis `CurrentUserPipe` le recharge.
    - **Problem:** Une requête SQL en trop sur presque toutes les routes.
    - **Fix:** Faire renvoyer `{ ...payload, user }` par `validate`, et faire lire `request.user.user` au pipe.
    - **If we skip it:** Un peu de charge base de données en plus, sans effet sur le résultat.

Écartés car mineurs : 3 (le retry de document accepté quel que soit son statut, une page `0` qui donne un 500 sur `runtime/query-logs`, et une collision de version, qui renvoie un 500, si on sauvegarde et déploie un workflow au même instant).

Constats du précédent audit encore ouverts sur `dev` et non répétés ici (toujours en décision humaine) : B-04 (cookie `SameSite=None` sans protection CSRF ; d'après le plan d'hébergement, `app.genrag.app` et `api.genrag.app` sont sur le même site, donc `sameSite: 'lax'` suffirait), B-15, B-16, B-19, B-20, B-21 (le playground débite toujours des crédits, alors que le CLAUDE.md dit le contraire), B-24, B-33, B-34 (crédits regagnés en supprimant puis recréant son compte), B-37, B-39, B-42 à B-47.

Verdict: Corriger d'abord 1 et 2 (des crédits gratuits sans limite), puis 3 avant tout déploiement de `dev` en production, puis 4 à 7.

Lean: -320 lignes, -8 dépendances possibles (et 3 dépendances à déclarer).

Not checked: le moteur RAG lui-même (ordre réel des événements `cost_summary` / `end`, et ce qu'il fait si on indexe deux fois le même fichier), les tests e2e (ils demandent `postgres_test` et Redis ; non lancés), le comportement réel de BullMQ et Redis sous panne, les données envoyées à Sentry, les fichiers `.env.production` et la config de déploiement réelle (absents du dépôt), la CI, le front (sauf des grep pour savoir quelles routes il appelle), et le détail des requêtes SQL de `agent-analytics`.
