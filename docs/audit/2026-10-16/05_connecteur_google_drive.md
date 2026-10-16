# Connecteur Google Drive (PR #93) : `ponytail:ponytail-review` + `pstack:interrogate`

Diff relu : `904c1d3..fcba1e8` (`feat(connector)` ec01db9, `fix(analytics)` 11a81e0, `fix(ingestion)` dc6fd35). Il touche 35 fichiers (+1119 / −99). Je n'ai rien modifié.

## Méthode

- **`ponytail:ponytail-review`** : relecture du diff et du code qu'il appelle (guards, `DocumentService`, filtre d'erreurs, Sentry, pino).
- **`pstack:interrogate`** : 4 relecteurs indépendants, A (opus), B (opus en repli, car le modèle fable n'avait plus de crédits), C (sonnet) et D (haiku). Leurs rapports bruts sont dans [`interrogate/connecteur-relecteur-*.md`](interrogate/).
- Chaque constat ci-dessous a été relu dans le code. Quand A et D contredisaient B sur Sentry, j'ai lu le code du SDK pour trancher.

## Vérifications sur `fcba1e8`

- **Back** : `tsc` OK, lint OK, **467/467 tests unitaires** (450 avant, plus 17 tests du connecteur).
- **Front** : `tsc` OK. Le lint est inchangé : toujours 42 erreurs `react/prop-types`, déjà dans les charts.
- **Pas vérifié** : le vrai Google Picker et la vraie popup OAuth, ni les e2e en local.

## Ce que fait le changement

Un membre du workspace choisit des fichiers dans le Google Picker, avec un jeton OAuth court au scope `drive.file`. Le front envoie ce jeton et les id de fichiers au back. Le back récupère les métadonnées Drive, puis télécharge le fichier, ou l'exporte en PDF pour Docs et Slides. Il l'enregistre ensuite comme `Document` du dataset (`source: GOOGLE_DRIVE`, `externalId`, `externalModifiedAt`) et met l'indexation en file d'attente. La resynchro réimporte les fichiers modifiés dans Drive.

Le changement fait aussi trois autres choses :
- la validation du type, de la taille et de la signature passe du contrôleur à `ingestFile`, pour s'appliquer à toutes les sources ;
- la carte « santé des documents » se base désormais sur les bases du workflow déployé ;
- la requête de suivi des jobs d'indexation envoie maintenant `X-API-Key`.

**Bien fait, et vérifié :**
- **Pas de SSRF** (une requête que le serveur enverrait vers une adresse choisie par l'attaquant) : l'hôte Drive est fixe, et les `fileIds` passent `^[\w-]+$` puis `encodeURIComponent`.
- **Pas d'accès entre clients** : les deux routes passent par `JwtAuthGuard`, `WorkspaceMemberGuard` et `DatasetBelongsToWorkspaceGuard`, et chaque requête est limitée au `datasetId`.
- **Jeton jamais enregistré** : ni en base, ni dans les logs pino.
- **Doublons bloqués** par l'index unique `(datasetId, source, externalId)`.
- **Resynchro sans effet si rien n'a changé.**
- **Pas de resynchro pendant l'indexation** : un document `UPLOADED` ou `PROCESSING` est sauté.
- **Validation commune à toutes les sources**, et l'upload manuel garde le même comportement.
- **`X-API-Key` sur le suivi des jobs** : cela corrige un point du relecteur A dans l'audit de `dev`.

## Must fix

1. **La resynchro supprime le document avant de vérifier que la nouvelle version passe** (`plateform_back/src/connector/connector.service.ts:92-97`, `document/document.service.ts:79-101`). Trouvé par 4/4 relecteurs et par ponytail.
   - **Ce que c'est :** pour un fichier modifié dans Drive, la resynchro télécharge la nouvelle version, supprime l'ancien document (vecteurs, S3, ligne en base), puis appelle `ingestFile`.
   - **Problème :** avant la suppression, seules les métadonnées Drive (type, taille) sont vérifiées. `ingestFile` peut encore refuser le fichier, et l'ancien document est alors déjà perdu. Il refuse un fichier vide, une signature qui ne correspond pas, un quota dépassé ou un nom déjà pris. Cas concret : on renomme `Notes` en `Rapport` dans Drive, alors qu'un `Rapport.pdf` existe déjà dans la base. La resynchro supprime `Notes`, puis échoue sur le nom. Le document disparaît de l'agent, et la resynchro suivante ne le voit plus. Le commentaire `shortcut:` présente ce cas comme rare, mais le constat 3 le rend courant.
   - **Correction :** sortir les vérifications de `ingestFile` dans un `assertIngestable(datasetId, file, { replacing: doc })` : fichier vide, taille, signature, quota calculé comme `utilisé − ancien + nouveau`, nom en excluant `doc.id`. L'appeler avant la suppression. Ajouter le test « renommage en conflit ».
   - **Si on ne fait rien :** une resynchro peut retirer en silence des documents de l'agent déployé.

2. **Un fichier mis à la corbeille Drive reste indexé et compté « à jour »** (`connector/google-drive.client.ts:5`, `connector.service.ts:85-90`). Trouvé par 3/4 (A, B, C).
   - **Ce que c'est :** `FILE_FIELDS` ne demande pas `trashed`.
   - **Problème :** Drive répond 200 pour un fichier à la corbeille, qui est la façon normale de supprimer dans Drive. La resynchro le classe « déjà à jour », et l'agent continue de répondre avec. Un fichier supprimé définitivement (404) reste lui aussi indexé, signalé en échec à chaque resynchro.
   - **Correction :** ajouter `trashed` à `FILE_FIELDS` et le traiter comme un 404. Décider ensuite, explicitement, si un fichier source disparu supprime le document ou le signale seulement. C'est une **décision produit**.
   - **Si on ne fait rien :** un client met un document confidentiel à la corbeille, et l'assistant continue de le citer.

## Should fix

3. **Les titres Drive qui contiennent `/` sont coupés** (`plateform_back/src/lib/filename.util.ts:3`, `google-drive.client.ts:59`). Trouvé par B, vérifié.
   - **Ce que c'est :** `sanitizeFilename` applique `basename`, conçu pour un chemin de fichier.
   - **Problème :** « CR 12/03/2026 » et « Point 19/03/2026 » deviennent tous les deux `2026.pdf`, et le second import est refusé comme doublon. Les accents deviennent aussi des `_`. Un titre Drive n'est pas un chemin, et les dates en `/` sont courantes.
   - **Correction :** pour les connecteurs, remplacer `/` par `-` au lieu de prendre le `basename`. Ou mieux, nommer le fichier côté moteur et S3 d'après l'id du document, et garder le titre d'origine pour l'affichage.

4. **Le jeton Google part dans Sentry à la moindre erreur 500** (`connector/dto/google-drive.request.ts`, `sentry/instrument.ts`, `exeptions/interceptor.service.ts`). Trouvé par B et C. A et D disaient le contraire, j'ai tranché en lisant le SDK.
   - **Ce que c'est :** le jeton OAuth est dans le corps JSON de la requête.
   - **Problème :** dans `@sentry/core` 10.62, `patchRequestToCaptureBody` capture le corps des requêtes entrantes jusqu'à 10 Ko par défaut (`maxRequestBodySize: "medium"`). `requestdata` le joint toujours à l'événement (`data: true`), et `httpBodies: []` ne bloque pas cette capture. Toute erreur 500 sur ces routes, par exemple une erreur Prisma, envoie donc `{ accessToken }` à Sentry. Le filtrage côté serveur de Sentry le masque peut-être (la clé contient « token »), mais rien dans le repo ne le garantit. Les mots de passe des routes `/auth/*` sont dans le même cas, c'est antérieur à cette PR.
   - **Correction :** `httpIntegration({ ignoreIncomingRequestBody: () => true })` dans `Sentry.init`, ou un `beforeSend` qui retire `request.data`. Une ligne qui couvre aussi `/auth`.
   - **Si on ne fait rien :** un jeton d'accès Drive valide 1 heure peut se retrouver chez un tiers.

5. **Un jeton expiré en cours de lot efface le compte rendu de ce qui a déjà été fait** (`connector.service.ts:117-119`). Trouvé par 4/4.
   - **Problème :** `DriveAccessExpiredException` est relancée dans la boucle, donc la réponse est un 400 sans aucun compte. Les fichiers déjà importés, ou déjà remplacés pendant une resynchro, ne sont pas signalés. RTK Query n'invalide pas les tags quand une mutation échoue, donc la liste ne se rafraîchit pas : après une resynchro, elle montre d'anciennes lignes qui donnent un 404. Une nouvelle tentative répond « Déjà importé » pour tout.
   - **Correction :** arrêter la boucle mais renvoyer le résultat partiel avec `expired: true`, en marquant les fichiers restants. Garder le 400 seulement si rien n'a été traité.

6. **Pas de délai maximal sur les appels Drive, et une resynchro sans limite dans une seule requête HTTP** (`google-drive.client.ts:56,66`, `connector.service.ts:77-101`). Trouvé par 4/4.
   - **Problème :** `fetch` n'a pas de `signal`, et le corps est lu en entier par `arrayBuffer()`. La resynchro parcourt tous les documents Drive de la base, environ 2 appels Drive par document, dans la même requête. Le commentaire « au-delà de ~100 » n'est pas appliqué. Si le proxy coupe, le serveur continue à supprimer et réimporter alors que l'utilisateur voit une erreur. Deux resynchros en parallèle produisent de faux échecs « Document not found ».
   - **Correction :** `signal: AbortSignal.timeout(60_000)` sur chaque appel, et un plafond de documents par resynchro. À terme, un job BullMQ par dataset, comme le prévoient déjà les commentaires `shortcut:`.

7. **Toutes les erreurs 403 de Drive affichent « supprimé ou plus partagé »** (`google-drive.client.ts:68-71`). Trouvé par 4/4.
   - **Problème :** Drive renvoie aussi un 403 pour d'autres raisons, sans rapport avec un fichier supprimé :
     - une limite de débit (`rateLimitExceeded`) ;
     - un export trop gros (`exportSizeLimitExceeded`, un Doc dont le PDF dépasse 10 Mo) ;
     - un téléchargement bloqué par le propriétaire.

     L'utilisateur reçoit une fausse raison. Sur une limite de débit, la boucle continue d'appeler Drive pour tous les fichiers restants. Un 429 tombe dans « Erreur inattendue ».
   - **Correction :** lire `error.errors[0].reason` dans la réponse. Donner un message à part pour l'export trop gros, et arrêter le lot sur une limite de débit.

8. **Les analytics importent tout le module du runtime pour lire une liste de datasets** (`agent-analytics/agent-analytics.module.ts:13`, `agent-runtime/agent-runtime.builder.ts:55-75`). Trouvé par 4/4.
   - **Problème :**
     - `resolveDatasetIds` ne construit aucun pipeline, mais il vit sur `RagPipelineBuilder`. `AgentAnalyticsModule` importe donc tout `AgentRuntimeModule` (contrôleur, file d'usage, crédits).
     - La carte de santé interroge cette route toutes les 5 s pendant une indexation, et chaque appel recharge la définition complète du workflow.
     - Un document bloqué en `UPLOADED` fait tourner cette interrogation sans fin.
   - **Correction :** déplacer `loadRawBlocks` et `resolveDatasetIds` dans `DatasetService` ou `WorkflowService`, et retirer l'import. Arrêter l'interrogation après quelques minutes.

9. **Il manque les tests des chemins qui perdent des données** (`connector/test/connector.service.spec.ts`). Trouvé par 4/4.
   - **Problème :**
     - le seul test d'échec de resynchro casse au téléchargement, donc avant la suppression : c'est le cas sans danger ;
     - rien ne teste un import refusé après la suppression, un fichier à la corbeille, ni un jeton expiré après un succès partiel ;
     - `ConnectorController` n'a aucun test, donc les guards et les limites du DTO ne sont vérifiés qu'à la lecture.
   - **Correction :** écrire un test par constat 1, 2 et 5, en même temps que leur correction.

## Nice to have

10. **Messages et catégories du compte rendu** :
    - un P2002 sur `(datasetId, source, externalId)` est annoncé comme un conflit de nom (`document.service.ts:116-121`) ;
    - « Déjà importé » est compté dans `failed`, ce qui donne un toast d'avertissement ;
    - `pluralize(unchanged, "déjà à jour", "déjà à jour")` passe la même chaîne deux fois ;
    - un Doc nommé « rapport.pdf » devient `rapport.pdf.pdf`.

    Trouvé par 4/4.

11. **`concurrency: 5` est fixé d'après la copie locale du moteur** (`document/document.processor.ts:11-12`). Trouvé par 4/4.
    - **Problème :** c'est une valeur par instance. N répliques du back envoient 5×N indexations en même temps au moteur de prod, dont la capacité n'est pas connue ici.
    - **Correction :** en faire une variable d'environnement.

12. **Le chargeur du Picker peut ne jamais répondre** (`plateform_front/src/lib/googlePicker.ts:46-50`). Trouvé par B.
    - **Problème :** si `window.gapi` manque après le chargement du script, la promesse ne se termine jamais, et la carte reste bloquée sur « Import… ».
    - **Correction :** rejeter la promesse quand `gapi` est absent.

13. **`@Throttle({ limit: 10, ttl: 60_000 })` sur le contrôleur reprend exactement le défaut global** (B), et la condition « premier dataset » est répétée à trois endroits de `RetrieverDatasetsTab.tsx` (D).

## Écartés

- **« Le Picker propose des dossiers impossibles à importer »** (D). `setIncludeFolders(true)` affiche les dossiers pour naviguer, mais ils ne sont sélectionnables qu'avec `setSelectFolderEnabled(true)`, que le code n'appelle pas.
- **« Sentry ne capture aucun corps de requête »** (A, D). C'est faux pour le SDK 10.62 : voir le constat 4.
- **« Le jeton reste dans l'historique Redux »** (D). L'argument de la mutation n'est visible que dans les actions affichées par Redux DevTools, en dev. Il n'est pas gardé dans le state. Risque négligeable.

## Verdict

**Corriger d'abord 1 et 2, puis 3 et 4.** Le reste peut suivre.

**Lean : −30 lignes possibles** : le `@Throttle` redondant, le double contrôle MIME et taille entre `download()` et `ingestFile`, le champ `size` en double de `buffer.length` dans `IngestFileInput`, et les deux boucles presque identiques.

**Non vérifié :**
- Si un renommage dans Drive change bien `modifiedTime`. Sinon, la resynchro ne voit jamais les renommages, ce qui réduit le constat 1 aux autres cas.
- Le filtrage côté serveur du projet Sentry.
- La vraie popup Google.
