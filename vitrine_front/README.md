# GenRAG — site vitrine

Site statique (Vite + React + TypeScript, CSS Modules, GSAP/ScrollTrigger, lucide-react).
L'ancien site Next.js est archivé dans `_archive/` (exclu du build et du lint).

## Lancer

```bash
npm install
npm run dev        # http://localhost:3001
npm run build      # typecheck + build statique dans dist/
npm run preview    # sert dist/
npm run lint
```

## Modifier le contenu

- **Textes** : écrits directement dans le composant qui les affiche (`src/sections/*.tsx`, `src/pages/*.tsx`).
  Les listes (cartes, FAQ, offres) sont un petit tableau en haut du même fichier. Les scénarios des démos animées
  sont dans le `data.ts` du dossier de la démo (ex. `src/sections/builder/data.ts`).
- **Pages et menus** : `src/routes.ts`. `pages` donne l'adresse, le titre et la description de chaque page,
  `menu` la barre du haut, `footerNav` le pied de page.
- **Couleurs, typo, rayons** : `src/styles/tokens.css` (repris de `plateform_front/src/themeNew`), en deux jeux
  sombre et clair.
- Une page = un composant dans `src/pages/`, qui assemble des sections (`src/sections/`) dans `<Layout>`.
  Les maquettes réutilisables sont dans `src/mockups/`, les illustrations dans `src/illustrations/`.

## Pages

`/`, `/produit/creer`, `/produit/documents`, `/produit/deployer`, `/cas-usage`, `/tarifs`, `/mises-a-jour`,
`/a-propos`, `/securite`, `/contact`. Le routage est fait par `src/main.tsx` ; `vercel.json` renvoie toutes les
adresses vers `index.html`.

## Thème clair et sombre

Le site s'ouvre en clair, quelle que soit la préférence du système. Le bouton soleil / lune du header mémorise le choix (`src/theme.ts`).

## Formulaire de contact

Copier `.env.example` en `.env` et renseigner `VITE_CONTACT_ENDPOINT`.
Le formulaire envoie un `POST` JSON `{ email, company, role }` et considère toute réponse 2xx comme un succès.
Sans cette variable, le formulaire affiche une erreur explicite.

## Animations

- Scroll natif. `src/motion/stage.ts` révèle les éléments `data-reveal` (fondu + léger glissement, décalés)
  quand ils arrivent à l'écran, et suit la section active pour la navigation.
- `data-scrub="steps"` sur une section joue une fois, à son arrivée, l'animation des éléments `data-step`.
  Désactivé si `prefers-reduced-motion`.
- Les démos « Vos documents » et « Éditeur » sont des scénarios en boucle avec un curseur
  (`sections/connectors/useConnectorDemo.ts`, `sections/builder/useBuilderDemo.ts`) : elles ne tournent que
  quand leur section est active, ont un bouton pause, et affichent un état figé si `prefers-reduced-motion`.
  Les textes et le catalogue de modèles de l'éditeur sont dans `src/sections/builder/data.ts`.

## Vérifier visuellement

```bash
CHROME_PATH=/chemin/vers/chrome node scripts/shots.mjs http://localhost:3001   # captures dans shots/
PAGES=/,/tarifs THEMES=light WIDTHS=390 node scripts/shots.mjs                  # restreindre
```

Une capture pleine page par page, thème et largeur ; le script échoue s'il voit une erreur console ou un
débordement horizontal.

`CHROME_PATH` est optionnel si les navigateurs Playwright sont installés (`npx playwright install chromium`).

## Déployer sur Vercel

Root Directory : `vitrine_front`. Framework : Vite (détecté). Build : `npm run build`. Output : `dist`.
Ajouter `VITE_CONTACT_ENDPOINT` dans les variables d'environnement du projet.
