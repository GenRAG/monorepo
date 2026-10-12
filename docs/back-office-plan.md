# Back-office admin : plan

Statut : plan, rien n'est codé. Date : 2026-10-12.

## Objectif

Permettre à l'équipe GenRAG de régler les soucis d'un utilisateur sans ouvrir pgAdmin ni écrire de SQL en production : retrouver un compte, comprendre ce qui bloque (email non vérifié, document en échec, crédits épuisés, erreurs RAG) et corriger avec une action tracée.

Ce n'est pas un outil d'édition de la base. Chaque action passe par un service métier existant et laisse une trace.

## Ancrage : ce qui existe déjà

| Besoin | Existant | Conséquence |
|---|---|---|
| Rejeter un compte à chaque requête | `JwtStrategy.validate` (`auth/strategies/jwt.strategy.ts`) recharge déjà l'utilisateur à chaque requête | La suspension est une ligne dans `validate`. **Pas besoin de `tokenVersion`.** |
| Renvoyer l'email de vérification | `AuthService.resendVerificationToken(email)` | Réutilisé tel quel |
| Lien de réinitialisation du mot de passe | `AuthService.initiatePasswordReset(email)` | Réutilisé tel quel |
| Relancer l'indexation d'un document | `DocumentService.retry(id, datasetId)` (`POST .../documents/:id/retry`) | Réutilisé, sans le guard workspace |
| Solde et transactions | `CreditBalanceService`, `CreditTransactionService` | Il manque une méthode d'ajustement atomique |
| Supprimer un compte | `UsersService.delete` → `UserRepository.delete` (supprime aussi le workspace) | Ne nettoie que la base : S3 et index du moteur RAG à vérifier (v2) |
| Rôles | Aucun (supprimés, un membre par workspace) | Le statut admin est un nouveau concept, séparé des workspaces |
| Dernière connexion | Aucune | Ajouter `lastLoginAt`, écrit dans `AuthService.login` et `loginWithGoogle` |

## Deux formes envisagées

**A. Intégré.** Un module `admin/` dans `plateform_back`, des routes `/admin` dans `plateform_front`, et un drapeau admin en base.
- Pour : réutilise les services, l'auth, le thème, le déploiement. Le moins de code.
- Contre : la surface admin vit dans l'app publique (même domaine, même bundle front).

