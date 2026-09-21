# Audit Design System — themeNew

## Résumé exécutif

| Catégorie | Nombre |
|-----------|--------|
| Doublons / quasi-doublons de tokens | 5 groupes (8 tokens redondants) |
| Tokens orphelins / morts | 4 tokens (`darkAccent`, `darkAccent500`, `darkAccent900`, `surfaceAction`) |
| Tokens partiellement abandonnés | 2 (`inputPlaceholder`, `secondBackgroundDefault` — 0 usage direct en dehors du theme lui-même ou presque) |
| Valeurs en dur dans les composants | 20+ occurrences dans 7 fichiers |
| Couverture light/dark incomplète | 5 composants (`Drawer`, `Card`, `Divider`, `Popover`, `Slider`) |
| Incohérences de pattern entre fichiers | 5 composants (`Badge`, `Form`, `FormLabel`, `FormError`, `PinInput`) |
| Code mort / commentaires obsolètes | 16 occurrences dans 4 fichiers |
| Bug fonctionnel (`index.scss`) | 1 (variables CSS `h-spacing` non définies sous `max-width`) |

---

## 1. Doublons / quasi-doublons de tokens

### 1.1 `inputText` ≡ `textPrimary`

- **Sévérité :** high
- **Tokens :**
  - `inputText: { default: "grey.900", _dark: "grey.100" }` (colorTokens.ts:5)
  - `textPrimary: { default: "grey.900", _dark: "grey.100" }` (colorTokens.ts:13)
- **Valeurs identiques à 100%.**
- **Impact :** `input.ts` utilise `"inputText"` alors que `textPrimary` couvre exactement le même rôle sémantique. Les composants texte utilisent `textPrimary` (36 occurrences) ; les inputs utilisent `inputText` (2 occurrences en dehors du thème). Ce split artificiel n'apporte rien.
- **Suggestion :** Supprimer `inputText`, remplacer par `textPrimary` dans `input.ts` et `textarea.ts`.

```typescript
// Avant (colorTokens.ts)
inputText: { default: "grey.900", _dark: "grey.100" },
// Après : supprimer cette ligne

// input.ts + textarea.ts : remplacer
color: "inputText"
// par
color: "textPrimary"
```

---

### 1.2 `inputBg` ≡ `surfacePrimary`

- **Sévérité :** medium
- **Tokens :**
  - `inputBg: { default: "white", _dark: "grey.950" }` (colorTokens.ts:9)
  - `surfacePrimary: { default: "white", _dark: "grey.950" }` (colorTokens.ts:20)
- **Valeurs identiques à 100%.**
- **Impact :** `inputBg` est utilisé dans `input.ts`, `textarea.ts` et 9 occurrences applicatives. `surfacePrimary` couvre la page principale (9 occurrences). Le fait que les inputs aient exactement la même couleur que le fond de page est cohérent visuellement mais le dédoublement du token crée une indirection inutile.
- **Suggestion :** Garder `inputBg` pour conserver la lisibilité sémantique dans le contexte input — **mais documenter explicitement** que sa valeur doit rester synchronisée avec `surfacePrimary`. Alternative plus forte : fusionner et n'utiliser qu'`inputBg`.

---

### 1.3 `inputBorder` ≡ `borderSubtle`

- **Sévérité :** high
- **Tokens :**
  - `inputBorder: { default: "grey.100", _dark: "grey.700" }` (colorTokens.ts:6)
  - `borderSubtle: { default: "grey.100", _dark: "grey.700" }` (colorTokens.ts:30)
- **Valeurs identiques à 100%.**
- **Impact :** `input.ts` utilise `"inputBorder"` (3 occurrences hors thème). `borderSubtle` est utilisé pour d'autres bordures légères (3 occurrences). Deux tokens pour exactement le même rendu.
- **Suggestion :** Supprimer `inputBorder`, utiliser `borderSubtle` dans `input.ts`.

