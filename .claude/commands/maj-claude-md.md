Crée ou mets à jour les fichiers CLAUDE.md du projet. Ne modifie aucun code : tu écris uniquement la documentation.

## Étape 1 : explorer le projet
- Structure générale : dossiers front et back, monorepo ou non.
- Front : version de Chakra UI, fichier de thème, tokens de couleur et semantic tokens définis, composants partagés existants, hooks existants, dossiers transverses présents à la racine de `src/` (hooks, utils, constants, types…), configuration Redux Toolkit / RTK Query (store, baseQuery, API slices existants), composants Skeleton existants.
- Back : organisation des modules NestJS, lib de validation, ORM et gestion des migrations, configuration (ConfigModule, variables d'environnement), guards et stratégie d'authentification, filtres d'exception, logger, Swagger si présent.
- Tests : frameworks utilisés côté front et back, emplacement et conventions des tests existants.
- Types partagés entre front et back : existent-ils, et où ?
- Commandes utiles (dev, build, lint, test) dans les package.json.

## Étape 2 : analyser les évolutions depuis la dernière génération
- Si un CLAUDE.md existe, lis le marqueur `<!-- claude-md: commit=<hash> date=<date> -->` en fin de fichier.
- S'il est présent, lance `git log --oneline <hash>..HEAD` et `git diff --stat <hash>..HEAD` pour identifier les features ajoutées, modifiées ou supprimées : nouveaux modules NestJS, nouvelles pages ou routes, nouveaux API slices, nouveaux composants partagés, nouvelles dépendances.
- S'il est absent (ou sans git), compare la section Features existante à la structure réelle du projet.
- Vérifie aussi si les conventions réelles ont évolué (nouvelle lib, nouveau dossier transverse) et adapte les règles en conséquence.
- Conserve le contenu que j'ai rédigé à la main. Si une règle existante te semble obsolète ou en contradiction avec le code, signale-la au lieu de la supprimer.

## Étape 3 : organisation des fichiers
- CLAUDE.md racine : vue d'ensemble, commandes, carte des features.
- CLAUDE.md dans le dossier front et dans le dossier back : conventions propres à chacun.
- Règles courtes et actionnables, en citant les vrais chemins, noms de tokens et fichiers trouvés à l'étape 1. Pas de formulations vagues. Vise moins de 150 lignes par fichier.

## Étape 4 : contenu à intégrer

### Racine : carte des features
Pour chaque feature, une ligne : nom, rôle en une phrase, dossier(s) front, module back, API slice associé. Rien de plus détaillé, le code fait foi.

### Front (React + TypeScript + Chakra UI + Redux Toolkit)

**Style et composants**
- Toujours utiliser les tokens de couleur du thème (lister les tokens et le chemin du thème). Jamais de couleur en dur.
- Utiliser les props de style et composants Chakra plutôt que du CSS custom.
- Réutiliser les composants existants avant d'en créer un nouveau.
- Dès qu'un pattern d'UI est dupliqué ou clairement destiné à se répéter, l'extraire en composant réutilisable et typé. Ne pas abstraire ce qui n'est utilisé qu'une fois et n'a pas vocation à l'être.
- Un fichier .tsx ne dépasse pas 200 lignes. Au-delà, découper par responsabilité (sous-composants, hooks, utils), pas artificiellement.
- Extraire la logique (état complexe, effets, logique métier) dans des hooks personnalisés `useXxx` quand ça allège le composant ou que la logique est réutilisable.
- Props typées avec des interfaces explicites, TypeScript strict, pas de `any`.

**Organisation des dossiers**
- Les dossiers `utils`, `hooks`, `constants`, `types` (et tout dossier du même genre contenant des fichiers propres à une feature) ne sont jamais créés dans le dossier d'une feature. Ils existent à la racine de `src/` : y placer le fichier dans un sous-dossier au nom de la feature.
  - ✅ `plateforme_front/src/hooks/agents/useExemple.ts`
  - ❌ `plateforme_front/src/pages/agents/hooks/useExemple.ts`
  - Même logique pour `src/utils/agents/`, `src/constants/agents/`, etc.
- Vérifier si le sous-dossier de la feature existe avant de le créer. Un élément utilisé par plusieurs features reste à la racine du dossier transverse (ex. `src/hooks/useDebounce.ts`).

**Appels API et cache (RTK Query)**
- Tous les appels API passent par RTK Query. Jamais de fetch ou axios direct dans un composant.
- Un API slice par feature, rangé selon la convention de dossiers ci-dessus, injecté dans l'API de base (`injectEndpoints`) si c'est le pattern du projet.
- Utiliser la baseQuery commune pour l'URL, l'authentification et la gestion des erreurs. Ne pas la dupliquer.
- Cache : déclarer `providesTags` sur les queries et `invalidatesTags` sur les mutations pour que les données se rafraîchissent automatiquement. Pas de `refetch` manuel quand une invalidation de tag suffit.
- Ne pas recopier des données serveur dans un slice Redux classique ou un `useState` : le cache RTK Query est la source de vérité. Les slices classiques servent uniquement à l'état client (UI, préférences, filtres…).
- Typer les requêtes et réponses de chaque endpoint.
- Utiliser les mises à jour optimistes (`onQueryStarted`) seulement quand l'UX le justifie.

**États de chargement, d'erreur et vides**
- Tout composant qui dépend de données chargées affiche un Skeleton Chakra qui reprend la forme du contenu final, au niveau du composant concerné, pas un spinner pleine page.
- `isLoading` (premier chargement) déclenche le skeleton. `isFetching` (rechargement) ne doit pas faire disparaître le contenu déjà affiché.
- Les skeletons réutilisés à plusieurs endroits deviennent des composants dédiés.
- Toujours gérer l'état d'erreur et l'état vide, pas uniquement le cas nominal.

### Back (NestJS)

**Architecture**
- Un dossier par module métier : `xxx.module.ts`, `xxx.controller.ts`, `xxx.service.ts`, `dto/`, entités et types associés.
- Controllers fins : ils valident via DTO et délèguent au service. Aucune logique métier dans un controller.
- Services : si une méthode devient trop longue, la découper en méthodes privées nommées clairement. Si un service grossit trop, le scinder en services spécialisés.
- Design patterns (repository, strategy, factory…) quand ils apportent quelque chose, jamais par principe.
- Dépendances entre modules explicites et limitées. Éviter les dépendances circulaires.

**Validation et données**
- Toute donnée entrante passe par un DTO validé.
- `ValidationPipe` global avec `whitelist: true`, `forbidNonWhitelisted: true` et `transform: true`.
- Ne jamais renvoyer directement une entité contenant des champs sensibles : utiliser un DTO de réponse ou une sérialisation adaptée.
- Pagination sur les endpoints qui renvoient des listes potentiellement longues.
- Schéma de base de données modifié uniquement via migrations (pas de synchronisation automatique hors développement local).

**Configuration, sécurité et erreurs**
- Configuration via `ConfigModule` avec validation des variables d'environnement. Pas de `process.env` éparpillé dans le code.
- Authentification et rôles via guards et décorateurs, jamais vérifiés à la main dans les controllers ou services.
- Erreurs via les exceptions NestJS, avec un format de réponse d'erreur cohérent (filtre global si le projet en a un).
- Logger NestJS, pas de `console.log`.
- TypeScript strict, pas de `any`.

**Cohérence front / back**
- Les types front des requêtes et réponses doivent correspondre aux DTO du back. Si des types partagés existent, les utiliser. Sinon, signaler le risque de divergence.

### Tests
- Suivre les frameworks et conventions de tests détectés à l'étape 1.
- Back : toute nouvelle logique métier dans un service est accompagnée de tests unitaires.
- Front : tester les hooks personnalisés et les utils qui contiennent de la logique.
- Si aucun setup de tests n'existe d'un côté, le signaler au lieu d'en imposer un.

## Étape 5 : finaliser
- Ajoute ou mets à jour en fin de CLAUDE.md racine le marqueur `<!-- claude-md: commit=<hash de HEAD> date=<date du jour> -->`.
- Présente-moi un résumé des changements : features ajoutées, modifiées ou supprimées, règles ajoutées ou ajustées.
- Liste les incohérences entre ces règles et le code existant (couleurs en dur, fichiers de plus de 200 lignes, appels API hors RTK Query, dossiers transverses mal placés, controllers contenant de la logique…), sans les corriger.