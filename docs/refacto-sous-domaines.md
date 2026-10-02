# Refacto : un sous-domaine par assistant déployé

Plan du refacto. Aucun code n'est écrit à ce stade.

## 1. Objectif

Séparer trois surfaces aujourd'hui confondues :

| Adresse | Contenu | Aujourd'hui |
|---|---|---|
| `genrag.app` | Site vitrine | `vitrine_front/`, déploiement Vercel séparé |
| `studio.genrag.app` | Le studio : agents, documents, workflow, déploiement, billing | `plateform_front/`, toutes les routes |
| `<slug>.genrag.app` | L'assistant déployé, pour ses utilisateurs finaux | `plateform_front/`, routes `/assistants/:assistantId` |

Le sous-domaine est choisi par l'utilisateur au déploiement. Depuis le studio, « Ouvrir l'assistant » ouvre un nouvel onglet sur `<slug>.genrag.app`.

La vitrine annonce déjà ce fonctionnement (`acme-rh.genrag.app`, `studio.genrag.app/...`, « à vos couleurs » dans `vitrine_front/src/content.ts`) : le refacto aligne le produit sur ce qui est montré.

## 2. État actuel

### Front (`plateform_front/`)

- Une seule SPA CRA déployée par le `vercel.json` racine (réécriture de toutes les routes vers `index.html`).
- Routes du chat final dans `src/app/Router.tsx` et `src/app/Routes/AppRoutes.tsx` :
  - `/assistants` et `/workspaces/:workspaceId/assistants` : liste (entrée « Chats » de la sidebar) ;
  - `/assistants/:assistantId`, `/assistants/:assistantId/conversations/:conversationId`, `/workspaces/:workspaceId/assistants/:assistantId` : le chat (`pages/Assistant/Assistant.tsx`).
- Le chat appelle `REACT_APP_BACKEND_URL` avec `credentials: "include"` (`services/chat/chat.ts`, `hooks/chat/useAssistantQuery.ts` pour le SSE).
- Le déploiement (`components/Deployment/DeployModal.tsx`) ne demande qu'un nom et un changelog. Aucune adresse n'est affichée après déploiement.
- `components/Deployment/AccessControl/VisibilitySection.tsx` (Public / Privé / API) n'est qu'un état local : rien n'est persisté.

### Back (`plateform_back/`)

- `ConversationController` (`/assistants/...`) : tout est indexé par `agentId`. L'accès est accordé aux membres du workspace et aux `AgentMember` (`ConversationRepository.hasAgentAccess`), y compris pour le stream (`AgentRuntimeService._runPersistedStream`).
- Déploiement : `AgentVersion` + `Agent.status`. `CreateDeploymentRequest` = `{ name?, changelog? }`. Aucun slug.
- Cookie `Authentication` (`auth.service.ts`) : `httpOnly`, `sameSite: 'none'` en production, **sans `domain`**, donc lié au seul hôte de l'API.
- CORS (`main.ts`) : liste fixe tirée de `FRONTEND_URL`, `credentials: true`.
- `FRONTEND_URL` sert aussi aux liens des emails (`resend.service.ts`) : la variable est concaténée telle quelle, ce qui casse dès qu'elle contient plusieurs origines.
- Connexion Google : bouton Google Identity côté front, vérification de l'audience côté back.

## 3. Cible

```
genrag.app            -> vitrine_front
studio.genrag.app     -> plateform_front, mode studio     ┐ même build, servi par
<slug>.genrag.app     -> plateform_front, mode assistant  ┘ le même hôte virtuel
api.genrag.app        -> plateform_back
```

Le tout est déployé sur nos VM, derrière un reverse proxy unique qui termine le TLS et route par nom d'hôte. Le refacto démarre une fois ces VM disponibles.

Au chargement, le front lit `window.location.hostname` et choisit son mode :