```typescript
// Avant (colorTokens.ts)
inputBorder: { default: "grey.100", _dark: "grey.700" },
// Après : supprimer

// input.ts : remplacer
borderColor: "inputBorder"
// par
borderColor: "borderSubtle"
```

---

### 1.4 `backgroundDefault` ≡ `surfaceModal` (dark) / `surfaceHover` (dark)

- **Sévérité :** medium
- **Tokens :**
  - `backgroundDefault: { default: "white", _dark: "grey.900" }` (colorTokens.ts:47)
  - `surfaceModal: { default: "white", _dark: "grey.900" }` (colorTokens.ts:22)
  - `surfaceHover: { default: "grey.50", _dark: "grey.900" }` (colorTokens.ts:24)
- `backgroundDefault` et `surfaceModal` sont **identiques** (light ET dark).
- `surfaceHover` a le même dark que `surfaceModal` / `backgroundDefault` alors que le light diffère — possible copier-coller involontaire.
- **Suggestion :** Supprimer `backgroundDefault` (2 usages seulement), migrer vers `surfaceModal` ou `surfacePrimary` selon le contexte. Pour `surfaceHover._dark`, vérifier si `grey.900` est intentionnel ou si `grey.800` était visé (même valeur que `surfaceCard._dark = grey.850`).

---

### 1.5 `inputDisabledBg` ≈ `surfaceSubtle` (dark identique, light proche)

- **Sévérité :** low
- **Tokens :**
  - `inputDisabledBg: { default: "grey.50", _dark: "grey.800" }` (colorTokens.ts:10)
  - `surfaceSubtle: { default: "grey.25", _dark: "grey.800" }` (colorTokens.ts:23)
- Dark identique. Light très proche (`grey.50` vs `grey.25`).
- Le commentaire de `surfaceSubtle` dit même « Fond subtil, inputs désactivés » — ce qui est exactement le rôle de `inputDisabledBg`.
- **Suggestion :** Aligner : soit unifier sur `surfaceSubtle` avec `grey.50` en light, soit documenter clairement pourquoi `grey.25` est différent de `grey.50`.

---

## 2. Incohérences de nommage

### 2.1 Convention de préfixe brisée dans les tokens `INPUT`

- **Sévérité :** medium
- `inputText`, `inputBorder`, `inputPlaceholder`, `inputActiveBorder`, `inputBg`, `inputDisabledBg` utilisent **camelCase** mais sans préfixe catégorie cohérent avec les autres sections.
- Les tokens TEXT utilisent `text` + PascalWord (`textPrimary`), SURFACES utilisent `surface` + PascalWord, BORDERS utilisent `border` + PascalWord.
- Les inputs mélangent : `inputBg` (bg minuscule), `inputActiveBorder` (Active majuscule), `inputDisabledBg` (Disabled majuscule + bg minuscule).
- **Suggestion :** Adopter une convention uniforme, ex. `inputBg` → `inputBackground`, `inputActiveBorder` → `inputBorderActive`, `inputDisabledBg` → `inputBackgroundDisabled`.

---

### 2.2 `tableBg` hors section `SURFACES`

- **Sévérité :** low
- **Fichier :** colorTokens.ts:27
- `tableBg` est défini dans la section `SURFACES` mais son nom suit la convention `input*` (composant + suffixe court) plutôt que `surface*`.
- **Suggestion :** Renommer en `surfaceTable` pour cohérence.

---

### 2.3 `darkAccent` / `darkAccent500` / `darkAccent900` — nommage non aligné

- **Sévérité :** low (tokens orphelins de toute façon — voir §3)
- Ces tokens n'appartiennent à aucune catégorie commentée dans `colorTokens.ts`. Ils mélangent le nom de thème (`dark`) avec un suffixe de palette raw (`500`, `900`), ce qui est contraire à la philosophie sémantique du reste des tokens.

---

