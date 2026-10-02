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
CHROME_PATH=/usr/bin/google-chrome node scripts/shots.mjs http://localhost:3001/   # captures dans shots/
```

## Structure (`src/`)

| Chemin | Rôle |
|---|---|
| `content.ts` | **Tous les textes du site**, une constante par section (`hero`, `steps`, `builder`, `share`, `analytics`…), plus `nav` (ordre des sections). |
| `App.tsx` | Assemble les sections dans l'ordre de `nav`. |
| `sections/` | Une section = `Xxx.tsx` + `Xxx.module.css`. Les sections complexes ont un sous-dossier : `hero/` (animation d'ingestion), `builder/` (démo de l'éditeur), `share/` (démo de déploiement), `connectors/` (démo des connecteurs), `reasoning/` (démo de comparaison de sources). |
| `mockups/` | Maquettes réutilisables de l'app : `AppSidebar`, `BuilderCanvas` + `builderGraph.ts` (géométrie du schéma, dispositions `wide` et `tall`). |
| `components/` | Transverse : `Panel` (section), `ui.tsx` (`SectionIntro`, `ButtonLink`, `DocIcon`), `Chrome` (header, nav latérale, barre de progression), `Logo`, `icoFaces.ts`, `DemoCursor`, `reveal.ts`. |
| `motion/` | `stage.ts` (révélations au scroll, section active), `store.ts` (`useActivePanel`, `useHasEntered`), `scrubs.ts` (timeline `data-scrub="steps"`), `reduced.ts`, `MotionContext.tsx` (`useAnchor`, `sectionIndex`). |
| `styles/tokens.css` | Tokens repris de `plateform_front/src/themeNew` (`--grey-*`, `--green-*`, `--violet-*`, sémantiques `--text-*`, `--border*`, `--accent*`, `--glass-*`, `--r-*`, `--gutter`, `--ease-out`). |

## Conventions

- **Textes** : jamais en dur dans un composant, toujours dans `content.ts`.
- **Couleurs** : via les variables de `styles/tokens.css`. Les valeurs `rgba(...)` sont tolérées pour les opacités d'une couleur de la palette (ex. `rgba(52, 211, 169, 0.12)` = green-400), mais pas de nouvelle teinte hors palette.
- **Sections** : `<Panel id tone label>`. `tone="open"` (fond continu, par défaut), `"slab"` (dalle sombre, avec `glow`), `"light"` (une seule dalle claire sur le parcours). L'`id` doit exister dans `nav` de `content.ts`, et `SectionIntro index` suit l'ordre de `nav`.
- **Grilles « quadrillées »** (Étapes, Pourquoi, Suivi) : cellules jointives à bordures partagées (`var(--border)`), fond transparent, débordement d'une gouttière (`margin-inline: calc(-1 * var(--gutter))`) pour rejoindre les lignes de structure verticales des sections ouvertes.
- **Révélations** : `{...reveal(i)}` sur un élément (fondu décalé de `i × 80 ms`).
- **Démos animées** (`useConnectorDemo`, `useBuilderDemo`, `useShareDemo`, `useReasoningDemo`) : même patron à réutiliser pour toute nouvelle démo :
  - scénario async en boucle, annulé par un symbole `ABORT` dans le nettoyage de l'effet ;
  - ne tourne que si la section est active (`useActivePanel() === sectionIndex(id)`), avec un bouton pause ;
  - le curseur est `components/DemoCursor.tsx`, qui vise les éléments marqués `data-demo="…"` ;
  - un `staticState` figé est affiché si `prefersReducedMotion()`.
- **Animations CSS** : `@keyframes` dans le `.module.css` de la section, et toujours un fallback `@media (prefers-reduced-motion: reduce)`.
- **Responsive** : breakpoints les plus utilisés `1023px`, `860px`, `767px`, `640px`, `560px`. Vérifier en 390 px avec `scripts/shots.mjs` (aucun débordement horizontal).
- **Taille des fichiers** : `.tsx` ≤ 200 lignes comme dans l'app ; découper en sous-composants dans le sous-dossier de la section.
- ESLint `react-refresh/only-export-components` : un fichier qui exporte des composants n'exporte pas de données (ex. `icoFaces.ts` séparé de `Logo.tsx`).

## Tests

Aucun test automatisé. La vérification se fait visuellement avec `scripts/shots.mjs` (Playwright, captures 1440, 1280 et 390 px, remonte les erreurs console).

## Points d'attention

- Contenu marketing : pas d'affirmation sécurité / conformité / RGPD non validée (TODO dans `sections/Why.tsx`).
- Le déploiement Vercel du dossier est séparé de celui de l'app (le `vercel.json` racine build `plateform_front`) : Root Directory `vitrine_front`, output `dist`.