**B. Séparé.** Une app admin à part (sous-domaine, son propre front) ou un outil générique (AdminJS, Retool) branché sur la base.
- Pour : isolation réseau possible, rien dans le bundle public.
- Contre : un outil générique écrit dans les tables sans passer par les services (solde modifié sans transaction, statut d'agent changé sans `AgentVersion`). Une app à part, c'est un deuxième déploiement, une deuxième auth, un deuxième CORS.

**Choix : A pour la v1.** Le risque de B (contourner les règles métier) est pire que celui de A, et A se migre vers un sous-domaine plus tard sans changer l'API. Le code admin du front est chargé en lazy (`React.lazy`) pour ne pas alourdir le bundle des utilisateurs.

## Périmètre

### v1 (support de la bêta)

- Liste des utilisateurs, avec recherche.
- Fiche utilisateur (lecture).
- Actions : renvoyer la vérification, marquer l'email vérifié, envoyer un lien de réinitialisation, relancer un document, ajuster les crédits, suspendre / réactiver.
- Journal d'audit, consultable.

### v2

- Tableau de bord global (inscriptions, documents en échec, file BullMQ, taux d'erreur RAG).
- Suppression de compte complète (RGPD) : base + S3 + index RAG.
- Changer le plan d'un workspace.
- Consultation « en tant que » (impersonation), en lecture seule, tracée. À ne faire que si le besoin est réel.

### Hors périmètre

- Lire le contenu des conversations et messages des utilisateurs finaux (données des clients B2B). Seules les métadonnées sont visibles : nombre, dates, statut.
- Modifier un workflow, un agent ou un document d'un client.
- Définir un mot de passe à la place de l'utilisateur.
- Export de données personnelles depuis le back-office.

## Modèle de données (Prisma)

```prisma
// user.prisma
model User {
  // … champs existants
  isPlatformAdmin Boolean   @default(false) // posé à la main (script), jamais par l'API
  suspendedAt     DateTime?
  suspendedReason String?
  lastLoginAt     DateTime?
  adminActions    AdminAuditLog[] @relation("AdminActor")
}

// admin.prisma (nouveau fichier)
model AdminAuditLog {
  id           String   @id @default(cuid())
  adminId      String
  admin        User     @relation("AdminActor", fields: [adminId], references: [id], onDelete: Restrict)
  action       AdminAction
  targetUserId String?  // pas de relation : la ligne survit à la suppression du compte
  targetId     String?  // document, workspace… selon l'action
  reason       String?
  details      Json?    // avant / après, sans donnée sensible
  createdAt    DateTime @default(now())

  @@index([targetUserId, createdAt])
  @@index([createdAt])
}

enum AdminAction {
  RESEND_VERIFICATION
  MARK_EMAIL_VERIFIED
  SEND_PASSWORD_RESET
  RETRY_DOCUMENT
  ADJUST_CREDITS
  SUSPEND_USER
  UNSUSPEND_USER
}

// credit.prisma
enum CreditTransactionType {
  SUBSCRIPTION
  USAGE
  PURCHASE
  ADJUSTMENT // geste commercial ou correction ; metadata = { adminId, reason }
}
```

Questions ouvertes :
- `onDelete: Restrict` sur l'admin empêche de supprimer le compte d'un admin qui a agi. C'est voulu : on retire `isPlatformAdmin`, on ne supprime pas.
- Pourquoi un drapeau en base plutôt qu'une liste `ADMIN_EMAILS` en variable d'env : une liste d'emails donne les droits à qui s'inscrit avec cet email, et en dev l'email n'est pas vérifié (`SEND_EMAILS=false`). Le drapeau s'active par script, après vérification.

## Back : module `admin/`

Structure habituelle : `admin.module.ts`, `admin.controller.ts`, `admin.service.ts`, `admin.repository.ts`, `admin-audit.service.ts`, `dto/`, `guard/platform-admin.guard.ts`, `test/`.

### Garde

```ts
// guard/platform-admin.guard.ts
// Après JwtAuthGuard : charge l'utilisateur, exige isPlatformAdmin && isEmailVerified && !suspendedAt.
@Injectable()
export class PlatformAdminGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): Promise<boolean>; // not implemented
}
```

Tout le controller : `@UseGuards(JwtAuthGuard, PlatformAdminGuard)`, throttle plus strict, et réponse 404 (pas 403) aux non-admins pour ne pas révéler les routes.

### Suspension

- `JwtStrategy.validate` : `if (!user || user.suspendedAt) return null;`
- `LocalStrategy` et `loginWithGoogle` : refuser la connexion d'un compte suspendu, avec un message neutre.
- Question produit à trancher : les assistants déployés d'un compte suspendu continuent-ils de répondre aux utilisateurs finaux ? Proposition : oui en v1 (on suspend une personne, pas ses clients), et une coupure par agent en v2 si besoin.

### Endpoints

Préfixe `/admin`. Listes paginées, `limit` plafonné à 100 (`ParseIntPipe` + `DefaultValuePipe`, voir `plateform_back/CLAUDE.md` § Validation).

| Méthode | Route | Rôle | Réutilise |
|---|---|---|---|
| GET | `/admin/users?search=&page=&limit=` | Liste | — |
| GET | `/admin/users/:userId` | Fiche | services agent, document, crédit |
| GET | `/admin/users/:userId/audit` | Actions admin sur ce compte | — |
| POST | `/admin/users/:userId/resend-verification` | | `AuthService.resendVerificationToken` |
| POST | `/admin/users/:userId/mark-email-verified` | `{ reason }` | `UsersService` |
| POST | `/admin/users/:userId/password-reset` | | `AuthService.initiatePasswordReset` |
| POST | `/admin/users/:userId/suspend` | `{ reason }` | `UsersService` |
| POST | `/admin/users/:userId/unsuspend` | `{ reason }` | `UsersService` |
| POST | `/admin/workspaces/:workspaceId/credits/adjust` | `{ amount, reason }` | nouvelle méthode crédit |
| POST | `/admin/documents/:documentId/retry` | | `DocumentService.retry` |
| GET | `/admin/audit?page=&limit=` | Journal global | — |

### Formes de réponse (à recopier à la main côté front, `types/admin/admin.ts`)

```ts
interface AdminUserRow {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    lastLoginAt: string | null;
    isEmailVerified: boolean;
    suspendedAt: string | null;
    workspace: { id: string; name: string; plan: PlanTier; creditBalance: number } | null;
    agentsCount: number;
    documentsCount: number;
}

interface AdminUserDetail extends AdminUserRow {
    suspendedReason: string | null;
    onboarding: { step: number; completed: boolean; updatedAt: string } | null;
    credits: { balance: number; transactions: { id: string; amount: number; type: CreditTransactionType; createdAt: string }[] };
    agents: { id: string; name: string; status: AgentStatus; queriesLast30d: number; errorsLast30d: number }[];
    documents: { id: string; name: string; datasetId: string; status: DocumentStatus; updatedAt: string }[]; // échecs et en cours d'abord
    recentErrors: { agentId: string; createdAt: string; status: QueryLogStatus; durationMs: number }[]; // AgentQueryLog hors SUCCESS, sans `query`
}
```

`AgentQueryLog` ne stocke pas le message d'erreur, et le détail est dans Sentry. Ajouter un `errorCode` (pas le message brut) au log serait utile au support : à décider en étape 2.

Jamais d'entité Prisma brute : pas de `password` ni de jeton de vérification ou de réinitialisation dans les réponses.

### Ajustement de crédits

Nouvelle méthode dans `credit/`, pas dans `admin/` :

```ts
// credit-balance.service.ts
// Une seule $transaction : met à jour le solde et crée la CreditTransaction ADJUSTMENT.
// Refuse si le solde passerait sous 0. amount != 0, borné (ex. ±100 000).
adjust(workspaceId: string, amount: number, meta: { adminId: string; reason: string }): Promise<number>; // not implemented
```

### Audit

`AdminAuditService.record(adminId, action, { targetUserId, targetId, reason, details })`. On l'appelle dans la même transaction que l'action quand c'est possible (suspension, crédits). Pour les emails, on l'appelle après un envoi réussi. Une action sans ligne d'audit est un bug : chaque test de service le vérifie.

`reason` est obligatoire pour toute action qui modifie des données (`mark-email-verified`, `suspend`, `unsuspend`, `credits/adjust`).

## Front : `/admin`

- Route `src/app/Routes/AdminRoutes.tsx`, chargée en `React.lazy`. Elle est protégée par `PrivateRoute` et par un `AdminGuard` qui lit `isPlatformAdmin` dans `GET /users/me` (à ajouter à `UserSafe`). Le front ne fait que masquer : c'est le back qui protège.
- Slice RTK Query `services/admin/admin.ts`, tag `Admin`.
- Pages et composants dans `pages/Admin/` et `components/Admin/` :
  - `AdminUsersPage` : tableau, recherche par email, filtres (non vérifié, suspendu, solde à 0, documents en échec) ;
  - `AdminUserPage` : en-tête (statut, badges), onglets « Crédits », « Agents », « Documents », « Erreurs », « Journal » ;
  - `AdminActionDialog` : une seule modale pour toutes les actions, avec le motif obligatoire et un rappel de l'effet ;
  - `AdminAuditPage` : journal global.
- Tokens de `colorTokens.ts` uniquement, skeletons colocalisés, états vide et erreur (règles de `plateform_front/CLAUDE.md`).
- Un bandeau visible « Back-office » pour ne jamais confondre avec l'app.

## Sécurité et confidentialité

1. L'autorisation est vérifiée côté back à chaque route (`PlatformAdminGuard`). Le front ne fait que masquer.
2. Drapeau admin posé par script (`scripts/`), jamais par l'API.
3. Toute action est tracée, avec motif pour celles qui modifient des données.
4. Pas de contenu de conversation, pas de question d'utilisateur final dans les erreurs affichées.
5. Pas d'export de données personnelles.
6. Throttle dédié sur `/admin` et logs pino de chaque action.
7. v2 : sous-domaine dédié, et 2FA ou SSO pour les admins.

## Ordre de livraison

Chaque étape est une PR qui se vérifie seule.

1. **Socle.** Migration (`isPlatformAdmin`, `suspendedAt`, `suspendedReason`, `lastLoginAt`, `AdminAuditLog`, `ADJUSTMENT`), `PlatformAdminGuard`, `AdminAuditService`, écriture de `lastLoginAt`, script pour nommer un admin. Tests du guard.
2. **Lecture.** `GET /admin/users`, `GET /admin/users/:id`, `GET /admin/audit`, et les pages front correspondantes.
3. **Actions sans risque.** Renvoyer la vérification, lien de réinitialisation, relance de document.
4. **Crédits.** `CreditBalanceService.adjust` + endpoint + modale. Tests : atomicité, refus sous 0, ligne d'audit.
5. **Suspension.** Champ lu par `JwtStrategy`, `LocalStrategy` et Google ; endpoints ; tests e2e (un compte suspendu reçoit 401 dès la requête suivante).
6. **v2** selon les besoins réels du support.

## Questions à trancher

- Les assistants d'un compte suspendu restent-ils en ligne ? (proposition : oui en v1)
- Qui sont les admins au départ, et comment on en ajoute un (script SQL ou commande `yarn admin:grant <email>`) ?
- Faut-il prévenir l'utilisateur par email lors d'une suspension ou d'un ajustement de crédits ?
- La suppression RGPD complète (S3 + moteur RAG) passe-t-elle avant le tableau de bord ?