### 2.4 `colors.ts` : `font.primary` est une chaîne `"textPrimary"`, pas une couleur

- **Sévérité :** medium
- **Fichier :** colors.ts:141
- `font.primary: "textPrimary"` est un nom de token sémantique, **pas une valeur de couleur**. Cette valeur est utilisée dans `typography.ts:baseTextStyle` et résout bien car Chakra interprète `"textPrimary"` comme un semantic token. Mais c'est trompeur : on s'attend à trouver une couleur dans `colors.ts`, pas une référence à un token.
- `baseHeadingStyle` et `baseDisplayStyle` dans `typography.ts` utilisent `colors.font.primary` qui vaut `"textPrimary"` — ça fonctionne mais crée un niveau d'indirection opaque.
- **Suggestion :** Soit retirer `font.primary` de `colors.ts` et référencer directement `"textPrimary"` dans `typography.ts`, soit le documenter explicitement comme « token reference ».

---

### 2.5 `stepper.ts` : utilisation de `"gray.300"` (Chakra par défaut) au lieu de `"grey.300"`

- **Sévérité :** high
- **Fichier :** themeNew/components/stepper.ts:34
- ```typescript
  borderColor: "gray.300",  // Chakra défaut américain, PAS la palette custom
  ```
- `"gray"` est la palette grise de Chakra par défaut (`#CBD5E0`). La palette du projet s'appelle `"grey"`. Ces deux couleurs sont **différentes**.
- **Suggestion :**
```typescript
// Avant
"&[data-status=incomplete]": {
    bg: "white",
    borderColor: "gray.300",  // ← FAUX : Chakra default gray
},
// Après
"&[data-status=incomplete]": {
    bg: "white",
    borderColor: "grey.300",  // ← palette custom
},
```

---

## 3. Tokens orphelins / morts

### 3.1 `darkAccent`, `darkAccent500`, `darkAccent900`

- **Sévérité :** high
- **Fichier :** colorTokens.ts:43-45
- **Occurrences hors `themeNew/` :** 0 (confirmé par grep)
- Ces trois tokens référencent `currentDarkTheme.primary`, `.primary500`, `.primary900` depuis `themeConfig.ts` mais ne sont **jamais utilisés** dans les pages, composants, ou autres fichiers de thème.
- **Suggestion :** Supprimer les trois entrées de `colorTokens.ts`.

---

### 3.2 `surfaceAction`

- **Sévérité :** medium
- **Fichier :** colorTokens.ts:26
- **Occurrences hors `themeNew/` :** 0 (confirmé par grep)
- Le token `surfaceAction: { default: "white", _dark: "grey.800" }` n'est référencé nulle part dans l'application.
- **Suggestion :** Supprimer, ou l'utiliser activement dans le thème `Button` variant `secondary` (qui hardcode actuellement `colors.grey[900]` en dark).

---

### 3.3 `inputPlaceholder`

- **Sévérité :** low
- **Fichier :** colorTokens.ts:7
- **Occurrences directes hors `themeNew/components/` :** 0 (le token est utilisé dans `input.ts` et `textarea.ts` mais jamais en JSX applicatif).
- C'est acceptable — les placeholders sont stylés via le thème Chakra — mais le token n'est pas utilisable directement dans les composants `_placeholder`. À surveiller si un composant custom doit styler un placeholder.
- **Non critique** — à conserver.

---

### 3.4 Tokens `skeletonStart` / `skeletonEnd` : usage incohérent

- **Sévérité :** medium
- **Fichier :** colorTokens.ts:36-37
- Ces tokens EXISTENT dans `colorTokens.ts` et sont correctement utilisés dans certains composants (`AgentsCard.tsx`, `RecentActivityCard.tsx`, `MetricCard.tsx`).
- **Mais** `ActivityChart.tsx` et `AlertsCard.tsx` réimplémentent les mêmes valeurs via `useColorModeValue("grey.100", "grey.800")` au lieu d'utiliser le token.
- **Suggestion :** Migrer `ActivityChart.tsx:44-45` et `AlertsCard.tsx:63-64` pour utiliser les tokens sémantiques :

