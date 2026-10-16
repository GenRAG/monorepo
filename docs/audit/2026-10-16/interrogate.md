# `pstack:interrogate` sur le code risqué du back

## Intention

> Les chemins risqués de GenRAG doivent être corrects et sûrs pour de nombreux clients en parallèle :
> 1. l'authentification (cookie JWT, Google, reset, liste noire, blocage) ;
> 2. l'isolation entre clients (chaque requête est rattachée au workspace propriétaire) ;
> 3. les crédits (pas de double débit, pas de débit oublié, playground gratuit d'après la doc) ;
> 4. le pipeline `blocks` envoyé au moteur RAG ;
> 5. le schéma Prisma et ses migrations.
>
> Un workspace par utilisateur, sans rôles : c'est voulu (`CLAUDE.md` racine).

## Relecteurs

| Relecteur | Modèle | Constats |
|---|---|---|
| A | opus | 16 |
| B | opus, en repli (le modèle fable n'avait plus de crédits ; règle de repli du skill) | 14 |
| C | sonnet | 24 |
| D | haiku | 3 critiques, 17 avertissements, 5 structurels, 10 détails |

Rapports bruts : [`interrogate/`](interrogate/).

## À corriger

Chaque constat est relu dans le code. Les numéros renvoient à la liste du [`README.md`](README.md).

- **Réponse gratuite si le client coupe la connexion** (n° 2). Trouvé par A, B, C et D. Les 4 relecteurs ont tracé le même chemin : `close`, puis `ERROR`, puis aucun débit.
- **Playground facturé** (n° 3). Trouvé par A, B, C et D. Le test unitaire fige le contraire de la doc.
- **Bonus d'onboarding qu'on peut obtenir en boucle** (n° 1). Trouvé par B et C, et par ponytail back.
- **Migration des datasets impossible sur une table non vide** (n° 4). Trouvé par A, B, C et D.
- **E-mail modifiable sans vérification, puis connexion Google ou invitation par e-mail** (n° 5). Trouvé par A, C et D (B l'a reconfirmé comme B-11).
- **Blocage contournable** (n° 8) :
  - la lecture puis l'écriture du compteur ne sont pas atomiques : A, C, D ;
  - le compteur est partagé et remis à zéro par un login réussi : A, C ;
  - le TTL peut se perdre entre `INCR` et `EXPIRE` : C, D.
- **Vecteurs laissés par un document supprimé pendant l'indexation, `retry` sans garde de statut** (n° 9). Trouvé par A, B, C et D.
- **Snapshots modifiables (`activate`), rollback qui écrase le brouillon** (n° 10). Trouvé par A, B, C et D.
- **Débit non idempotent, découvert, pas de registre `USAGE`** (n° 13). Trouvé par A, B, C et D.
- **Pipeline validé seulement au moment de la question ; `collection_name` et `top_k` libres ; recherche retirée sans prévenir** (n° 14). Trouvé par A, B, C et D.
- **Contrat `org_ids` / `model_name` différent de la copie du moteur** (n° 6). Trouvé par A, B, C et D. Tous notent qu'il faut le vérifier contre `RAG-GenRag`.
- **Le logout ne supprime pas le cookie en prod et avale l'erreur de liste noire** (n° 19). Trouvé par A, B et C.
- **Le filtre d'erreurs écrit `?query=` dans les logs** (n° 20). Trouvé par A, C et D, et par les deux ponytail back et front.
- **CSRF (B-04)** : le cookie est `SameSite=None` et le parser urlencoded est actif. Les `GET` SSE qui consomment des crédits peuvent aussi être déclenchés depuis un autre site. Trouvé par A, C et D.

## À envisager

- **Le throttler compte par IP et en mémoire** (B, C). Toute une entreprise derrière un même NAT partage 20 requêtes par minute, et les limites se multiplient avec le nombre d'instances. Il faudrait compter par `userId` et stocker les compteurs dans Redis. À faire avant une deuxième instance.
- **`AgentBelongsToWorkspaceGuard` laisse passer si `workspaceId` manque** (B, C, D). Aucune route actuelle n'est concernée, c'est un piège pour la prochaine. Le guard des datasets, lui, refuse dans ce cas. Ajouter un test de guards avec deux clients (B-48).
- **« Un workspace par utilisateur » n'est garanti que par un verrou advisory** (B). Aucune contrainte unique ne le garantit sur `UserWorkspace.workspaceId`. Ajouter `@@unique([workspaceId])` si c'est la décision définitive.
- **`NODE_ENV` contrôle seul la vérification d'e-mail et le cookie `Secure`** (C, D, ponytail back). Le `Dockerfile` ne fixe pas `NODE_ENV`.
- **Événements du moteur non validés** (C, D). Un `total_cost_usd` qui n'est pas un nombre donne `NaN`, le job échoue 5 fois, et la requête n'est jamais facturée. Il faudrait valider les événements avec Zod et ajouter un garde `Number.isFinite`.
- **Les paramètres de query typés `string` acceptent des tableaux** (C). `?query=a&query=b` contourne la limite de 4000 caractères. Il faudrait un DTO de query.
- **`Conversation.userId` passe à `SetNull` quand on supprime l'utilisateur** (D). Les conversations de l'utilisateur final restent et sont exportées au propriétaire : c'est une question RGPD.
- **Le sync `blocks` / `nodes` ne se fait que côté client** (C). Le serveur ne recalcule jamais l'un depuis l'autre.

## Notés, sans action immédiate

- **Questions qui se chevauchent dans une conversation** (B). Les paires question/réponse se décalent : il faudrait un `replyToId`.
- **Type d'événement `__proto__` reçu du moteur** (D). Le moteur est un service de confiance, donc le risque est faible.
- **`getSourceUrl` sert n'importe quel document des datasets de l'agent** (A, D). Les membres ont déjà accès à l'agent, mais cela reste plus large que les sources citées.
- **L'utilisateur est lu deux fois par requête** (C, D, ponytail back).
- **`page=0` provoque un 500** (C, D).
- **Pas de code Stripe ni d'achat dans le back** (A, B, C, D). Les types `USAGE` et `PURCHASE` ne sont jamais écrits.

## Écartés

- **Absence de rôles ADMIN / EDITOR / VIEWER** (A, B, C). C'est voulu : les `CLAUDE.md` racine et back ont été mis à jour (« pas de rôles ni de collaboration »). Les relecteurs pensaient que la doc parlait encore des rôles. Seule la contrainte unique est gardée, dans « à envisager ».
- **« La doc décrit encore les rôles »** (A, C). C'est faux sur `904c1d3`.

## Carte des accords

- **Consensus total (4/4)** sur les crédits (n° 2, 3 et 13), la migration (4), le contrat moteur (6), les documents (9), les snapshots (10) et la validation du pipeline (14). C'est le signal le plus fort de l'audit : 4 modèles différents, partis de points d'entrée différents, arrivent aux mêmes lignes.
- **Constats d'un seul relecteur, mais vérifiés** :
  - le bonus d'onboarding (B et C, sans A ni D ; confirmé aussi par ponytail back) ;
  - le throttler par NAT (B) ;
  - `SetNull` sur les conversations (D).

  Le premier a été vérifié dans le code et classé « à corriger ».
- **Désaccord** sur la gravité du playground : « critique » pour A, B et D, « avertissement » pour C. C'est un désaccord de comportement attendu, d'où « décision humaine requise ».
