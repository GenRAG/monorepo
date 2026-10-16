# Audit de `dev` — 16 octobre 2026

Commit audité : `904c1d3` (`origin/dev`, merge de #92), complété par le **connecteur Google Drive** (PR #93, `fcba1e8`), voir [`05_connecteur_google_drive.md`](05_connecteur_google_drive.md). Rien n'a été modifié dans le code : c'est un rapport.

## Méthode

- **`ponytail:ponytail-audit`** sur tout le repo, en 4 périmètres : back, front, package `workflow`, vitrine + racine (CI, Docker, scripts). Rapports détaillés : [`01_back.md`](01_back.md), [`02_front.md`](02_front.md), [`03_workflow.md`](03_workflow.md), [`04_vitrine_racine.md`](04_vitrine_racine.md).
- **Connecteur Google Drive (PR #93)** : `ponytail:ponytail-review` sur le diff `904c1d3..fcba1e8`, puis `pstack:interrogate` avec 4 relecteurs. Rapport : [`05_connecteur_google_drive.md`](05_connecteur_google_drive.md).
- **`pstack:interrogate`** sur le code risqué (auth, crédits, isolation entre clients, format `blocks`, migrations Prisma), avec 4 relecteurs indépendants. Le relecteur B devait tourner sur le modèle fable, qui n'avait plus de crédits d'usage. Il a donc tourné sur le modèle par défaut du relecteur A, ce que prévoit la règle de repli du skill. Synthèse et tri : [`interrogate.md`](interrogate.md), rapports bruts dans [`interrogate/`](interrogate/).
- Chaque constat retenu ci-dessous a été relu dans le code avant d'être gardé. Le marqueur « 4/4 », par exemple, donne le nombre de relecteurs qui l'ont trouvé indépendamment.
- Hors périmètre : `rag-engine/` (demandé) et `RAG-GenRag/` (absent du checkout). La copie `rag-engine/` n'a servi qu'à lire le contrat.
- L'audit précédent ([`AUDIT_REPORT.md`](../../../AUDIT_REPORT.md)) sert de référence : les ID `B-xx`, `F-xx`, `W-xx`, `R-xx` et `V-xx` qui suivent sont les siens.

## Décisions et corrections (mise à jour)

Décisions prises après l'audit :
- **Playground payant** (n° 3) : c'est la doc qui se trompait, pas le code.
- **Aucun document en prod** (n° 4) : la migration s'applique telle quelle, le constat est retiré.
- **Nouveau moteur poussé dans `dev`** (n° 6) : le back doit s'y aligner.
- **Fichiers mis à la corbeille dans Drive supprimés à la resynchro**, et indiqués dans le compte rendu (C2).
- **Route `activate` supprimée** (n° 10).

| Constat | Correction | PR |
|---|---|---|
| n° 6, contrat du moteur (`org_id` = workspace, `dataset_id`, `datasetIds`, `model_name`) | Aligne le back sur le nouveau `rag-engine` : indexation, suppression, recherche | [#95](https://github.com/GenRAG/monorepo/pull/95) |
| n° 1, bonus d'onboarding obtenu en boucle | Éligibilité lue dans le registre des crédits | [#94](https://github.com/GenRAG/monorepo/pull/94) |
| n° 2, réponse interrompue gratuite | Débit dès que le moteur a produit quelque chose, quel que soit le statut | [#96](https://github.com/GenRAG/monorepo/pull/96) |
| C1 et C2, resynchro Drive | Vérification avant suppression, suppression des fichiers à la corbeille | [#97](https://github.com/GenRAG/monorepo/pull/97) |
| n° 10, prod modifiable sans déploiement | Suppression de `PATCH …/workflow/activate` | [#98](https://github.com/GenRAG/monorepo/pull/98) |
| n° 3, playground | Doc alignée : le playground est débité | [#99](https://github.com/GenRAG/monorepo/pull/99) |
| n° 4, migration des datasets | Aucune, il n'y a pas de document en prod | — |

## Vérifications lancées sur `904c1d3`

| Périmètre | Lint | Typecheck | Tests | Build |
|---|---|---|---|---|
| `plateform_back` | OK | OK | 450/450 unitaires OK (467/467 sur `fcba1e8`, avec le connecteur) ; e2e vert en CI (run 421) | OK |
| `packages/workflow` | — | OK | 46/46 OK | OK |
| `plateform_front` | **42 erreurs** (`react/prop-types`, `components/charts/`), ignorées par la CI | OK | **aucun test** (`craco test` : « No tests found ») | vert en CI |
| `vitrine_front` | OK | OK | — | OK |

## Ce que fait le repo

GenRAG est un SaaS B2B : une entreprise crée des assistants IA qui répondent à partir de ses documents. Le front (React) sert à régler les agents, importer les documents, tester et déployer. Le back (NestJS) gère les comptes, les crédits et le stockage. Il envoie aussi le pipeline (`blocks`) au moteur RAG externe et renvoie la réponse en direct (SSE). Le package `@genrag/workflow` dessine et sérialise ce pipeline.

**Charge supposée** : une bêta fermée de 10 à 30 utilisateurs et 5 entreprises, sur une seule VM (`docs/demande_infrastructure_ecole.md`). J'ai aussi vérifié les requêtes en parallèle (plusieurs onglets, plusieurs utilisateurs finaux), et ce qui casserait avec une deuxième instance de l'API.

## Must fix

1. **Crédits gratuits sans limite par l'onboarding** (`plateform_back/src/onboarding/onboarding.service.ts:60`, `prisma/schema/onboarding.prisma:14`). NOUVEAU, trouvé par 3 relecteurs.
   - **Ce que c'est :** le premier `POST …/onboarding/start` crée un agent de démo et offre 20 crédits, si le workspace n'a encore aucune session d'onboarding.
   - **Problème :** la session est supprimée en cascade avec l'agent de démo. On supprime l'agent, on rappelle `start`, et le compteur repasse à 0 : 20 crédits de plus. Deux requêtes par tour, sans fin.
   - **Correction :** décider du bonus d'après le registre des crédits (une `CreditTransaction` avec `source: 'onboarding_bonus'` existe-t-elle déjà ?), plus d'après les sessions. Ajouter un test « supprimer la démo puis relancer `start` ne crédite pas deux fois ».
   - **Si on ne fait rien :** n'importe quel compte gratuit s'offre autant d'appels LLM qu'il veut, et c'est la plateforme qui paie.

2. **Couper la connexion avant la fin donne une réponse gratuite** (`agent-runtime/streaming/rag-stream-forwarder.service.ts:32-38`, `credit/usage-tracker.service.ts:34`). Suite de B-36, trouvé par 4/4 relecteurs et par ponytail.
   - **Ce que c'est :** quand le navigateur se déconnecte, l'événement `close` enregistre la requête.
   - **Problème :** `close` est toujours noté `ERROR`, et seuls les `SUCCESS` sont débités. Un script lit tout le texte puis coupe juste avant `end` : il a la réponse entière et ne paie rien. C'est pareil pour une erreur du moteur arrivée après des tokens.
   - **Correction :** débiter dès qu'un coût est connu ou qu'un texte a été produit, et garder le statut pour les statistiques. Ajouter un test « des tokens, puis `close` » qui attend un débit.
   - **Si on ne fait rien :** le solde de crédits ne protège plus rien.

3. **Le playground débite des crédits et se bloque à 0, alors que la doc le dit gratuit** (`agent-runtime/agent-runtime.service.ts:38-44`). B-21 toujours ouvert, 4/4. **Décision humaine requise** (le comportement attendu n'est pas clair).
   - **Ce que c'est :** `playgroundStream` ne passe pas `skipUsageTracking`.
   - **Problème :** les `CLAUDE.md` racine et back disent « sans crédits », mais le code vérifie le solde et débite. Un test unitaire (`agent-runtime.service.spec.ts:113-127`) fige même ce débit. Un client à 0 crédit ne peut plus tester son agent.
   - **Correction :** choisir. Soit `skipUsageTracking: true` avec une limite de requêtes à part, et on inverse le test. Soit on corrige la doc et le texte du front.
   - **Si on ne fait rien :** la doc et le produit se contredisent, et les clients sont facturés pour leurs essais.

4. **La migration des datasets plante le premier déploiement de `dev` en prod** (`prisma/schema/migrations/20261005224546_add_dataset_model/migration.sql:19-20`). NOUVEAU, 4/4. **Décision humaine requise** (migration).
   - **Ce que c'est :** `main` s'arrête à la migration `20260907…`, où les documents ont encore un `agentId`. Le conteneur lance `prisma migrate deploy` avant de démarrer.
   - **Problème :** la migration supprime `agentId` et ajoute `"datasetId" TEXT NOT NULL` sans valeur par défaut. Prisma le dit lui-même dans le fichier : c'est impossible sur une table non vide. Si `Document` a des lignes en prod, l'API ne démarre plus. Et même avec un contournement manuel, les vecteurs déjà indexés (`org_id = agentId`) ne sont plus jamais cherchés.
   - **Correction :** avant toute mise en prod, la réécrire en trois temps. D'abord ajouter la colonne en nullable. Puis créer un `Dataset` par agent, avec `id = agent.id` pour que les vecteurs restent valides, le remplir et le lier. Enfin passer en `NOT NULL` et supprimer `agentId`. La tester sur une copie du schéma de `main` qui contient des lignes.
   - **Si on ne fait rien :** soit une panne au déploiement, soit les bases documentaires des clients de la bêta perdues sans bruit.

5. **Changer d'e-mail sans vérification permet de prendre un compte** (`users/users.service.ts:53-66`, `auth/auth.service.ts:168-178`). B-11 (2) toujours ouvert, 4/4.
   - **Ce que c'est :** `PATCH /users/me` change l'e-mail tout de suite et garde `isEmailVerified: true`. La connexion Google ouvre le compte qui porte cet e-mail. Les invitations à un agent cherchent aussi l'utilisateur par e-mail.
   - **Problème :** un attaquant met `dg@client.com` comme e-mail. Quand le vrai `dg@client.com` clique plus tard sur « Continuer avec Google », il entre dans le compte de l'attaquant et y importe ses documents. Une invitation envoyée à cette adresse donne aussi accès à l'agent invité.
   - **Correction :** enregistrer le nouvel e-mail dans un champ `pendingEmail`, envoyer un code à cette adresse, et ne faire le changement qu'après le code. En attendant, retirer `email` de `UpdateProfileRequest`.
   - **Si on ne fait rien :** une prise de contrôle des données d'une entreprise sans aucune faille côté victime.

6. **Le contrat `blocks` ne correspond pas à la copie du moteur** (`plateform_back/src/rag-engine/pipeline.schema.ts:8-22`, `packages/workflow/src/utils/serialize.ts:19`, `rag-engine/app/schemas/rag.py:14`). NOUVEAU, trouvé par 4/4 et par ponytail. **Décision humaine requise** (contrat entre services, à vérifier contre le moteur de prod).
   - **Ce que c'est :** le back envoie le pipeline au moteur RAG.
   - **Problème :** il y a deux écarts.
     - Le block `query_rewrite` envoie `model`, alors que la copie du moteur lit `model_name`. Pydantic jette le champ sans erreur, donc le modèle de reformulation choisi est ignoré.
     - L'isolation entre clients repose sur `retrieve.org_ids`, que ni `BLOCKS_FORMAT.md` ni la copie du moteur ne connaissent. Ils filtrent sur un `org_id` unique, et ne filtrent plus du tout quand il est nul.

     La copie `rag-engine/` date de juillet et le moteur de prod (`RAG-GenRag`) n'est pas dans le repo, donc je ne peux pas conclure.
   - **Correction :** comparer avec `RAG-GenRag`. Ensuite, garder un seul contrat écrit (renommer en `model_name` au seul endroit qui parle au moteur, documenter `org_ids`, retirer l'`org_id` du haut), et ajouter un test de contrat.
   - **Si on ne fait rien :** au mieux un réglage décoratif. Au pire, si le moteur de prod ignore `org_ids`, une recherche qui couvre les documents de tous les clients.

7. **La touche Retour arrière casse la chaîne du workflow** (`packages/workflow/src/graph/create-flow-node.ts:19-20,65`, `plateform_front/src/pages/Agents/Workflow/index.tsx:111`). NOUVEAU (ponytail, prouvé avec `getElementsToRemove` de ReactFlow).
   - **Ce que c'est :** ReactFlow supprime le node ou l'edge sélectionné avec Retour arrière, sauf `deletable: false`.
   - **Problème :** les nodes optionnels ajoutés (Reformulation, Classement), les nodes de réglage et tous les edges sont supprimables. On sélectionne un edge, on appuie sur Retour arrière, et le pipeline sauvegardé ne contient plus que `[query]`. Le node « Modèle IA » supprimé fait aussi passer la réponse au modèle par défaut sans prévenir.
   - **Correction :** `deleteKeyCode={null}` sur les deux `<ReactFlow>`. Toutes les suppressions voulues passent déjà par des boutons.
   - **Si on ne fait rien :** une seule touche produit un agent qui ne répond plus, et il est sauvegardé puis déployé.

8. **Le blocage après 5 essais (mot de passe, codes) se contourne** (`auth/login-attempt.service.ts:23-34`, `auth/auth.service.ts:94-115`). NOUVEAU (B-42 parlait du déni de service), 4/4.
   - **Ce que c'est :** le login et les codes de vérification et de reset partagent un compteur par e-mail. On le lit, puis on teste, puis on fait `INCR` en cas d'échec.
   - **Problème :** cent requêtes envoyées en même temps lisent toutes un compteur sous 5. En plus, un login réussi remet le compteur à zéro avant de vérifier l'e-mail. Les limites par IP du throttler sont en mémoire, donc propres à chaque instance. Résultat : le code de reset à 6 chiffres peut être deviné par force brute.
   - **Correction :** incrémenter avant de comparer (`INCR` puis `EXPIRE` en un seul appel), un compteur par flux, et une remise à zéro seulement après le succès complet.
   - **Si on ne fait rien :** prise de contrôle d'un compte par le reset du mot de passe.

9. **Un document supprimé pendant son indexation reste cherchable** (`document/handlers/index-document.handler.ts:22-38`, `document/document.service.ts:211-225`). NOUVEAU, 4/4.
   - **Ce que c'est :** l'indexation attend la fin du job du moteur (jusqu'à 5 minutes).
   - **Problème :** une suppression pendant ce temps reçoit un 404, que le code ignore. Le fichier et la ligne en base sont supprimés, puis le moteur termine et enregistre les vecteurs. L'agent cite alors un document « supprimé ». Autre problème : `retry` ne vérifie pas le statut, donc il peut réindexer en double un document déjà indexé.
   - **Correction :** si `updateStatus(INDEXED)` échoue en P2025, supprimer les vecteurs du document et s'arrêter. N'autoriser `retry` que sur `FAILED`.
   - **Si on ne fait rien :** un client retire un document confidentiel, et l'assistant continue d'en citer le contenu.

10. **On peut modifier ce qui tourne en prod sans déployer** (`workflow/workflow.controller.ts:40-43`, `deployment/deployment.service.ts:93-118`). NOUVEAU, 3/4 et ponytail.
    - **Ce que c'est :** un déploiement fige un snapshot (une copie du workflow à la version N), et la prod exécute cette version N.
    - **Problème :** `PATCH …/workflow/activate` accepte aussi le snapshot N. La sauvegarde suivante du builder réécrit alors la prod en place, sans aucune trace de déploiement. Le front n'appelle jamais `activate` : seuls les tests e2e l'utilisent. De son côté, `rollback` écrase le brouillon en cours, hors transaction.
    - **Correction :** supprimer la route `activate` (environ 50 lignes), et refuser de modifier une version qu'un déploiement référence.
    - **Si on ne fait rien :** un brouillon à moitié fini part en prod, et le journal des versions devient faux.

11. **Changer de conversation pendant une réponse ramène sur l'ancienne** (`plateform_front/src/pages/Assistant/Assistant.tsx:57-66`). NOUVEAU (ponytail front).
    - **Ce que c'est :** à la fin d'une réponse, l'ID de conversation renvoyé par le serveur est écrit dans l'état sans autre contrôle.
    - **Problème :** je pose une question dans A, puis j'ouvre B. Quand A finit, l'écran rebascule sur A alors que l'URL indique B, et ma question suivante part dans A. Une nouvelle conversation ne met pas non plus l'URL à jour, donc un F5 la fait disparaître.
    - **Correction :** garder l'ID de départ, ne rien mettre à jour si l'utilisateur a changé de conversation, et faire `navigate(..., { replace: true })` pour une nouvelle conversation.
    - **Si on ne fait rien :** l'utilisateur final lit et écrit dans la mauvaise conversation.

12. **Une modification de la vitrine peut casser le build de l'app sans que la CI le voie** (`.github/workflows/jobs.yml:29-33`, `plateform_front/craco.config.js`). NOUVEAU. **Décision humaine requise** (CI).
    - **Ce que c'est :** le job `frontend` ne tourne que si `plateform_front/**`, `packages/**` ou `yarn.lock` changent.
    - **Problème :** l'app compile une trentaine de fichiers de `vitrine_front/src` par l'alias `@vitrine`. Une PR qui ne touche que la vitrine passe au vert, puis Vercel échoue après le merge. Les deux projets utilisent en plus deux versions de `lucide-react` (1.48 et 0.542).
    - **Correction :** ajouter `'vitrine_front/src/**'` au filtre `frontend`, et aligner `lucide-react`.
    - **Si on ne fait rien :** la prod de l'app ne se déploie plus, et on ne le voit qu'après le merge.

## Should fix

13. **Le débit n'est pas idempotent, le solde peut descendre sans limite, et il n'y a pas de registre** (`agent-runtime/usage/runtime-usage-recorder.ts:18-30`, `credit/usage-tracker.service.ts:36-69`). 4/4.
    - **Problème :** il y a quatre défauts.
      - Les jobs BullMQ n'ont pas de `jobId` : un job rejoué après un crash débite deux fois.
      - Le solde est vérifié au début et débité à la fin : N requêtes en parallèle passent toutes.
      - L'usage n'écrit aucune `CreditTransaction{USAGE}`, et les logs disparaissent avec l'agent : le solde n'est plus vérifiable.
      - `enableShutdownHooks()` n'est jamais appelé : un redéploiement pendant une réponse perd son débit.
    - **Correction :** un `requestId` par requête, utilisé comme `jobId` et comme clé unique d'une ligne `USAGE` écrite dans la même transaction. Optionnellement, réserver une estimation avant l'appel.

14. **Le pipeline n'est validé qu'au moment de la question** (`workflow/dto/create-workflow.request.ts:23`, `deployment/deployment.service.ts:74-80`, `agent-runtime/agent-runtime.builder.ts:44-90`). 4/4, lié à B-28.
    - **Problème :** `definition` est acceptée comme n'importe quel objet, et le déploiement ne vérifie que les placeholders. Un pipeline invalide arrive en prod et chaque utilisateur final reçoit un 422 qui affiche le détail Zod. `collection_name` (n'importe quelle collection Qdrant) et `top_k` (sans maximum) viennent du client. Si aucun dataset ne correspond, l'étape de recherche est retirée sans rien dire : l'agent répond sans documents et c'est facturé.
    - **Correction :** valider avec `PipelineSchema` à la sauvegarde et au déploiement, fixer `collection_name` côté serveur, borner `top_k` à 100, et refuser une requête sans dataset.

15. **Le flux SSE n'est jamais fermé quand on quitte la page** (`plateform_front/src/hooks/chat/useSSEStream.ts:41-91`). NOUVEAU.
    - **Problème :** l'`EventSource` reste ouvert jusqu'à la fin de la réponse, même si on change de page. La réponse continue d'être générée, et chaque flux compte dans la limite de 20 requêtes par minute.
    - **Correction :** garder les `EventSource` dans un `useRef` et les fermer au démontage. **À faire après le 2**, sinon fermer le flux rend la réponse gratuite.

16. **Une session expirée laisse l'app ouverte mais cassée** (`plateform_front/src/services/api.ts:26-35`). NOUVEAU.
    - **Problème :** aucun 401 n'est géré. Après les 7 jours du JWT, ou une déconnexion dans un autre onglet, l'app affiche des erreurs partout et ne renvoie jamais vers `/login`.
    - **Correction :** dans `baseQueryWithErrorUnwrap`, sur un 401 hors `/auth/`, invalider le tag `Users`. `PrivateRoute` redirige alors vers `/login` (3 lignes).

17. **La CI protège peu de choses** (`.github/workflows/jobs.yml`). R-02 et W-06 toujours ouverts. **Décision humaine requise** (CI).
    - **Problème :** le lint du front a `continue-on-error: true` et le script lance `--fix`. Le front n'a aucun test. Les 46 tests du package (contrat `blocks`, core sans React) ne tournent pas en CI. La vitrine n'a pas de job. Le job `frontend` n'a pas de `timeout-minutes`, et chaque PR tourne deux fois (pas de `concurrency`).
    - **Correction :**
      - Désactiver `react/prop-types` pour les `.tsx` (le lint tombe alors à 0 erreur), puis retirer `continue-on-error`.
      - Ajouter `yarn --cwd packages/workflow test` dans le job front.
      - Créer un job `vitrine`.
      - Ajouter un test du décodeur SSE et de `baseQuery`.

18. **Le dev local ne marche pas comme la doc le décrit** (`docker-compose.yml:85-86`, `plateform_back/.env.example:12`, `scripts/dev.sh:25-35`). NOUVEAU. **Décision humaine requise** (infra et scripts).
    - **Problème :** il y en a deux.
      - Avec le `.env` copié de l'exemple, le container `server` cherche Postgres sur `localhost` : Prisma échoue, et `migrate.sh` aussi.
      - `dev.sh e2e` appelle `bash` dans une image Alpine qui n'en a pas. Il ne démarre pas `server`, et il n'a pas de `set -e`, donc des tests peuvent tourner sur une base vide.
    - **Correction :**
      - Mettre `DATABASE_URL` vers `postgres:5432` dans le `environment:` de `server`.
      - Ajouter `set -euo pipefail` à `dev.sh`.
      - Remplacer `bash -lc` par `sh -c`.
      - Remplacer `sleep 5` par `up -d --wait`.

19. **La déconnexion ne supprime pas le cookie en prod, et les e-mails des invités ne sont pas normalisés** (`auth/auth.controller.ts:70-78`, `auth/auth.service.ts:57-70`, `agent/agent-member.service.ts:8`). 3/4.
    - **Problème :**
      - `clearCookie` n'a pas les options `Secure` et `SameSite=None` utilisées pour poser le cookie, donc le navigateur le garde.
      - La mise en liste noire est dans un `catch {}` : si Redis tombe, la session reste valide.
      - Le logout lit le jeton avec `decode`, sans vérifier sa signature.
      - L'invitation `Bob@Corp.com` répond « aucun compte ».
    - **Correction :**
      - Partager un seul objet d'options de cookie pour poser et supprimer.
      - Ne pas avaler les erreurs Redis.
      - Mettre l'e-mail des invitations en minuscules.

20. **Données personnelles et RGPD** : plusieurs constats du même sujet. Tous sont des **décisions humaines** sur le fond.
    - **Problème :**
      - La rétention ne purge pas `AgentQueryLog.query`, qui garde le texte de chaque question (B-22).
      - Supprimer son compte laisse les fichiers S3 et les vecteurs (B-35).
      - Le filtre d'erreurs écrit l'URL complète (`?query=…`) dans les logs (5 sources).
      - Mixpanel envoie le nom et l'e-mail sans consentement (F-10).
      - L'aperçu Word passe par Microsoft (F-08).
      - La vitrine n'a ni mentions légales ni information RGPD sous le formulaire (V-02, V-03).
      - L'interrupteur « Logs API détaillés » ne change rien côté serveur (F-11).
    - **Correction :** voir chaque rapport détaillé. Le filtre d'erreurs (`request.url.split('?')[0]`) et l'interrupteur factice se corrigent sans décision.

Constats laissés hors de cette liste, environ 70, détaillés dans les rapports par périmètre. Les principaux :
- `NODE_ENV` contrôle seul la vérification d'e-mail et le cookie `Secure`.
- Le quota de stockage est compté par dataset et non par workspace.
- Le throttler est par IP et en mémoire.
- `sanitizeWorkflowEdges` ne retire pas les orphelins.
- `WorkflowViewer` ignore le registre.
- Une instruction non validée passe la garde de sauvegarde.
- Le cache RTK n'est pas vidé à la suppression du compte.
- `beforeunload` n'est pas géré dans le builder.
- Il manque des index (B-24).
- La CSRF n'est pas protégée (B-04).
- Les JWT ne sont pas révoqués au changement de mot de passe (B-19).

## Connecteur Google Drive (PR #93)

Détail et preuves dans [`05_connecteur_google_drive.md`](05_connecteur_google_drive.md). Le connecteur est bien isolé : pas de SSRF, pas d'accès entre clients, jeton jamais enregistré, validation commune avec l'upload. Quatre points comptent :

- **C1 (Must fix) La resynchro supprime avant de vérifier.** L'ancien document est supprimé avant que `ingestFile` vérifie la nouvelle version (nom, quota, signature). Un renommage en conflit fait disparaître le document de l'agent. Trouvé par 4/4.
- **C2 (Must fix) Corbeille non détectée.** `trashed` n'est pas demandé à Drive, donc un fichier à la corbeille reste indexé et compté « à jour ». Trouvé par 3/4.
- **C3 (Should fix) Titres coupés.** `sanitizeFilename` applique `basename`, donc « CR 12/03/2026 » devient `2026.pdf`, et les imports suivants sont refusés comme doublons.
- **C4 (Should fix) Jeton dans Sentry.** Le corps des requêtes, donc le jeton Google, est envoyé à Sentry sur toute erreur 500, d'après le SDK 10.62 (`patchRequestToCaptureBody`). C'est une ligne dans `Sentry.init`, et elle couvre aussi les mots de passe de `/auth`.

Il reste cinq autres constats à corriger (jeton expiré, absence de timeout, mauvais messages 403, analytics couplées au runtime, tests) et quatre plus légers.

## Ordre de correction proposé

1. **Avant tout déploiement de `dev` en prod :** 4 (migration), puis 6 (vérifier le contrat contre `RAG-GenRag`).
2. **Argent et comptes :** 1, 2, puis 15, 5, 8, puis 13. Trancher 3 (playground).
3. **Connecteur :** C1 et C2 avant d'ouvrir la fonction aux clients, puis C3 et C4.
4. **Intégrité des données :** 7, 9, 10, 14.
5. **Front :** 11, 16.
6. **Outils :** 12, 17, 18 (décisions CI et infra).
7. **Nettoyage :** voir Lean.

## Verdict

**La base est saine**, et les corrections de l'audit précédent tiennent : CI verte, 450 + 46 tests, `tsc` partout, isolation par workspace vérifiée sur toutes les routes, SQL paramétré, Markdown de l'IA sûr. Mais il faut **corriger d'abord 1 et 2 (crédits gratuits sans limite) et 4 (migration) avant de mettre `dev` en production.**

**Lean : environ −3 500 lignes et −17 dépendances possibles.**

| Périmètre | Lignes | Ce qui est concerné |
|---|---|---|
| Front | −2 950 | Code mort |
| Back | −320 | Bus d'événements qui ne sert qu'à logger, méthodes mortes, route `activate` |
| Package `workflow` | −110 | `CreateFlowNode`, `createSettingPlaceholders`, `useAppResponsive` |
| Vitrine | −55 | Système `data-scrub` |

S'y ajoutent `vitrine_front/_archive/` (1,1 Mo), 4 lockfiles périmés et ces dépendances :

| Périmètre | Dépendances |
|---|---|
| Front | 9 (`@stripe/*`, `chart.js`, `motion`…) |
| Back | 8, et 3 utilisées sans être déclarées |

## Ce qui n'a pas été vérifié

- Le moteur de prod (`RAG-GenRag`, absent) : les constats 6 et 9 et l'ordre réel `cost_summary` / `end` sont donc vérifiés seulement contre la copie de juillet.
- Les e2e en local (la CI les passe). L'app n'a pas été lancée dans un navigateur : les constats 7 et 11 viennent du code et d'un script ReactFlow, pas d'un clic.
- L'état réel des migrations en prod, les réglages Vercel, les `.env` de prod, et les secrets dans tout l'historique git (le clone est superficiel).
- En détail : `components/charts/` (code vendu), `agent-analytics` (SQL), et les écrans d'animation du builder.