```tsx
// Avant (ActivityChart.tsx:44-45)
const skeletonStart = useColorModeValue("grey.100", "grey.800");
const skeletonEnd = useColorModeValue("grey.200", "grey.700");
// Après
const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };
```

---

## 4. Couverture light/dark incomplète

### 4.1 `Drawer` — pas de dark mode sur `header`, `body`, `footer`

- **Sévérité :** high
- **Fichier :** themeNew/components/drawer.ts:12-43
- Les trois zones du drawer (`header.bg`, `body.bg`, `footer.bg`) utilisent uniquement `{ default: colors.whites.offwhite }` sans `_dark`. En dark mode, le drawer hérite du fond par défaut de Chakra (noir) plutôt que de `grey.850` / `grey.900`.
- **Suggestion :**
```typescript
header: {
    bg: {
        default: colors.whites.offwhite,
        _dark: colors.grey[900],  // ← ajouter
    },
},
body: {
    bg: {
        default: colors.whites.offwhite,
        _dark: colors.grey[900],  // ← ajouter
    },
},
footer: {
    bg: colors.whites.offwhite,  // ← actuel
    // Remplacer par :
    bg: { default: colors.whites.offwhite, _dark: colors.grey[850] },
    borderTop: "1px solid",
    borderColor: { default: colors.grey[50], _dark: colors.grey[700] },  // ajouter _dark
},
```

---

### 4.2 `Card` — pas de dark mode sur le `container`

- **Sévérité :** high
- **Fichier :** themeNew/components/card.ts:13-22
- `cardColors.base` fixe `backgroundColor: colors.whites.white` et `borderColor: colors.grey[50]` en dur sans variante dark.
- En dark mode, les cards utiliseront un fond blanc, ce qui est cassé visuellement.
- **Suggestion :**
```typescript
const cardColors = {
    base: {
        borderColor: { default: colors.grey[50], _dark: colors.grey[700] },
        backgroundColor: { default: colors.whites.white, _dark: colors.grey[850] },
    },
    gold: {
        borderColor: { default: colors.gold[100], _dark: colors.gold[800] },
        backgroundColor: { default: colors.gold[50], _dark: colors.gold[950] },
    },
};
```

---

### 4.3 `Divider` — pas de dark mode

- **Sévérité :** medium
- **Fichier :** themeNew/components/divider.ts:7
- `borderColor: colors.grey[50]` sans dark mode. En dark, le séparateur sera quasi-invisible (très clair sur fond sombre).
- **Suggestion :**
```typescript
const Divider = defineStyleConfig({
    baseStyle: {
        borderColor: "borderDivider",  // token sémantique déjà défini
        borderWidth: "1px",
        borderStyle: "solid",
    },
});
```

---

### 4.4 `Popover` — pas de dark mode sur les bordures

- **Sévérité :** medium
- **Fichier :** themeNew/components/popover.ts:13-20
- `borderColor: colors.grey[50]` (hardcodé, valeur claire) sans variante dark. Le popover n'aura pas de bordure visible en dark mode.
- **Suggestion :**
```typescript
content: {
    borderRadius: "8px",
    borderColor: { default: colors.grey[50], _dark: colors.grey[700] },
},
header: { borderColor: { default: colors.grey[50], _dark: colors.grey[700] } },
footer: { borderColor: { default: colors.grey[50], _dark: colors.grey[700] } },
```

---

### 4.5 `Slider` — pas de dark mode sur le thumb ni le filledTrack

- **Sévérité :** medium
- **Fichier :** themeNew/components/slider.ts:9-17
- `thumb.bg: colors.whites.white` et `filledTrack.bg: colors.gold[100]` sans dark mode. En dark, le thumb sera blanc (acceptable) mais la piste remplie sera `gold.100` (trop claire).
- **Suggestion :**
```typescript
filledTrack: {
    bg: { default: colors.gold[100], _dark: colors.gold[700] },
},
```

