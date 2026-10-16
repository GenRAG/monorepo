# Audit ponytail — périmètre 4 : `vitrine_front/` + racine / infra

**What this repo does:** `vitrine_front/` est le site vitrine statique de GenRAG (Vite, React 19, GSAP). C'est une seule page avec des démos animées de l'app, et un formulaire de contact qui envoie un `POST` vers une URL externe. Une partie de ces démos est aussi importée par `plateform_front` (écran de bienvenue) via l'alias `@vitrine`. La racine contient la CI GitHub Actions, le `docker-compose.yml` de dev, les scripts `scripts/*.sh`, le `vercel.json` de l'app et le `Dockerfile` du back.
Charge supposée : site public à fort trafic mais 100 % statique (aucune charge serveur) ; pour l'infra, une petite équipe (2 à 5 devs) qui pousse plusieurs fois par jour et un déploiement Vercel à chaque push.

Commit audité : `904c1d3` (origin/dev). Lancé : `npx tsc -b --noEmit` (0 erreur), `npx eslint .` (0 erreur), `vite build` dans un dossier temporaire (JS 449 Ko / 150 Ko gzip, CSS 89 Ko / 19 Ko gzip : raisonnable).

---

## Must fix (à corriger absolument)

1. **Une modification du site vitrine peut casser l'app sans que la CI le voie** (`.github/workflows/jobs.yml:29-33`, `plateform_front/craco.config.js:8,14`) — NOUVEAU — décision humaine requise (CI)
   - **Ce que c'est :** Le job `changes` décide quels jobs lancer selon les dossiers modifiés. Le build du front ne tourne que si `plateform_front/**`, `packages/**` ou `yarn.lock` changent.
   - **Problème :** `plateform_front` compile directement 30 fichiers de `vitrine_front/src` (alias `@vitrine` : `content.ts`, `mockups/*`, `sections/builder|share|reasoning/*`, `motion/scenario.ts`…). Une PR qui ne touche que `vitrine_front/` (par exemple renommer l'export `useShareDemo`, importé par `plateform_front/src/components/Auth/welcome/vitrine/ShareDemo.tsx:4`) passe la CI au vert, puis le build Vercel de l'app échoue après le merge.
   - **Correction :** Ajouter `- 'vitrine_front/src/**'` dans le filtre `frontend` (une ligne).
   - **Si on ne fait rien :** La prod de l'app ne se déploie plus, et on ne le découvre qu'après le merge.

2. **Le container `server` ne trouve pas la base de données avec le `.env` documenté** (`docker-compose.yml:85-86`, `plateform_back/.env.example:12`) — NOUVEAU — décision humaine requise (infra)
   - **Ce que c'est :** En dev, le back tourne dans le container `server` (doc du back, l. 84). Le dossier est monté en volume, donc le back lit `plateform_back/.env`. Compose ne remplace que `REDIS_HOST`.
   - **Problème :** `.env.example` donne `DATABASE_URL=postgres://admin:password@localhost:5433/database`. Dans le container, `localhost` désigne le container lui-même, pas Postgres. Cas concret : nouveau dev, `cp .env.example .env`, `./scripts/dev.sh` → Prisma échoue (« Can't reach database server at localhost:5433 »). `scripts/migrate.sh` (qui lance Prisma dans ce même container) échoue de la même façon.
   - **Correction :** Ajouter `DATABASE_URL: postgres://admin:password@postgres:5432/database` sous `environment:` du service `server` (comme `REDIS_HOST`). `dev.sh:29` utilise déjà ce format pour la base de test.
   - **Si on ne fait rien :** Chaque nouveau dev perd du temps au premier lancement, ou garde un `.env` qui ne marche plus quand il lance le back hors Docker.

3. **`./scripts/dev.sh e2e` ne peut pas marcher** (`scripts/dev.sh:25-30`, `plateform_back/Dockerfile:1-3`) — NOUVEAU (bash) + R-04 toujours ouvert (`sleep 5`) — décision humaine requise (scripts d'infra)
   - **Ce que c'est :** La commande démarre `postgres_test`, attend 5 s, puis lance les migrations et les e2e dans le container `server` avec `bash -lc`.
   - **Problème :** L'image est `node:23-alpine` et le Dockerfile n'ajoute que `postgresql-client` : il n'y a pas de `bash`, donc `docker exec server bash -lc …` répond « executable file not found ». En plus, la commande ne démarre pas `server` (si le container est arrêté, `docker exec` échoue). Le script n'a pas `set -e`, donc si la migration échoue les tests tournent quand même sur une base vide. Même course dans `unit` (l. 34-35) : `up -d server` puis `docker exec` tout de suite, pendant que le container fait encore son `yarn install`.
   - **Correction :** Mettre `set -euo pipefail` en tête, remplacer `bash -lc` par `sh -c`, et remplacer `up -d postgres_test` + `sleep 5` par `docker compose up -d --wait postgres_test server`.
   - **Si on ne fait rien :** Personne ne lance les e2e en local. Les régressions back ne sont vues qu'en CI.

4. **Site public sans mentions légales, formulaire sans information RGPD** (`vitrine_front/src/content.ts:451-452,476-477`, `src/sections/Contact.tsx:62-120`, `index.html:23`) — V-02 et V-03 toujours ouverts — décision humaine requise (contenu juridique)
   - **Ce que c'est :** Le pied de page a `links: []` (aucun lien légal), et le formulaire de contact collecte email, entreprise et fonction.
   - **Problème :** Un site français public doit afficher des mentions légales (loi LCEN). Un formulaire qui collecte des données doit dire à quoi elles servent, combien de temps on les garde, et quels sont les droits de la personne (RGPD, art. 13). Rien de tout ça n'est présent. Aussi : si `VITE_CONTACT_ENDPOINT` manque en prod, le visiteur voit le message interne « Formulaire non configuré (VITE_CONTACT_ENDPOINT manquant) » (`content.ts:469`).
   - **Correction :** Ajouter une page ou une section mentions légales et confidentialité, et une phrase d'information sous le bouton d'envoi. Mettre un message neutre pour le cas « non configuré ».
   - **Si on ne fait rien :** Risque de sanction (CNIL) et image peu sérieuse auprès des clients B2B.

## Should fix (à corriger)

5. **Dans l'app, les démos de la vitrine ignorent « réduire les animations »** (`vitrine_front/src/mockups/BuilderCanvas.module.css:96`, `src/sections/builder/NodePalette.module.css:87`, `src/sections/share/ShareBrowser.module.css:75,245`) — NOUVEAU
   - **Ce que c'est :** Ces fichiers ont des animations CSS infinies (pointillés qui défilent, curseur qui clignote, spinner). Sur le site, une règle globale les coupe pour les gens qui ont activé « réduire les animations » (`src/styles/global.css:132-144`).
   - **Problème :** `plateform_front` importe ces modules CSS mais pas `global.css`. Son écran de bienvenue (`plateform_front/src/components/Auth/welcome/`) n'a de règle « reduced motion » que pour son entrée (`WelcomeCollage.module.css:68-72`). Cas concret : un utilisateur avec « réduire les animations » voit l'état figé du builder, mais ses arêtes de réglage défilent sans fin (`.settingEdge { animation: dash 1.2s linear infinite }`). Le `CLAUDE.md` de la vitrine demande pourtant un fallback dans chaque `.module.css` ; 10 fichiers sur 13 avec `@keyframes` n'en ont pas.
   - **Correction :** Dans les modules partagés avec l'app (BuilderCanvas, NodePalette, ShareBrowser, BlockOverview, ModelPicker, DemoCursor), ajouter `@media (prefers-reduced-motion: reduce) { .x { animation: none; } }` sur les classes animées.
   - **Si on ne fait rien :** Gêne réelle pour les personnes sensibles au mouvement (troubles vestibulaires), dès l'inscription.

6. **La CI ne vérifie ni la vitrine, ni les tests du package, et le lint front ne bloque rien** (`.github/workflows/jobs.yml:123-148,151-162`, `plateform_front/package.json:86`) — R-02 toujours ouvert — décision humaine requise (CI)
   - **Ce que c'est :** La CI a un job back complet, et un job front qui lance seulement le lint et le build de `plateform_front`.
   - **Problème :** Il n'y a pas de job `vitrine_front` (`npm ci && npm run lint && npm run build`), et rien ne lance `yarn typecheck` / `yarn test` de `packages/workflow` (des tests `node --test` existent). Le lint front a `continue-on-error: true` et le script lance `eslint --fix` : en CI, les erreurs réparables sont corrigées en silence puis jetées. Le job `frontend` n'a pas de `timeout-minutes`. Le job `mirror` utilise toujours `setup-node@v2` / `checkout@v3` et pousse chaque branche, même si les tests échouent.
   - **Correction :** Ajouter un job `vitrine` (filtre `vitrine_front/**`) et deux étapes `yarn --cwd packages/workflow typecheck` / `test` dans `frontend`. Lancer `eslint` sans `--fix` en CI. Ajouter `timeout-minutes: 15`. Ajouter `needs: [backend, frontend]` au mirror et passer les actions en v4.
   - **Si on ne fait rien :** Une vitrine qui ne compile plus, ou une sérialisation `blocks` cassée dans le package, arrive en prod sans alerte.

7. **Le même code de démo est compilé avec deux versions de `lucide-react`** (`plateform_front/craco.config.js:15`, `plateform_front/tsconfig.json` (paths `lucide-react`), `vitrine_front/package.json:15`) — NOUVEAU
   - **Ce que c'est :** La vitrine se compile avec `lucide-react` 1.48. L'app force sa propre version (0.542) pour tout, y compris les fichiers `@vitrine`.
   - **Problème :** 1.48 a des icônes que 0.542 n'a pas. Cas concret : un dev ajoute l'icône `BellCheck` (ou `Balloon`) dans `sections/share/ShareBrowser.tsx`. `npm run build` de la vitrine passe, mais le build de l'app échoue (« export 'BellCheck' was not found in 'lucide-react' »). Avec le constat 1 non corrigé, la CI ne le voit même pas.
   - **Correction :** Aligner les deux versions : passer l'app en `lucide-react@^1.48`, ou figer la vitrine sur `0.542.0`. Choisir une seule version pour le code partagé.
   - **Si on ne fait rien :** Des builds de l'app cassés de façon incompréhensible pour qui ne travaille que sur la vitrine.

8. **L'ordre des sections est écrit deux fois, et les démos dépendent des deux** (`vitrine_front/src/App.tsx:51-61`, `src/content.ts:17-29`, `src/motion/MotionContext.tsx:22`) — NOUVEAU
   - **Ce que c'est :** `nav` (dans `content.ts`) donne l'ordre des sections pour le menu, et `sectionIndex(id)` le transforme en numéro. Le scroll calcule la section active d'après l'ordre réel dans la page (`stage.ts:21,88-93`).
   - **Problème :** `App.tsx` ne lit pas `nav` : il écrit les sections à la main (le `CLAUDE.md` de la vitrine dit l'inverse). Cas concret : on déplace `connecteurs` avant `editeur` dans `nav` sans toucher `App.tsx`. La démo de l'éditeur tourne alors quand on regarde la section Documents, l'autre ne tourne jamais, et le menu surligne le mauvais lien. Les numéros `SectionIntro index={5}`… sont aussi écrits à la main.
   - **Correction :** Dans `App.tsx`, une table `const sections: Record<SectionId, () => JSX.Element> = { accueil: Hero, … }` et `nav.map(({ id }) => { const S = sections[id]; return <S key={id} />; })`. Le typage oblige alors à avoir une section par entrée de `nav`.
   - **Si on ne fait rien :** Un simple changement d'ordre du menu casse les démos en silence (il n'y a aucun test).

9. **Le système `data-scrub` est du code mort, et la doc dit qu'il sert** (`vitrine_front/src/motion/scrubs.ts:1-45`, `src/components/Panel.tsx:13,21,30`, `src/motion/stage.ts:4,29-33,67,112`, `README.md:32`, `CLAUDE.md:32`) — NOUVEAU (lean)
   - **Ce que c'est :** `scrubs.ts` construit une timeline GSAP pour les sections marquées `data-scrub="steps"` et les éléments `data-step` / `data-kind`.
   - **Problème :** Aucun composant ne passe `scrub` à `Panel`, et aucun élément n'a `data-step` ou `data-kind` (grep sur tout `vitrine_front/src` et `plateform_front/src`). `Steps.tsx` utilise seulement `reveal()`. La branche `"detach"` n'est jamais utilisée non plus. Le README et le `CLAUDE.md` décrivent pourtant ce mécanisme pour la section Étapes.
   - **Correction :** Supprimer `scrubs.ts`, la prop `scrub` de `Panel`, la `Map timelines` de `stage.ts`, et les deux phrases de doc. Même chose pour `panelStore.getActive` (`store.ts:14`), jamais appelé.
   - **Si on ne fait rien :** ~55 lignes à lire et à maintenir pour rien, et une doc qui envoie le lecteur sur une fausse piste.

10. **`Dockerfile` du back : image non figée, en root, et construite pour rien en dev** (`plateform_back/Dockerfile:1,8,13,15`, `docker-compose.yml:74-92`) — B-33 toujours ouvert — décision humaine requise (infra)
    - **Ce que c'est :** Une image Node qui installe les dépendances, compile le back et lance `prisma migrate deploy` puis le serveur au démarrage.
    - **Problème :** `node:23-alpine` n'est pas une version LTS (elle ne reçoit plus de correctifs). `yarn install` sans `--frozen-lockfile` peut installer d'autres versions que celles testées en CI. Le serveur tourne en root. Compose réutilise cette image en dev, mais remplace la commande et monte le code par-dessus : le `yarn build:production` de l'image ne sert à rien en dev, et s'il échoue, `docker compose up` ne démarre plus.
    - **Correction :** `FROM node:22-alpine`, `yarn install --frozen-lockfile`, `USER node`. Pour le dev, `target:` d'un stage multi-stage sans l'étape de build.
    - **Si on ne fait rien :** Builds de prod pas reproductibles, et surface d'attaque plus grande que nécessaire.

11. **Vercel : installation non figée et build inutile du package** (`vercel.json:2-3`, `plateform_front/vercel.json`, `CLAUDE.md:32`, `packages/workflow/CLAUDE.md:7`) — NOUVEAU — décision humaine requise (déploiement)
    - **Ce que c'est :** Le `vercel.json` racine installe avec `yarn install --production=false`, puis build `packages/workflow` (vers `dist/`) avant l'app.
    - **Problème :** Sans `--frozen-lockfile`, si `package.json` et `yarn.lock` divergent, Vercel choisit d'autres versions que la CI (Vercel déploie sans attendre la CI). Le build de `packages/workflow` ne sert à rien : l'app compile `packages/workflow/src` par l'alias craco (`craco.config.js:13`), et rien n'importe `dist/` (grep). S'il échoue, il bloque quand même le déploiement. Il y a aussi un second `plateform_front/vercel.json` (seulement les rewrites), et un des deux est ignoré selon le « Root Directory » choisi sur Vercel.
    - **Correction :** `"installCommand": "yarn install --frozen-lockfile"`, `"buildCommand": "yarn --cwd plateform_front build"`, supprimer le `vercel.json` qui n'est pas utilisé, et corriger « `dist/` sert … au build Vercel » dans les deux `CLAUDE.md`.
    - **Si on ne fait rien :** Déploiements plus lents, avec des dépendances qui peuvent changer sans prévenir.

12. **La doc racine décrit mal l'API du moteur RAG** (`CLAUDE.md:76-77`, `plateform_back/src/rag-engine/rag-execution.service.ts:62,77,178,246,261,280`) — R-05 toujours ouvert, avec un nouveau détail
    - **Ce que c'est :** La section « API RAG externe » du `CLAUDE.md` racine, que tout le monde lit en premier.
    - **Problème :** Elle annonce `POST /rag/index` (`file` + `document_id`) et un corps `{ pipeline, query }`. Le back appelle en réalité `POST /ingest`, `GET /job/:id/status`, `DELETE /documents`, avec le corps `{ pipeline: { blocks }, query, org_id }`. Nouveau : « `RAG_MOCK=true` court-circuite l'appel » est faux. Le back appelle quand même le moteur, sur `/rag/stream/mock`, donc il faut que le moteur tourne.
    - **Correction :** Réécrire ces deux puces d'après `rag-execution.service.ts`.
    - **Si on ne fait rien :** Un dev qui lance l'app avec `RAG_MOCK=true` sans moteur RAG ne comprend pas pourquoi le playground échoue. Le contrat entre services est mal connu.

## Nice to have (bonus)

13. **Ports de dev ouverts à tout le réseau** (`docker-compose.yml:13,30,46,57,79`) — R-03 toujours ouvert — décision humaine requise (infra)
    - **Ce que c'est :** Postgres (`admin/password`), pgAdmin (`admin/admin`), Redis (sans mot de passe) et l'API sont publiés en `"5433:5432"`, etc.
    - **Problème :** Sans `127.0.0.1:`, Docker les expose sur toutes les interfaces. Sur un Wi-Fi public, n'importe qui sur le réseau peut lire ou vider la base de dev.
    - **Correction :** Préfixer chaque port : `"127.0.0.1:5433:5432"`.
    - **Si on ne fait rien :** Fuite possible des données de dev (souvent des copies de vraies données).

14. **`start.sh` laisse le front tourner après l'arrêt** (`scripts/start.sh:6-13`) — R-04 toujours ouvert — décision humaine requise (scripts)
    - **Ce que c'est :** Le script lance `yarn dev` du front en arrière-plan, puis `docker compose up`.
    - **Problème :** `FRONT_PID` est enregistré mais jamais utilisé. Après Ctrl+C, le front tourne toujours sur le port 3000, et le lancement suivant demande de changer de port.
    - **Correction :** `trap 'kill "$FRONT_PID"' EXIT` juste après la ligne 8.
    - **Si on ne fait rien :** Des processus orphelins et un port occupé.

15. **Lockfiles périmés suivis par git, et lockfile de la vitrine couvert par le `.gitignore`** (`.gitignore:41-43`, `plateform_back/package-lock.json`, `packages/workflow/package-lock.json`, `packages/workflow/yarn.lock`, `plateform_front/yarn.lock`) — R-01 / W-05 toujours ouverts + détail NOUVEAU
    - **Ce que c'est :** Les workspaces yarn utilisent le `yarn.lock` racine ; le back a son propre `yarn.lock`.
    - **Problème :** Quatre lockfiles ne sont lus par personne et ont divergé (par exemple `packages/workflow/yarn.lock` fige `lucide-react` 0.556 et `react` 19.2.4 ; la racine a 0.542 et 19.2.5). Nouveau : la règle `package-lock.json` (l. 43) couvre aussi `vitrine_front/package-lock.json`, qui est le vrai lockfile de la vitrine (`git check-ignore` le confirme). S'il est un jour supprimé puis régénéré, git ne le reprend plus.
    - **Correction :** Supprimer les quatre fichiers, et ajouter `!vitrine_front/package-lock.json` sous la ligne 43.
    - **Si on ne fait rien :** Des montées de version et des alertes de sécurité sur des fichiers que personne n'utilise.

16. **`.gitignore` ne protège pas `dump.rdb` ni `RAG-GenRag/`** (`.gitignore`, `CLAUDE.md:20`) — NOUVEAU
    - **Ce que c'est :** `dump.rdb` est la sauvegarde que Redis écrit dans le dossier où il est lancé. `RAG-GenRag/` est un clone local que le `CLAUDE.md` dit de ne pas committer.
    - **Problème :** `dump.rdb` n'est ignoré que dans le `.git/info/exclude` local de cette machine, pas pour les autres devs. Un `redis-server` lancé depuis `plateform_back/` puis un `git add -A` committe le contenu de Redis (liste noire des JWT, jobs BullMQ). `RAG-GenRag/` n'est ignoré nulle part : `git add -A` l'ajoute comme dépôt imbriqué.
    - **Correction :** Ajouter `dump.rdb` et `/RAG-GenRag/` au `.gitignore` racine.
    - **Si on ne fait rien :** Risque de committer par erreur des données Redis ou un autre dépôt.

17. **`_archive/` : ancien site Next.js gardé pour rien** (`vitrine_front/_archive/`, 32 fichiers, 1,1 Mo) — V-04 toujours ouvert — décision humaine requise
    - **Ce que c'est :** L'ancien site, exclu du build et du lint, mais toujours suivi par git.
    - **Problème :** Personne ne l'importe (grep : seules des mentions dans la doc). Son `yarn.lock` fige `next@15.3.3`, une version avec des failles connues : les alertes de sécurité GitHub vont signaler un site qui ne tourne plus nulle part. `public/deploy.png` pèse à lui seul 676 Ko dans chaque clone.
    - **Correction :** `git rm -r vitrine_front/_archive` (l'historique git le garde) et retirer les mentions dans `README.md:4`, `CLAUDE.md:10`, `eslint.config.js:8`.
    - **Si on ne fait rien :** Du poids mort et des fausses alertes de sécurité.

18. **Déclencheurs de la CI : `ga-ignore-` ne marche pas, et chaque PR tourne deux fois** (`.github/workflows/jobs.yml:3-9`) — NOUVEAU — décision humaine requise (CI)
    - **Ce que c'est :** `branches-ignore: - ga-ignore-` doit ignorer les branches de brouillon, et le workflow réagit à `push` et à `pull_request`.
    - **Problème :** Le motif est comparé au nom entier : seule une branche nommée exactement `ga-ignore-` est ignorée, pas `ga-ignore-wip`. Et sans `concurrency`, un push sur une branche avec une PR ouverte lance tout deux fois (back + e2e), et les anciens runs ne sont jamais annulés.
    - **Correction :** `- 'ga-ignore-**'`, et au niveau du workflow : `concurrency: { group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true }`.
    - **Si on ne fait rien :** Des minutes de CI gaspillées, et des branches de brouillon poussées vers le miroir externe.

3 petits constats laissés de côté (`aria-roledescription` sur un `div` sans rôle dans `Assistants.tsx:232`, ancien message d'erreur qui reste affiché après une nouvelle saisie invalide dans `Contact.tsx`, commentaire obsolète « mode épinglé » dans `scrubs.ts:4`).

Vérifié sans problème (pas de constat) : nettoyage GSAP/ScrollTrigger (`gsap.matchMedia` + `mm.revert()` au démontage, observers et listener de scroll retirés) ; minuteurs des démos (`useScenario` annule chaque `setTimeout` via `AbortController`, `useTypewriter` nettoie son `setInterval`, tous les `ResizeObserver` sont déconnectés) ; état figé des démos en « réduire les animations » sur le site ; titres (un seul `h1`, puis `h2`/`h3`) ; pas d'`<img>` sans `alt` ; contraste du texte principal (≥ 5,3:1 ; seul le texte décoratif des maquettes `role="img"` descend à 3,5–4,1:1) ; palette `tokens.css` identique à `themeNew/foundations/colors.ts` (grey, green, red, orange, olive ; `violet` n'existe pas dans `themeNew`, mais l'app utilise la même teinte en dur dans `WorkflowMiniMap.tsx:5`) ; les fichiers importés par l'app n'importent ni GSAP ni `motion/stage|store|scrubs` (règle du `CLAUDE.md` respectée) ; aucun artefact de build suivi par git (`dist/`, `build/`, `tailwind.generated.css`, `dump.rdb`) ; aucun vrai secret suivi par git hors `rag-engine/` (la clé `sk_live_…` de `ApiKeysSection.tsx:14` est fausse, déjà F-11 ; le token Mixpanel de `plateform_front/src/lib/mixpanel.ts:3` est public par nature).

---

**Verdict:** Code de la vitrine sain (typecheck, lint et nettoyage des animations OK). À corriger d'abord : le filtre de CI qui ignore `vitrine_front/` alors que l'app en dépend (1), puis le `DATABASE_URL` du container `server` (2) et `dev.sh e2e` (3), qui empêchent le dev local de marcher tel que documenté.

**Lean:** -55 lignes de code (système `data-scrub`, `getActive`), plus `vitrine_front/_archive/` (32 fichiers, 1,1 Mo) et 4 lockfiles périmés (~28 000 lignes générées) ; -0 dépendance.

**Not checked:** `rag-engine/` et `RAG-GenRag/` (hors périmètre) ; je n'ai pas lancé Docker (le manque de `bash` dans l'image vient de la lecture du Dockerfile : aucun `apk add bash`), ni la CI, ni le build de `plateform_front` ; les réglages du projet Vercel (Root Directory, variables comme `VITE_CONTACT_ENDPOINT`) ne sont pas visibles depuis le dépôt ; le clone est superficiel (`--depth`), donc je n'ai pas cherché de secrets dans tout l'historique git ; pas de test d'accessibilité dans un navigateur (lecteur d'écran, navigation au clavier) ni de mesure Lighthouse ; `docs/` vérifié seulement sur les points de R-05 (`docs/greenlight-review/beta_test_plan.md` est toujours un doublon exact de `docs/beta_test_plan.md`, partie de R-05 encore ouverte).
