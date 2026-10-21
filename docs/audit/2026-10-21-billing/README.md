# Audit de la branche `feat/billing` (2026-10-21)

Audit de sécurité, de code et de propreté du commit `46b04c8` (« feat(billing): abonnement Stripe, recharges de crédits et limites par offre »), comparé à `dev` (`aaf97dc`). Le moteur RAG est hors périmètre.

Un audit ne modifie rien : les corrections sont des PR séparées vers `feat/billing`, **non mergées**.

## Méthode

| Passe | Skill | Qui |
|---|---|---|
| Sécurité | `security-review` | une passe d'identification ; un filtre des faux positifs par constat, seuil de confiance 8/10 |
| Revue adverse multi-modèles (code risqué : crédits, Stripe, migrations) | `pstack:interrogate` | relecteurs A (Opus), B (Opus, remplaçant de Fable : crédits d'usage épuisés), C (Sonnet), D (Haiku) |
| Code, propreté, sobriété | `ponytail:ponytail-review` | une passe sur tout le diff, avec les règles des `CLAUDE.md` |

Chaque constat retenu ci-dessous a été relu dans le code. Ceux qui sont corrigés ont un test qui échouait avant le correctif.

## Baseline (avant corrections, `46b04c8`)

| Périmètre | Lint | Typecheck | Tests | Build |
|---|---|---|---|---|
| `plateform_back` | 0 erreur, 0 warning | OK | unitaires 509/509, e2e 120/120 | OK |
| `plateform_front` | 42 erreurs, 102 warnings, **aucun dans un fichier touché par la branche** (déjà présents sur `dev`) | OK | — | OK |

Les migrations `20261021120000_billing_stripe` et `20261021140000_billing_review` s'appliquent sur une base peuplée. Tous les workspaces passent en Découverte avec leur solde, comme le dit le commentaire de la migration.

## Sécurité

**Aucun constat** au-dessus du seuil. Points vérifiés :
- le webhook vérifie la signature Stripe sur le corps brut ;
- les crédits sont idempotents (`CreditTransaction.stripeRef` unique) ;
- les crédits d'une recharge sont calculés côté serveur, et une recharge n'est créditée que si `payment_status === 'paid'` ;
- l'offre PRO ne vient que de l'abonnement relu chez Stripe ;
- toutes les routes de facturation passent par `JwtAuthGuard` et `WorkspaceMemberGuard` ;
- le `workspaceId` des métadonnées Stripe est toujours posé par le serveur ;
- le SQL brut est paramétré (gabarits Prisma) ;
- une adresse invitée (`DISCOVERY_EMAILS`) ne peut pas être revendiquée : connexion vérifiée, e-mail non modifiable ;
- le front n'a ni `dangerouslySetInnerHTML` ni redirection construite depuis l'URL.

## Intention de la branche

> Ajouter la facturation Stripe sans laisser de chemin qui donne des crédits ou une offre sans paiement. Il y a trois offres :
> - NONE : inscrit sans invitation, rien ;
> - FREE « Découverte » : sur invitation, 5 000 crédits une fois, 1 agent, 2 bases ;
> - PRO : 50 €/mois, quota de 50 000 crédits remis chaque mois, 10 agents, 25 bases.
>
> Les recharges vont de 5 à 1 000 € et n'expirent pas. Le plan et les crédits ne changent que par le webhook signé, qui relit l'abonnement chez Stripe sous un verrou par workspace. Les crédits sont idempotents, et le quota expiré est inscrit au registre. Les limites sont appliquées à la création, et la suppression d'un compte supprime son client Stripe.

## Corrigé : PR ouvertes vers `feat/billing` (non mergées)

| PR | Constat | Relevé par | Changement de comportement |
|---|---|---|---|
| [#117](https://github.com/GenRAG/monorepo/pull/117) | Un renouvellement sur solde négatif remettait le quota à 50 000 au-dessus du solde : la dette était débitée une seconde fois à l'expiration suivante, et « Crédits supplémentaires » s'affichait négatif. | C, B (symptôme) | ⚠️ après un découvert, le quota du mois vaut 50 000 moins la dette |
| [#118](https://github.com/GenRAG/monorepo/pull/118) | Une suppression de compte qui échoue après `customers.del` laissait un `stripeCustomerId` mort : abonnement, recharge et portail répondaient ensuite 500 indéfiniment. | A, B, C, D | ⚠️ le workspace oublie le client supprimé |
| [#119](https://github.com/GenRAG/monorepo/pull/119) | L'abonnement en double était annulé avec `prorate` seul : l'avoir restait un élément en attente d'un abonnement annulé. Désormais `invoice_now`. | A, C, D | ⚠️ le client reçoit son avoir (non vérifié contre le vrai Stripe, voir la PR) |
| [#120](https://github.com/GenRAG/monorepo/pull/120) | La limite d'offre demandait deux décorateurs ; oublier le second la désactivait sans erreur. `@PlanLimit` pose maintenant le guard, et `PlanLimitGuard` a enfin son test unitaire (exigé par `plateform_back/CLAUDE.md`). | A, C, ponytail | aucun (refactor) |
| [#121](https://github.com/GenRAG/monorepo/pull/121) | Le premier abonnement (le parcours qui crédite les 50 000 premiers crédits) et les règles des paiements n'étaient pas testés. | B, C, ponytail | aucun (tests seuls) |

Les cinq PR partent de `feat/billing` et sont indépendantes. Elles se mergent sans conflit dans n'importe quel ordre (essayé dans deux ordres opposés). Une fois les cinq mergées ensemble, le back est vert : lint 0/0, typecheck OK, 522 tests unitaires, build propre, 124 tests e2e.

## À décider (décision humaine requise)

Ces points changent le produit, le contrat d'API, le schéma ou l'architecture. Ils ne sont pas corrigés.

1. **Un nouvel abonné n'arrive jamais à la découverte guidée.** Relevé par ponytail (*Must fix*), avec B (n°10) sur la redirection.
   - Le constat :
     - en production, un inscrit sans invitation est envoyé sur Crédits, et l'onboarding lui est refusé ;
     - après le paiement, Stripe le renvoie sur `/billing`, et aucun lien ne mène à `/onboarding/:id` ;
     - un 403 ou un 409 sur l'onboarding s'affiche comme une erreur générique.
   - Les options : ajouter un lien dans le toast de succès ou sur la carte d'offre (il faut exposer `onboardingStartedAt`), ou accepter le manque.
2. **L'agent de démo prend l'unique agent de Découverte** (A, B). `findPlanUsage` compte la démo : un invité qui suit l'onboarding ne peut plus créer son propre agent sans la supprimer. Les options : exclure la démo du comptage (marqueur sur l'agent, donc schéma) ou l'assumer dans l'interface.
3. **Une Découverte abonnée puis résiliée tombe à NONE** (B, D). `toSubscriptionState` écrit `NONE` pour tout abonnement non payé, et l'invité perd son offre de départ. Pour corriger, il faut garder l'offre d'invitation à part du miroir Stripe (schéma).
4. **Webhook sur une autre version d'API : renouvellement perdu sans rejeu** (A, C).
   - Le constat : `constructEvent` ne fait que logguer, `onInvoicePaid` sort sans rien faire, et le webhook répond 200, donc Stripe ne renvoie pas l'événement.
   - Les options :
     - lever une 500 pour que Stripe réessaie ;
     - ou relire la facture avec `stripe.invoices.retrieve` (version épinglée par le SDK), dans la logique « on relit Stripe » du reste du code.
   - C'est aussi un réglage du dashboard Stripe (infra).
5. **Appel HTTP à Stripe dans une transaction Prisma qui tient le verrou** (A, C).
   - Le constat : chaque webhook garde une connexion du pool pendant `subscriptions.retrieve`, avec un timeout de 20 s. Un checkout envoie quatre événements presque ensemble pour le même workspace : les autres routes risquent des P2024/P2028.
   - La piste : mettre les événements en file BullMQ (`jobId = event.id`, sérialisés par workspace), puis lire Stripe hors transaction. C'est un refactor d'architecture.
6. **Le registre de crédits n'a pas de propriétaire** (B, D).
   - Le constat : l'invariant `purchased = balance - monthlyCredits` est réécrit à la main en SQL brut dans `billing/` et `credit/` (quatre endroits), et `credit/` n'écrit plus rien.
   - La piste : un `CreditLedger` dans `credit/` (`grant`, `debit`, `renewMonthly`, `expireMonthly`) qui vérifie le nombre de lignes modifiées. C'est un gros refactor.
7. **Migrations** (B, C, ponytail).
   - `billing_stripe` force toutes les offres à FREE sans vérifier qu'aucune n'est payée. Un `DO $$ … RAISE EXCEPTION` sur un plan autre que FREE protégerait la mise en production.
   - Les deux migrations d'une branche non livrée gagneraient à être fusionnées, si aucune base partagée ne les a appliquées.
   - `prisma format` n'a pas été passé.
8. **Bornes de recharge recopiées dans le front** (A, B, C, ponytail). `MIN_TOP_UP_EUROS` et `MAX_TOP_UP_EUROS` sont dupliqués dans `types/billing/billing.ts`. Pour corriger, il faut les ajouter à `BillingSummary`, ce qui change le contrat.
9. **Un abonnement `past_due` s'affiche « Actif »** (B). Le badge de `PlanCard` ignore `subscription.status` : l'utilisateur n'est pas prévenu pendant que Stripe relance sa carte, puis il perd son quota. Le correctif est une modification d'interface.
10. **Une invitation se réutilise après suppression du compte** (lead). Supprimer son compte puis se réinscrire avec la même adresse invitée recrée un workspace Découverte, avec 5 000 crédits de plus. Pour corriger, il faut un registre des invitations consommées (schéma).
11. **Onboarding bloqué après un crash** (D). `claimStart` pose `onboardingStartedAt` avant de créer la démo, et `releaseStart` ne s'exécute que sur une exception. Après un crash entre les deux, chaque `start` répond 409 « déjà faite ». Les pistes : tout faire dans une transaction, ou réessayer un claim sans session après un délai.
12. **Remboursements et litiges ignorés** (D). Une recharge remboursée garde ses crédits (`handleEvent`, `default: return`). Ce cas est à trancher.

## Noté (valide, non prioritaire)

- **Facture payée en retard** (A) : une facture d'une période ancienne, payée après la suivante, réinitialise le quota en cours. C'est rare et demanderait de comparer `period_end`.
- **SQL brut sans contrôle du nombre de lignes** (A, B, D) : les `UPDATE` de `recordQuery` et de `renewMonthlyCredits` ne vérifient pas le nombre de lignes modifiées. Le cas n'est pas atteignable aujourd'hui : le solde est créé avec le workspace, et `checkOrThrow` bloque à 0. À traiter avec le point 6.
- **Course dans `PlanLimitGuard`** (D) : le guard compte puis crée sans verrou, donc la limite peut être dépassée de 1. C'est un raccourci documenté dans le code.
- **`closeOpenSubscriptionCheckouts`** (C, D) : les listes sont limitées à 10, sans pagination. Le `Promise.all` d'expiration renvoie une 500 si une session se termine entre la liste et l'expiration, mais réessayer suffit.
- **Doublon jugé sur la copie en base** (A) : le doublon est décidé d'après la copie en base de l'autre abonnement. C'est peu atteignable, car `createSubscriptionCheckout` refuse un workspace PRO en base.
- **Petites retouches** (A, B, C, ponytail) :
  - `getPlanConfig` n'est qu'un wrapper de `PLANS[plan]` ;
  - `findPlanUsage` et `findWorkspace` font la même lecture ;
  - `displayName: 'Aucun'` n'est jamais affiché ;
  - `success_url` et `cancel_url` sont recopiés dans les deux checkouts ;
  - `goTo` et `handleBuy` sont dupliqués côté front ;
  - `PlanCard` utilise `fontSize`/`fontWeight` au lieu des variantes `number-md`/`number-lg` (`plateform_front/CLAUDE.md`) ;
  - les nouveaux commentaires du front sont en anglais ;
  - `PlanLimitGuard` passe avant `ValidationPipe`, donc un DTO invalide sur un workspace plein reçoit 403 au lieu de 400.

## Écarté

- **`totalGranted` inclut `EXPIRATION`** (D) : c'est voulu, et c'est testé. Le ratio « utilisé » du tableau de bord resterait faux sans les expirations.
- **Retirer `subscription.status` du DTO** (ponytail) : il contredit B, qui veut l'afficher (point 9). Le champ reste.
- **Déplacer la limite d'offre dans les services** (D) : `plateform_back/CLAUDE.md` place les autorisations dans les guards, et l'exception de l'onboarding est documentée. Le risque réel, une route qui oublie le guard, est traité par #120.

## Carte des accords

- **Unanimité.** Le `stripeCustomerId` mort a été trouvé par les quatre relecteurs (#118).
- **Trois relecteurs.** L'annulation du doublon sans facture finale (#119).
- **Deux relecteurs, de familles différentes (Opus et Sonnet).** La version d'API du webhook, l'appel Stripe dans la transaction, le double décorateur.
- **Deux relecteurs Opus.** L'agent de démo qui prend la place de Découverte (A et B).
- **Opus et Haiku.** Le registre de crédits sans propriétaire, et la Découverte qui retombe à NONE.
- **Un seul relecteur.**
  - La dette comptée deux fois n'a été trouvée que par Sonnet ; B (Opus) n'en a vu que le symptôme, l'affichage négatif. Elle a été déroulée à la main, puis prouvée par un test.
  - Haiku est seul sur l'onboarding bloqué et sur les remboursements.
  - Ponytail est seul sur le parcours d'un nouvel abonné vers l'onboarding.

Les relecteurs ont convergé sur la frontière avec Stripe, c'est-à-dire ce qui se passe quand Stripe et la base divergent. Les constats qu'un seul relecteur a trouvés touchent tous au parcours produit (onboarding, invitations) et à l'arithmétique du registre, que l'e2e couvrait mal.