---

### 4.6 Incohérence `surfaceHover._dark` (signal d'alerte potentiel)

- **Sévérité :** low
- `surfaceHover: { default: "grey.50", _dark: "grey.900" }` — le dark est identique au fond de page (`surfacePrimary._dark = grey.950` est différent, mais `backgroundDefault._dark = grey.900` est le même). Un hover sur un fond `grey.900` qui devient `grey.900` n'est pas visible. Vérifier si la valeur cible était plutôt `grey.800`.

---

## 5. Valeurs en dur dans les thèmes de composants

### 5.1 `modal.ts` — hex hardcodé dans le closeButton

- **Sévérité :** high
- **Fichier :** themeNew/components/modal.ts:123
- ```typescript
  border: "1px solid #E7E7E7",
  ```
- `#E7E7E7` correspond à `grey.100`. C'est une valeur en dur sans dark mode — le close button du modal aura toujours une bordure `grey.100` même en mode sombre.
- **Suggestion :**
```typescript
// Remplacer
border: "1px solid #E7E7E7",
// par
borderWidth: "1px",
borderStyle: "solid",
borderColor: "borderSubtle",  // token sémantique avec dark automatique
```

---

### 5.2 `button.ts` — valeurs rgba/hex en dur dans les variants `superPrimary` et `superSecondary`

- **Sévérité :** medium (ces variants sont des dégradés intentionnels, mais les couleurs disabled et de bordure devraient référencer les tokens)
- **Fichier :** themeNew/components/button.ts — lignes 54, 56, 66, 77, 88-89, 101, 114-115, 131, 141-142, 155, 175, 193, 195
- Les gradients complexes (`radial-gradient(...)`) sont acceptables en valeur brute. En revanche, les valeurs de bordures et états disabled sont hardcodées :
  - Ligne 56 : `"1px solid rgba(209, 209, 209, 0.95)"` → équivalent `grey.200` avec opacité
  - Ligne 89 : `"1px solid rgba(100, 100, 100, 0.95)"` → équivalent `grey.600` avec opacité
  - Ligne 175 : `"1px solid rgba(120, 241, 201, 0.67)"` → vert custom
  - Ligne 193 : `"1px solid rgba(214, 214, 214, 0.67)"` → `grey.200` avec opacité
- **Suggestion :** Extraire les valeurs de bordure dans des constantes nommées en tête du fichier pour lisibilité et maintenance.

---

### 5.3 `accordion.ts` — `grey.50` sans token sémantique

- **Sévérité :** low
- **Fichier :** themeNew/components/accordion.ts:12
- ```typescript
  bg: "grey.50",
  ```
- Devrait référencer `surfaceHover` (qui est `grey.50` en light, `grey.900` en dark). En l'état, le hover de l'accordéon ne s'adapte pas au dark mode.
- **Suggestion :**
```typescript
_hover: {
    bg: "surfaceHover",
},
```

---

### 5.4 `menu.ts` — `grey.*` bruts au lieu de tokens sémantiques

- **Sévérité :** medium
- **Fichier :** themeNew/components/menu.ts:16, 24, 28, 31, 36, 39
- ```typescript
  borderColor: "grey.800",           // → borderDefault._dark
  bg: { default: "white", _dark: "grey.900" }  // → surfaceModal ou surfaceCard
  _hover: { bg: "grey.50" }         // → surfaceHover
  _dark: { _hover: { bg: "grey.700" } }  // → surfaceHover._dark (mais grey.900, pas .700)
  ```
- **Suggestion :** Remplacer par les tokens sémantiques correspondants pour que l'évolution du thème soit propagée automatiquement.

---

### 5.5 `progress.ts` — `green.100` / `green.500` sans token