- hôte = `studio.<domaine racine>` : routeur du studio (l'actuel, sans les routes de chat) ;
- hôte = `<slug>.<domaine racine>` : routeur de l'assistant, qui résout le slug auprès de l'API puis affiche le chat ;
- tout autre hôte (`localhost`, adresse IP de la VM) : mode studio.

## 4. Décisions

Chaque décision porte une recommandation. Celles marquées **à trancher** dépendent de toi.

### D1. Une seule app ou deux ?

**Recommandé : un seul build `plateform_front` avec deux routeurs.** Le chat réutilise `components/Assistant`, `components/ui/chat`, `hooks/chat`, le thème et les slices RTK. Les deux routeurs sont chargés en `React.lazy`, pour que l'assistant ne télécharge pas le code du studio.

Alternative écartée : une app `assistant_front` séparée. Elle oblige à extraire les composants de chat et le thème dans un package partagé, pour un gain limité à la taille du bundle.

### D2. Où vit le slug ?

**Recommandé : sur l'agent** (`Agent.slug`, unique, nullable), pas sur la version. L'adresse reste stable d'un déploiement à l'autre et lors d'un rollback.

- Format : minuscules, chiffres et tirets, 3 à 40 caractères, ni tiret initial ni final (contrainte DNS : 63 caractères maximum par label).
- Liste de slugs réservés : `www`, `studio`, `api`, `app`, `admin`, `auth`, `login`, `mail`, `docs`, `status`, `static`, `cdn`, `assets`, `support`, `help`, `blog`, `dev`, `staging`, `preview`, `genrag`.
- Changement de slug autorisé après déploiement, avec avertissement : l'ancienne adresse cesse de répondre. Pas d'historique de redirection en V1.

### D3. Authentification sur le sous-domaine

C'est le point le plus structurant du refacto.

**Recommandé : un cookie partagé par tous les sous-domaines.**

- L'API passe sous `api.genrag.app`. Le cookie devient `Domain=.genrag.app`, `SameSite=Lax`, `Secure`.
- Conséquence utile : le cookie devient un cookie interne au site. Aujourd'hui il est tiers (`SameSite=None` entre le front et l'API), ce que Safari bloque et que Chrome restreint.
- Un utilisateur connecté au studio est connecté sur tous les assistants auxquels il a accès, et inversement.
- `clearCookie` au logout doit reprendre le même `domain`, sinon le cookie n'est pas supprimé.
- Règle à tenir par la suite : ne jamais servir de contenu contrôlé par un client (HTML, JS, fichiers importés) sur un sous-domaine de `genrag.app`, puisqu'il recevrait le cookie de session.

**Page de connexion — à trancher.**

| Option | Effet | Coût |
|---|---|---|
| A. Redirection vers `studio.genrag.app/login?redirect=…` (recommandé en V1) | Une seule page de connexion, Google fonctionne tel quel. L'utilisateur final passe par une page GenRAG avant d'arriver sur son assistant. | Faible |
| B. Page de connexion sur le sous-domaine, au nom de l'assistant | Effet « mon RAG » complet. | Moyen : Google n'accepte pas d'origine générique (`*.genrag.app`), il faut donc un flux par redirection pour Google ou se limiter à email + mot de passe sur cette page. |

Dans les deux cas, le paramètre `redirect` est validé contre le domaine racine, pour éviter une redirection ouverte.

### D4. Résolution du slug côté API

**Recommandé : un seul nouvel endpoint, le reste inchangé.**

- `GET /assistants/by-slug/:slug` (authentifié) renvoie `{ id, title, sharedBy, version }` si l'agent est en production et que l'utilisateur y a accès. Réponse 404 identique dans tous les autres cas, pour ne pas révéler l'existence d'un slug.
- Le front utilise ensuite les endpoints actuels `/assistants/:agentId/...`. Aucun changement sur le runtime, les conversations ou les crédits.
- `GET /workspaces/:workspaceId/agents/slug-availability?slug=` pour la vérification en direct dans la modale de déploiement.
- Si l'option B de D3 est retenue : un endpoint public minimal (`nom`, couleur) pour habiller la page de connexion, avec limitation de débit.

### D5. Que devient la liste « Chats » du studio ?

**Recommandé : la garder comme lanceur.** `/assistants` reste dans le studio et chaque ligne ouvre `<slug>.genrag.app` dans un nouvel onglet. Les routes de chat du studio (`/assistants/:assistantId…`) deviennent des redirections vers le sous-domaine, pour ne pas casser les liens déjà partagés.

**À trancher** : un membre invité sur un seul assistant (`AgentMember`) arrive aujourd'hui dans le studio. Faut-il qu'il n'y ait plus accès du tout et soit toujours renvoyé vers son assistant ?

