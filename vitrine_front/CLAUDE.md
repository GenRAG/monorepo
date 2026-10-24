# CLAUDE.md — `vitrine_front/`

Site vitrine (landing page) de GenRAG. Vue d'ensemble du monorepo : `../CLAUDE.md`. Le `README.md` du dossier couvre le lancement, le contenu et le déploiement.

## Stack

- **Vite + React 19 + TypeScript**, CSS Modules, GSAP (+ ScrollTrigger), `lucide-react`. Pas de Chakra, pas de Tailwind, pas de framer-motion.
- Site 100 % statique : aucun appel au backend. Seul appel réseau : le formulaire de contact (`POST` JSON vers `VITE_CONTACT_ENDPOINT`, voir `.env.example`).
- N'utilise **pas** `@genrag/workflow` : la maquette de l'éditeur est redessinée dans `src/mockups/`.
- `_archive/` contient l'ancien site Next.js. Il est exclu du build et du lint : ne pas le modifier ni s'en inspirer.
- Hors workspaces yarn racine : `npm install` dans ce dossier (lockfile `package-lock.json`).

## Commandes (depuis `vitrine_front/`)

```bash
npm run dev       # http://localhost:3001
npm run build     # tsc -b + vite build -> dist/
npm run lint
npm run format    # prettier (printWidth 120, 2 espaces : .prettierrc)
CHROME_PATH=/usr/bin/google-chrome node scripts/shots.mjs http://localhost:3001   # toutes les pages, clair et sombre, 1440 et 390 px
```

## Structure (`src/`)

