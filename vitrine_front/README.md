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

- **Tous les textes** : `src/content.ts` (une constante par section).
- **Statut des fonctionnalités** (`available` / `soon` → badge « Bientôt ») : objet `features` en haut de `src/content.ts`.
  Les connecteurs et les blocs de l'éditeur ont aussi un `status` individuel.
- **Couleurs, typo, rayons** : `src/styles/tokens.css` (repris de `plateform_front/src/themeNew`).
- Une section = un composant dans `src/sections/`. Les maquettes réutilisables sont dans `src/mockups/`.

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
  Les textes et le catalogue de modèles de l'éditeur sont dans `builder` (`src/content.ts`).

## Vérifier visuellement

```bash
CHROME_PATH=/chemin/vers/chrome node scripts/shots.mjs http://localhost:3001/   # captures dans shots/
```

`CHROME_PATH` est optionnel si les navigateurs Playwright sont installés (`npx playwright install chromium`).

## Déployer sur Vercel

Root Directory : `vitrine_front`. Framework : Vite (détecté). Build : `npm run build`. Output : `dist`.
Ajouter `VITE_CONTACT_ENDPOINT` dans les variables d'environnement du projet.