### D6. Agents déjà déployés

**Recommandé : remplissage automatique à la migration.** Un script génère un slug depuis le nom de l'agent (suffixe numérique en cas de collision) pour chaque agent en production. Le propriétaire peut le modifier ensuite.

### D7. Hors périmètre

- Personnalisation avancée (thème complet, mise en page) : seule une personnalisation minimale est prévue, en phase 5.
- Visibilité « Public » (chat sans compte) : demande une session anonyme et une protection des crédits contre l'abus. Sujet à part.
- Domaine personnalisé du client (`assistant.client.fr`) : sujet à part.

## 5. Phases

### Phase 0 — Prérequis et validation (avant tout développement)

- [ ] Confirmer la maîtrise du domaine `genrag.app` et de son DNS.
- [ ] Certificat générique `*.genrag.app` sur le reverse proxy des VM (Caddy ou Traefik). Un certificat générique Let's Encrypt impose la validation par DNS : le fournisseur DNS du domaine doit exposer une API que le proxy sait piloter.
- [ ] Reverse proxy : `genrag.app` vers la vitrine, `api.genrag.app` vers le back (sans mise en tampon, pour le SSE), `studio.genrag.app` et `*.genrag.app` vers le build de `plateform_front` avec repli sur `index.html`.
- [ ] Choisir le domaine de développement local. `*.localhost` ne garantit pas le partage de cookie entre sous-domaines : tester `lvh.me` (`studio.lvh.me:3000`, `mon-rag.lvh.me:3000`, `api.lvh.me:8080`). Le serveur de dev CRA doit accepter ces hôtes (config `craco`).
- [ ] Vérifier sur une maquette minimale qu'un cookie `Domain=.<racine>` posé par l'API est bien renvoyé depuis deux sous-domaines, SSE compris.

**Sortie de phase** : le partage de cookie est démontré en local et l'infra cible est confirmée faisable.

### Phase 1 — Back