| Chemin | Rôle |
|---|---|
| `routes.ts` | `pages` (adresse, titre, description, libellé de menu de chaque page), `menu` (barre du haut), `footerNav`. Seule table centralisée : les textes sont dans les composants. |
| `main.tsx` | Routeur : choisit la page selon `location.pathname`, pose le titre et la description. `vercel.json` renvoie toutes les adresses vers `index.html`. |
| `pages/` | Une page = un composant qui assemble ses sections dans `<Layout page>`. `pricing/` (offres, estimateur `estimate.ts`, FAQ), `updates/` (journal en markdown), `pages.module.css` (styles partagés des pages secondaires). |
| `illustrations/` | Scènes HTML colorées par tokens, animées au passage de `[data-in]` : `ChatArt` (conversation, ouverture de Créer un assistant), `IndexArt` (base en cours d'indexation, ouverture de Vos documents), `ShareArt` (assistant publié et questions de la semaine, ouverture de Déployer), `UsageArt` (crédits du mois, ouverture de Tarifs), `TeamsArt` (base commune et assistants d'équipe, ouverture de Cas d'usage) `AccessArt` (espace prêt, `CtaBand`) et `ResourceArt` (`UpdatesArt`, `StoryArt`, `SecurityArt` : ouvertures de Mises à jour, Notre histoire et Sécurité, une feuille de style commune). |
| `assets/providers/` | Logos SVG des fournisseurs de modèles (section `Models`), repris de `models.dev/logos/<slug>.svg` comme dans l'app. Affichés en `mask-image` : ils prennent la couleur du texte. |
| `theme.ts` | Thème clair / sombre : `data-scheme` sur `<html>`, posé avant le rendu par le script de `index.html`, choix mémorisé. |
| `sections/` | Une section = `Xxx.tsx` + `Xxx.module.css`. Les sections complexes ont un sous-dossier : `hero/` (ruban, bande de logos), `platform/` (mini-maquettes de la grille), `builder/` (démo de l'éditeur), `share/` (démo de déploiement), `connectors/` (démo des connecteurs), `reasoning/` (démo de comparaison de sources), `assistants/`. Chaque démo garde son scénario dans `data.ts`. `pages/cases.ts` : cas d'usage (page Cas d'usage et section `CaseList`). |
| `mockups/` | Maquettes réutilisables de l'app : `AppSidebar`, `BuilderCanvas` + `builderGraph.ts` (géométrie du schéma, dispositions `wide` et `tall`). |
| `components/` | Transverse : `Layout` (coque d'une page : header, nav latérale, animations, pied de page), `Panel` (section), `PageHero` (ouverture d'une page secondaire), `CtaBand` (appel final), `ui.tsx` (`SectionIntro`, `ButtonLink`, `DocIcon`), `Chrome` (header, bouton de thème, nav latérale, barre de progression), `NavMenu` (menu déroulant), `pageIcons.ts`, `Logo`, `icoFaces.ts`, `DemoCursor`, `reveal.ts`. |
| `motion/` | `stage.ts` (révélations au scroll, section active), `store.ts` (`useActivePanel`, `useIsActivePanel(id)`, `useHasEntered(id)`), `scrubs.ts` (timeline `data-scrub="steps"`), `reduced.ts`, `scenario.ts` (`useScenario`, moteur des démos animées), `MotionContext.tsx` (`useAnchor`). |
| `styles/tokens.css` | Palette reprise de `plateform_front/src/themeNew` (`--grey-*`, `--green-*`, `--violet-*`), puis deux jeux sémantiques (`--text-*`, `--surface-*`, `--border*`, `--accent*`, `--glass-*`, `--fg-rgb`, `--menu-bg`) : sombre et clair. |

## Conventions

- **Textes** : écrits dans le JSX du composant qui les affiche, pas dans un fichier de constantes. Une liste répétitive (cartes, FAQ, offres) = un petit tableau en haut du même fichier. Exception : le journal des mises à jour est en markdown, un fichier `AAAA-MM.md` par mois dans `pages/updates/` (en-tête `date` / `tag`, une section `## Titre` par nouveauté, premier paragraphe = résumé, suite = détail dépliable ; lu par `entries.ts` avec `marked`). Autre exception : le scénario d'une démo animée, partagé entre ses sous-composants (et avec `plateform_front`), vit dans le `data.ts` de son dossier. Espace insécable (U+00A0) avant `? : ! ;` dans les titres, pour éviter un « ? » seul en début de ligne.
- **Couleurs** : via les variables de `styles/tokens.css`. Les valeurs `rgba(...)` sont tolérées pour les opacités d'une couleur de la palette (ex. `rgba(52, 211, 169, 0.12)` = green-400), mais pas de nouvelle teinte hors palette.
- **Pages** : une nouvelle page = une entrée dans `pages` (`routes.ts`), un composant dans `pages/`, une ligne dans `components` de `main.tsx`, et sa place dans `menu` / `footerNav`. Liens entre pages : `href={pages.x.path}` (rechargement complet, pas de routeur client).
- **Sections** : `<Panel id tone label>`. `tone="open"` (fond continu, par défaut), `"slab"` (dalle sombre, avec `glow`), `"light"` (dalle claire). L'`id` est unique dans sa page : la nav latérale se construit seule à partir des `[data-panel]` de la page (`id` + `label`), et une démo sait qu'elle est à l'écran par `useIsActivePanel(id)`. La numérotation « 01, 02… » des `SectionIntro` est un compteur CSS remis à zéro sur `<main>` (`numbered={false}` pour un titre de page).
- **Thèmes** : clair et sombre via les tokens sémantiques, jamais via la palette pour un texte ou un fond qui doit changer. Les traits et voiles s'écrivent `rgba(var(--fg-rgb), x)`. En mode clair, les dalles sombres restent sombres, ainsi que la démo Connecteurs : leur conteneur porte `data-scheme="dark"` (îlot sombre). Les cartes Assistants, les démos de l'éditeur, de Raisonnement et de Partage (sauf le chatbot de l'entreprise, clair par construction) suivent le thème : leurs styles n'utilisent que des tokens sémantiques, et les retouches propres au clair passent par `:global(:root[data-scheme="light"])`. L'app n'a pas cet attribut, donc l'écran de bienvenue reste sombre. La dalle claire réutilise le jeu clair (`[data-theme="light"]`).
- **Grilles « quadrillées »** (Étapes, Pourquoi, Suivi) : cellules jointives à bordures partagées (`var(--border)`), fond transparent, débordement d'une gouttière (`margin-inline: calc(-1 * var(--gutter))`) pour rejoindre les lignes de structure verticales des sections ouvertes.
- **Révélations** : `{...reveal(i)}` sur un élément (fondu décalé de `i × 80 ms`).
- **Démos animées** (`useConnectorDemo`, `useBuilderDemo`, `useShareDemo`, `useReasoningDemo`) : toutes reposent sur `motion/scenario.ts` (`useScenario`), à réutiliser pour toute nouvelle démo : le hook ne décrit que `idle`, `staticState` et une fonction `play(api)` (`update`, `wait`, `click`, `moveCursor`, `env`) ; le moteur gère la boucle, l'arrêt (minuteurs annulés) et l'état figé :
  - scénario async en boucle, interrompu au nettoyage de l'effet ;
  - ne tourne que si la section est active (`useIsActivePanel(id)`), avec un bouton pause ;
  - le curseur est `components/DemoCursor.tsx`, qui vise les éléments marqués `data-demo="…"` ;
  - un `staticState` figé est affiché si `prefersReducedMotion()`.
- **Animations CSS** : `@keyframes` dans le `.module.css` de la section, et toujours un fallback `@media (prefers-reduced-motion: reduce)`.
- **Responsive** : breakpoints les plus utilisés `1023px`, `860px`, `767px`, `640px`, `560px`. Vérifier en 390 px avec `scripts/shots.mjs` (aucun débordement horizontal).
- **Taille des fichiers** : `.tsx` ≤ 200 lignes comme dans l'app ; découper en sous-composants dans le sous-dossier de la section.
- ESLint `react-refresh/only-export-components` : un fichier qui exporte des composants n'exporte pas de données (ex. `icoFaces.ts` séparé de `Logo.tsx`).

## Tests

Aucun test automatisé. La vérification se fait visuellement avec `scripts/shots.mjs` (Playwright, une capture pleine page par page, thème clair / sombre et largeur 1440 / 390 px ; sort en erreur sur une erreur console ou un débordement horizontal). `pages/pricing/estimate.ts` porte ses propres `console.assert` en dev.

## Points d'attention

- Contenu marketing : pas d'affirmation sécurité / conformité / RGPD non validée (TODO dans `sections/Why.tsx` et `pages/Security.tsx` : la page Sécurité ne dit que ce que le code fait). Le récit de `pages/About.tsx` est un brouillon à relire (TODO).
- Les chiffres des Tarifs (`pages/pricing/Plans.tsx` et `pages/pricing/estimate.ts`) recopient `plateform_back/src/plans/plans.config.ts` : les garder alignés.
- Les démos animées (`mockups/`, `sections/builder|share|reasoning` et leurs `data.ts`, `components/DemoCursor|Logo|ui`) sont aussi importées par `plateform_front` (alias `@vitrine`, écran de bienvenue) : ne pas y introduire de dépendance à GSAP ni au contexte de scroll (`motion/stage|store|scrubs`). Un nouveau token utilisé dans ces fichiers doit aussi être défini dans `plateform_front/src/components/Auth/welcome/vitrine/scope.module.css` (ex. `--fg-rgb`).
- Le déploiement Vercel du dossier est séparé de celui de l'app (le `vercel.json` racine build `plateform_front`) : Root Directory `vitrine_front`, output `dist`, `vitrine_front/vercel.json` pour la réécriture des adresses vers `index.html`.