- **Sévérité :** low
- **Fichier :** themeNew/components/progress.ts:13, 16
- Pas de dark mode. En dark, la barre de progression verte `green.500` sur fond `green.100` peut manquer de contraste.
- **Suggestion :** Créer des tokens `progressTrack` / `progressFill` ou utiliser des tokens existants avec dark mode.

---

### 5.6 `table.ts` — `grey.*` directs dans les th light/dark

- **Sévérité :** low
- **Fichier :** themeNew/components/table.ts:41-46
- ```typescript
  _dark: { borderColor: "grey.800", color: "grey.300" },
  _light: { borderColor: "grey.100", color: "grey.900" },
  ```
- Pourrait utiliser `borderDefault` et `textLabel` / `textPrimary` pour mieux s'intégrer au système.

---

### 5.7 `scrollbar.ts` — valeurs brutes non sémantiques

- **Sévérité :** low
- **Fichier :** themeNew/scrollbar.ts:5, 18, 23
- ```typescript
  backgroundColor: "grey.300",   // thinScrollbar? → pas de dark
  backgroundColor: "white",      // thinScrollbar track
  backgroundColor: "green.500",  // thinScrollbar thumb
  ```
- `scrollbar.ts` ne peut pas utiliser de semantic tokens Chakra (ce sont des props CSS inline via sx). Mais `thinScrollbar` manque complètement d'une variante dark. `grayScrollbar` utilise `grey.300` qui sera invisible sur fond sombre.
- **Suggestion :** Documenter que ces styles doivent être enveloppés dans `useColorModeValue` au point d'utilisation, ou fournir des variantes dark/light distinctes.

---

### 5.8 `drawer.ts` — shorthand `borderTop` avec `borderColor` séparé

- **Sévérité :** low
- **Fichier :** themeNew/components/drawer.ts:42-43
- ```typescript
  borderTop: "1px solid",
  borderColor: colors.grey[50],
  ```
- Usage du shorthand `borderTop` avec `borderColor` séparé — pattern explicitement déconseillé dans la mémoire projet (feedback `Chakra Border Shorthand`). Remplacer par `borderTopWidth` + `borderTopStyle` + `borderTopColor`.

---

## 6. Incohérences de pattern entre fichiers de thème

### 6.1 `Badge` — n'utilise pas `defineStyleConfig`

- **Sévérité :** medium
- **Fichier :** themeNew/components/badge.ts
- `Badge` exporte un objet littéral brut, sans `defineStyleConfig`. Tous les autres composants single-part (`Divider`, `Skeleton`, `Textarea`) utilisent `defineStyleConfig`.
- De plus, `getColorScheme` accepte `BadgeProps["colorScheme"]` mais l'objet interne `badgeColors` définit des clés supplémentaires (`mediumGold`, `orange`, `semiTransparent`) **absentes du type `BadgeProps`**. Ces variantes sont silencieusement inaccessibles via les props typées.
- **Suggestion :**
```typescript
import { defineStyleConfig } from "@chakra-ui/react";
// Ajouter "mediumGold" | "orange" | "semiTransparent" au type BadgeProps
// ET/OU supprimer les variantes inutilisées
const Badge = defineStyleConfig({ sizes: {...}, variants: {...}, defaultProps: {...} });
```

---

### 6.2 `FormLabel` — n'utilise pas `defineStyleConfig`

- **Sévérité :** medium
- **Fichier :** themeNew/components/form-label.ts
- Exporte un objet littéral brut. `Form` et `FormError` font de même.
- `FormLabel` réexporte `Text.variants` comme variants du label — pattern inhabituel qui peut produire des conflits TypeScript.
- **Suggestion :**
```typescript
import { defineStyleConfig } from "@chakra-ui/react";
const FormLabel = defineStyleConfig({
    baseStyle: { ...textStyles["body-sm"], marginEnd: 0, color: "textLabel" },
    variants: Text.variants,
});
```