- [ ] Prisma : `Agent.slug String? @unique` + migration (`./scripts/migrate.sh add_agent_slug`).
- [ ] Validation du slug (format + liste réservée) dans un module dédié, testé unitairement.
- [ ] `CreateDeploymentRequest` : champ `slug`, obligatoire si l'agent n'en a pas encore. Conflit = 409.
- [ ] `PATCH` du slug sur l'agent (rôles ADMIN / EDITOR).
- [ ] `GET …/agents/slug-availability`.
- [ ] `GET /assistants/by-slug/:slug` (voir D4), avec limitation de débit.
- [ ] `getAssistants`, `getAssistantMetadata`, `getCurrent` : ajouter `slug` aux réponses.
- [ ] Configuration : nouvelles variables `ROOT_DOMAIN`, `STUDIO_URL`, `COOKIE_DOMAIN`. `FRONTEND_URL` n'est plus utilisée pour les emails (`resend.service.ts` passe sur `STUDIO_URL`).
- [ ] CORS (`main.ts`) : fonction d'origine qui accepte `STUDIO_URL` et tout sous-domaine direct de `ROOT_DOMAIN`, plus la liste de dev.
- [ ] Cookie (`auth.service.ts`, `auth.controller.ts`) : `domain: COOKIE_DOMAIN`, `sameSite: 'lax'`, même `domain` au `clearCookie`.
- [ ] Tests : unitaires (slug, origine CORS), e2e (déploiement avec slug, conflit, résolution par slug, refus d'accès).

### Phase 2 — Front : séparation par hôte

- [ ] `src/app/host.ts` : résolution du mode (`studio` / `assistant` + slug) à partir de l'hôte et de `REACT_APP_ROOT_DOMAIN`. Testé unitairement.
- [ ] `src/app/Router.tsx` : deux routeurs chargés en `lazy`, `StudioRouter` (l'actuel) et `AssistantRouter`.
- [ ] `AssistantRouter` : `/` (accueil du chat) et `/c/:conversationId`. Un garde résout le slug (`by-slug`), gère le 401 (redirection de connexion, D3) et le 404 (page « assistant introuvable »).
- [ ] `pages/Assistant/Assistant.tsx` : reçoit l'`assistantId` du garde plutôt que de l'URL ; les `navigate("/assistants/…")` deviennent des chemins relatifs au sous-domaine.
- [ ] Retirer du mode assistant tout ce qui relève du studio : sidebar, `WorkspaceGuard`, onboarding.
- [ ] `types/` : ajouter `slug` aux types d'agent, d'assistant et de déploiement (maintenus à la main, voir `CLAUDE.md` racine).
- [ ] Mixpanel : distinguer les événements studio et assistant.

### Phase 3 — Front : studio

- [ ] `DeployModal` : champ sous-domaine au premier déploiement, aperçu `<slug>.genrag.app`, vérification de disponibilité, messages d'erreur (format, réservé, déjà pris).
- [ ] `HeaderCardMain` : afficher l'adresse, boutons « Copier » et « Ouvrir » (nouvel onglet).
- [ ] Réglages de déploiement : modification du slug avec avertissement.
- [ ] `AssistantsTable` : les lignes ouvrent le sous-domaine dans un nouvel onglet.
- [ ] Routes de chat héritées (`/assistants/:assistantId…`, `/workspaces/:workspaceId/assistants/:assistantId`) : redirection vers le sous-domaine.
- [ ] Page de connexion : prise en charge du paramètre `redirect` validé.

### Phase 4 — Mise en production

- [ ] Script de remplissage des slugs pour les agents en production (D6).
- [ ] DNS : apex, `studio`, `api` et `*` vers les VM.
- [ ] Variables d'environnement du front (au build) et du back sur les VM.
- [ ] Console Google : ajouter `https://studio.genrag.app` aux origines autorisées.
- [ ] Ancienne adresse de l'app : redirection vers `studio.genrag.app` en conservant le chemin.
- [ ] Les sessions existantes sont perdues à la bascule (changement de domaine du cookie) : prévenir les utilisateurs de la bêta.
- [ ] Documentation : `CLAUDE.md` racine (règle « CORS / cookies »), `plateform_back/CLAUDE.md` (variables), `plateform_front/CLAUDE.md` (routeurs), `.env.example` des deux dossiers.

### Phase 5 — Personnalisation minimale de l'assistant

- [ ] Prisma : réglages d'apparence sur l'agent (nom affiché, couleur, logo), modifiables dans les réglages de déploiement.
- [ ] `by-slug` renvoie ces réglages ; le mode assistant les applique par-dessus le thème (variables de couleur), sans thème Chakra dédié.
- [ ] Logo : stockage S3 existant, servi hors de `*.genrag.app` ou en image uniquement (voir la règle de D3 sur le contenu client).

### Suites possibles

- Page de connexion sur le sous-domaine (option B de D3).
- Visibilité publique, domaine personnalisé.

## 6. Risques

| Risque | Parade |
|---|---|
| Fournisseur DNS sans API pour la validation du certificat générique | Traité en phase 0 ; à défaut, changer de fournisseur DNS avant de commencer. |
| Cookie partagé non renvoyé dans un navigateur (Safari, SSE) | Maquette de la phase 0, test sur Safari et mobile. |
| Slug utilisé pour imiter une page officielle (`connexion`, `paiement`…) | Liste réservée, possibilité de retirer un slug côté admin. |
| Énumération des assistants existants par essais de slugs | Réponse 404 unique, limitation de débit. |
| Redirection ouverte via le paramètre `redirect` | Validation stricte contre le domaine racine. |
| Liens `/assistants/:id` déjà partagés | Redirections conservées dans le studio (phase 3). |
| Environnement de test sans sous-domaine | Mode studio par défaut, et paramètre `?assistant=<slug>` accepté hors production. |

## 7. Questions ouvertes

1. Page de connexion : redirection vers le studio (A) ou page sur le sous-domaine (B) ? Voir D3.
2. Un membre invité sur un assistant garde-t-il un accès au studio ? Voir D5.
3. Le domaine `genrag.app` est-il acquis, et son fournisseur DNS expose-t-il une API pour la validation du certificat générique ?
4. Personnalisation de l'assistant : quels réglages en V1 (nom affiché, couleur, logo) ?
5. Le slug est-il unique sur toute la plateforme (recommandé, plus simple) ou préfixé par le workspace (`acme-rh`) ?