---

### 6.3 `Form` et `FormError` — objets littéraux sans helpers

- **Sévérité :** low
- **Fichiers :** form.ts, form-error-message.ts
- `Form` est un composant multi-parts (`formAnatomy` avec `container`, `requiredIndicator`, `helperText`) mais n'utilise pas `createMultiStyleConfigHelpers`. `FormError` est dans le même cas (`formErrorAnatomy` a `text` + `icon`).
- **Suggestion :** Migrer vers `createMultiStyleConfigHelpers` pour la cohérence et la sécurité de typage.

---

### 6.4 `PinInput` — objet littéral brut, pas de dark mode, pas de `defineStyleConfig`

- **Sévérité :** medium
- **Fichier :** themeNew/components/pin-input.ts
- Exporte un objet brut sans helper Chakra. Le variant `default` hardcode `background: "white"` et `border: \`1px solid ${colors.grey[50]}\`` sans aucune adaptation dark mode.
- **Suggestion :**
```typescript
import { defineStyleConfig } from "@chakra-ui/react";
const PinInput = defineStyleConfig({
    variants: {
        default: {
            bg: "inputBg",
            borderColor: "borderSubtle",
            borderRadius: "4px",
            _hover: { borderColor: "textPrimary" },
            _focus: { borderColor: "inputActiveBorder" },
            _invalid: { borderColor: "red.600" },
            _disabled: { bg: "inputDisabledBg", cursor: "not-allowed" },
        },
    },
    defaultProps: { size: "md", variant: "default" },
});
```

---

### 6.5 `Tabs` — n'utilise pas `definePartsStyle`

- **Sévérité :** low
- **Fichier :** themeNew/components/tabs.ts
- `Tabs` importe `createMultiStyleConfigHelpers` (qui fournit `definePartsStyle`) mais utilise des objets littéraux bruts dans ses variants. Cohérent avec Chakra v2 qui accepte les deux, mais inconsistant par rapport à `Menu`, `Input`, `Checkbox`, etc. qui utilisent systématiquement `definePartsStyle`.
- De plus, la propriété `root` du variant `simple` reçoit un `borderColor: "grey.100"` sans dark mode.

---

### 6.6 `Stepper` — import `extendTheme` non utilisé

- **Sévérité :** low
- **Fichier :** themeNew/components/stepper.ts:1
- ```typescript
  import { extendTheme } from "@chakra-ui/react";  // ← jamais utilisé
  ```
- Aussi : `defineStyle` est importé (ligne 2) mais n'est jamais utilisé dans le fichier.
- **Suggestion :** Supprimer ces deux imports inutilisés.

---

## 7. Code mort / commentaires obsolètes

### 7.1 `table.ts` — 6 `//borderBottom` commentés

- **Sévérité :** medium
- **Fichier :** themeNew/components/table.ts
- | Ligne | Commentaire |
  |-------|-------------|
  | 12 | `//borderBottom: "1px solid",` (tr) |
  | 21 | `//borderBottom: "1px solid",` (th) |
  | 29 | `//borderBottom: "1px solid",` (td) |
  | 48 | `//borderBottom: "2px solid",` (thead th) |
  | 53 | `//borderBottom: "1px solid",` (tbody tr) |
  | 66 | `//borderBottom: "1px solid",` (tbody td) |
- Ces lignes représentent une décision de design (supprimer les bordures horizontales des tables) mais restent commentées depuis longtemps. Si cette décision est définitive, supprimer.

---

### 7.2 `pin-input.ts` — 3 lignes commentées

- **Sévérité :** low
- **Fichier :** themeNew/components/pin-input.ts
- | Ligne | Commentaire |
  |-------|-------------|
  | 6 | `// border: \`1px solid ${colors.grey[500]}\`,` |
  | 7 | `// background: colors.grey[100],` |
  | 43 | `// border: \`1px solid ${colors.grey[700]}\`,` |
- Vestiges d'un style antérieur. Supprimer.

---

### 7.3 `index.scss` — blocs de heading sizes responsifs commentés (22 lignes)

- **Sévérité :** medium
- **Fichier :** themeNew/index.scss:96-121
- Deux blocs `@media` entièrement commentés (desktop et mobile) qui définissaient des tailles de heading différentes selon le breakpoint. La version actuelle utilise une valeur fixe non responsive.
- Si la responsivité des headings n'est pas à l'ordre du jour, supprimer. Si elle est prévue, ouvrir un ticket et ne pas laisser ce code mort.

---

### 7.4 `index.ts` — imports commentés multiples

- **Sévérité :** low
- **Fichier :** themeNew/index.ts
- | Ligne | Import commenté |
  |-------|----------------|
  | 13 | `// import Progress from 'theme/components/progress';` (ancienne path) |
  | 24 | `// import Badge from './components/badge';` |
  | 25 | `// import Button from './components/button';` |
  | 26 | `// import Card from './components/card';` |
  | 33 | `// import Link from './components/link';` |
  | 34 | `// import NumberInput from './components/number-input';` |
  | 38 | `// import Select from './components/select';` |
  | 39 | `// import Slider from './components/slider';` |
  | 40 | `// import Stepper from './components/stepper';` (doublon : importé activement ligne 42) |
- Les imports commentés 24-26 correspondent à des composants activement importés juste en dessous — vestiges d'une refacto. L'import ligne 40 est particulièrement trompeur car `Stepper` est importé à la ligne 42 avec un chemin différent.

---

## 8. Bug fonctionnel — `index.scss` : variables CSS `h-spacing` manquantes sous mobile

- **Sévérité :** high
- **Fichier :** themeNew/index.scss:50-59
- Le bloc `@media (max-width: $breakpoint-xl)` censé définir les variables `--genrag-h-spacing-*` définit en réalité les variables `--genrag-p-spacing-*` (copier-coller du bloc padding). Résultat : sous mobile (`< 1280px`), les variables CSS `h-spacing` ne sont **jamais définies**, et tout composant utilisant `h-xs`, `h-sm`, etc. (tokens de l'espace horizontal) n'aura pas de valeur.

```scss
/* Avant (FAUX) */
@media (max-width: $breakpoint-xl) {
    :root {
        --genrag-p-spacing-2xs: 4px;  /* ← devrait être --genrag-h-spacing-* */
        ...
    }
}

/* Après (CORRECT) */
@media (max-width: $breakpoint-xl) {
    :root {
        --genrag-h-spacing-2xs: 4px;
        --genrag-h-spacing-xs: 8px;
        --genrag-h-spacing-sm: 12px;
        --genrag-h-spacing-md: 16px;
        --genrag-h-spacing-lg: 24px;
        --genrag-h-spacing-xl: 32px;
    }
}
```

---

## 9. Note transversale — `useColorModeValue` massif bypasse les tokens sémantiques

- **Sévérité :** medium (dette technique systémique)
- **414 appels** à `useColorModeValue` avec des valeurs `grey.*` brutes ont été identifiés dans les composants applicatifs (hors thème). Cela contourne entièrement le système de tokens sémantiques et rend les changements de thème (dark/light, accent color) beaucoup plus coûteux.
- Exemples typiques qui devraient utiliser les tokens existants :
  - `useColorModeValue("grey.900", "grey.100")` → `"textPrimary"`
  - `useColorModeValue("grey.500", "grey.400")` → `"textLabel"`
  - `useColorModeValue("grey.100", "grey.800")` → `"borderDefault"`
  - `useColorModeValue("white", "grey.850")` → `"surfaceCard"`
- **Suggestion :** Adopter une règle ESLint custom qui avertit lorsque `useColorModeValue` reçoit des valeurs `grey.*` correspondant à un token existant. Migrer progressivement par composant.
