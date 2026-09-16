# Plan de refactor — `plateform_front`

Audit exhaustif (lecture ligne par ligne) de tout `src/` **sauf `components/charts/`** (librairie tierce), réalisé par rapport aux conventions de `../CLAUDE.md` et `CLAUDE.md` (racine du front). Aucun fichier de code n'a été modifié — ce document liste uniquement ce qu'il faudrait changer.

**Méthode :** 6 sous-audits couvrant respectivement `components/Agents`, `components/Deployment`+`Document`+`Assistant`, `components/ui`, `components/Auth`+`Billing`+`Dashboard`+`Legal`+`Onboarding`, `pages/`+`app/`, et `hooks/`+`services/`+`store/`+`types/`+`utils/`+`lib/`. ~370 fichiers lus.

**Organisation :** lots indépendants, ordonnés du moins risqué au plus risqué, ~10-15 fichiers max chacun. Un même fichier peut apparaître dans plusieurs lots (concernant des problèmes différents) — c'est voulu, chaque lot reste une revue atomique.

---

## ⚠️ Bug critique trouvé en passant (hors périmètre "propreté", signalé quand même)

**`pages/Agents/Workflow/NodeModal.tsx:36`** — le hook appelé (`useGetModelsRerankQuery` vs `useGetModelsGenerationQuery`) est choisi conditionnellement selon le type du node parent. C'est une violation des Rules of Hooks : si le node sélectionné change de type entre deux rendus du composant monté, l'ordre des hooks change. À corriger indépendamment de ce plan de nettoyage, avant tout refactor de ce fichier.

---

## 🧭 Décisions produit nécessaires (pas de la propreté de code — à trancher avant de toucher ces fichiers)

Plusieurs écrans ont l'apparence de fonctionnalités complètes mais ne font rien côté serveur. Ce ne sont pas des bugs de "propreté" à corriger mécaniquement — il faut décider si la feature doit être branchée ou retirée avant de refactorer le code autour :

- **`components/Billing/BuyCreditsSection.tsx`** — le bouton "Acheter" simule un paiement (`MOCK_PAYMENT`, `setTimeout`), aucun appel Stripe/RTK Query réel.
- **`components/Billing/ChangePlanSection.tsx` / `PlanCard.tsx`** — deux listes de tiers différentes (`TIERS` vs `TIER_DATA`) non partagées ; changer de plan ne fait rien.
- **`services/billing/billing.ts`** — `addPaymentMethod`/`removePaymentMethod`/`purchaseCredits` sont des stubs qui `throw new Error("Non implémenté")`.
- **`components/Deployment/AccessControl/VisibilitySection.tsx`, `Settings/HostingRegion.tsx`, `AccessControl/ApiKeysSection.tsx`, `Settings/DataPrivacy.tsx`** — état 100% local, aucune mutation RTK Query : changer la visibilité, la région, la clé API ou les réglages de confidentialité ne persiste jamais rien.
- **`pages/Legal/ContactForm.tsx`** — le bouton "Envoyer" n'a aucun handler.
- **`pages/Profile/sections/PersonalInfoSection.tsx`** — `lastName`, `phone`, `role` sont dans le formulaire et dans le payload envoyé, mais aucun `<Input>` ne les affiche : l'utilisateur ne peut jamais les modifier alors qu'ils sont sauvegardés (potentiellement en `undefined`/valeur par défaut à chaque save).
- **`pages/Auth/Layout/AuthLayout.tsx` / `LoginForm.tsx`** — branche `LOGIN_PASSKEY` jamais atteignable (texte non traduit en plus).
- **`app/Routes/AuthRoutes.tsx:17`** — route `/test` de dev, référence une prop `onDone` inexistante.

---

# Partie A — Code mort (risque très faible)

## Lot A1 — Suppression de fichiers/exports 100% inutilisés
**Fichiers :**
- `components/ui/BadgeWithIcon.tsx` — aucun import ailleurs
- `components/ui/CircledFrame.tsx` — aucun import ailleurs
- `components/ui/StepLevel.tsx` — aucun import ailleurs
- `components/ui/CreditConsumptionBanner.tsx` — aucun import ailleurs, doublon inerte de `OnboardingStepBanner`
- `components/Deployment/Sparkline.tsx` — aucun import ailleurs
- `pages/Profile/sections/DeleteAccountDialog.tsx` — remplacé par `components/ui/DangerZone`, plus jamais monté
- `pages/Dev/ThinkingBubbleMock.tsx` — absent de tout `Routes/*.tsx`
- `pages/Agents/Deployment/data.ts` — `VERSIONS`/`HEALTH_STATS` (~170 lignes) jamais importés ; garder seulement `ENV_BADGE`
- `types/organisation.ts` — `Organisation`/`OrganisationPreview` jamais importés
- `types/agent/agent.ts` — `AgentApiResponse` jamais utilisé (+ retirer l'import mort dans `services/agent/agent.ts`)
- `types/workflow/workflow.ts` — `WorkflowCanvas`, `WorkflowNodeTypes`, `WorkflowNodeType` jamais importés
- `components/Agents/AgentCard.tsx` — `STATUS_CONFIG` jamais utilisé
- `components/Agents/Analytics/types.ts` — `CostType`, `CostModel` jamais référencés

**Changement :** supprimer ces fichiers/exports (revérifier par grep juste avant suppression, un seul faux positif suffit à casser le build).
**Risque : faible** — tout a été vérifié par grep global dans les 6 audits, mais un dernier grep de contrôle avant suppression reste recommandé.

## Lot A2 — Nettoyage code commenté / debug oublié
**Fichiers :**
- `pages/Agents/Deployment/AccessControl.tsx` — imports/JSX commentés
- `pages/Agents/Deployment/Settings.tsx` — import commenté
- `pages/Agents/Workflow/CustomControls.tsx` — blocs d'outils commentés (lignes 26-57, 113-119)
- `app/WorkspaceGuard.tsx` — bloc de redirection onboarding commenté (lignes 26-28, à vérifier qu'il n'est pas désactivé volontairement avant suppression)
- `components/Deployment/Settings/QueryLogsTable.tsx:57` — `console.log(data)` oublié
- `components/Deployment/RegionCard.tsx:16` — `useColorModeValue("green.500","green.500")` : hook appelé pour renvoyer la même valeur des deux côtés, à simplifier en valeur simple (ou en token, cf. Lot B6)

**Changement :** retirer le code mort/commenté et le log de debug.
**Risque : faible.**

---

# Partie B — Couleurs en dur → tokens du thème (risque faible : substitution 1:1, pas de changement de logique)

Rappel des tokens dispo dans `themeNew/foundations/colorTokens.ts` : `textPrimary/Secondary/Label/Muted/Subtle/Description/Body/Faint/Strong/OnBubble/Error`, `input*`, `surfaceAppShell/Primary/Card/Modal/Subtle/Hover/Thumbnail/Action`, `tableBg`, `bubble*`, `border*`, `tooltipBg`, `skeletonStart/End`, `accentCardBg/IconBg`, `iconAccent`, `iconStepInactive`, `errorIconAccent`, `sidebarBorder`, `listItem*`, `bgAgentProduction`, `backgroundDefault`, `secondBackgroundDefault`.

**Pattern transverse à corriger partout :** `useColorModeValue("grey.700","green.600")` (ou variantes) réimplémente à la main le token **`tooltipBg`** — trouvé dans `components/ui/ActionMenu.tsx:87`, `app/Navigation/SidebarItem.tsx:38`, `pages/Agents/Workflow/CustomControls.tsx:73`, `pages/Agents/Workflow/MenuNodeModal.tsx:57`. **Bug de typo à corriger au passage :** `color="textmuted"` (minuscule, invalide) dans `pages/Onboarding/Stepper/OnboardingStepper.tsx:60` et `components/Deployment/DeployModal.tsx:86` → `textMuted`.

## Lot B1 — `components/ui/*` (hors chat/GlassNav)
**Fichiers (13) :** `ActionMenu.tsx`, `CustomTooltip.tsx`, `AppLoader.tsx`, `RadioButton.tsx`, `Modal.tsx`, `MenuDropDown.tsx`, `WorkspaceHeader.tsx`, `KdbStyles.tsx`, `ImpactBar.tsx`, `DangerZone.tsx`, `EntityCard.tsx`, `Banner.tsx`, `UploadDropzone.tsx`.
**Changement :** remplacer les paires `useColorModeValue` par les tokens équivalents (ex. `popoverBg`→`surfaceModal`, `dividerColor`→`borderDefault`, `itemHoverBg`→`surfaceHover`, `dangerColor`→`textError`). `DangerZone.tsx` : extraire les 8 `rgba(239,68,68,...)` répétés en constante locale à défaut de token dédié. `Banner.tsx`/`UploadDropzone.tsx` : garder les palettes multi-variant en dur si assumé (pas d'équivalent sémantique), mais nettoyer les incohérences ponctuelles.
**Risque : faible.**

## Lot B2 — `components/ui/chat/*` + `AppLoader`/`themeConfig`
**Fichiers (5) :** `chat/ChatHeader.tsx`, `chat/ChatInput.tsx`, `chat/ChatInterface.tsx`, `chat/ChatMessageItem.tsx`, `chat/markdownStyles.ts`.
**Changement :** `currentDarkTheme.primary` (résout en dur à `green.400`, ne varie pas avec le colorMode) → remplacer par le token **`iconAccent`** partout où l'intention est "couleur accent adaptative". `ChatMessageItem.tsx:13` : `labelColor = isDark ? "grey.500":"grey.400"` est la définition exacte de `textLabel` → utiliser le token directement.
**Risque : faible.** Ce pattern `currentDarkTheme.primary` est utilisé dans ~20 fichiers au total dans le repo (systémique) — ce lot ne couvre que `chat/`, les autres occurrences sont listées dans les lots B5/B8/B9 ci-dessous.

## Lot B3 — Auth + Billing (`components/`)
**Fichiers (7) :** `Auth/AuthHeader.tsx`, `Auth/GoogleLoginButton.tsx`, `Auth/WelcomeScreen.tsx`, `Auth/welcome/WelcomeStepper.tsx`, `Billing/BuyCreditsSection.tsx`, `Billing/ChangePlanSection.tsx`, `Billing/PlanCard.tsx`.
**Changement :** remplacer les `useColorModeValue`/ternaires `isDark ? ... : ...` bruts par les tokens (`textStrong`, `borderDivider`, `textLabel`, `surfaceCard`). `WelcomeStepper.tsx:18` : hex `#0a0a0a` en dur → token. `PlanCard.tsx` : `currentDarkTheme.primary`, `bgGradient` en dur, `rgba(52,211,169,...)` → `iconAccent` + créer si besoin une constante de gradient partagée. Ne pas toucher à la logique métier (cf. Décisions produit ci-dessus).
**Risque : faible.**

## Lot B4 — Dashboard + Legal (`components/`)
**Fichiers (10) :** `Dashboard/ActivityChart/ActivityLegend.tsx`, `Dashboard/AgentsCard.tsx`, `Dashboard/MetricCard.tsx`, `Legal/ContactCard.tsx`, `Legal/ContactForm.tsx`, `Legal/DocBulletList.tsx`, `Legal/DocInfoBox.tsx`, `Legal/DocPageHeader.tsx`, `Legal/DocSectionRenderer.tsx`, `Legal/DocSection.tsx`, `Legal/DocTable.tsx`.
**Changement :** `AgentsCard.tsx:13,46` hex `#6B7280` → `dotInactive`. `MetricCard.tsx` : pas de token "tendance" (vert/orange/rouge) existant → soit ajouter 3 tokens dédiés dans `colorTokens.ts` (à faire dans ce lot, additif donc sans risque), soit factoriser en constante locale. Tout le dossier `Legal/*` : `green.50/900`→`accentIconBg`, `green.200/800`→`borderAccentCard`, `green.800/200`→`bubbleAccentText` (déjà exactement prévus pour ce cas).
**Risque : faible.**

## Lot B5 — Onboarding (`components/`)
**Fichiers (6) :** `Onboarding/StepFooter.tsx`, `Onboarding/CompareIntelligence/ResponseDetailPanel.tsx`, `Onboarding/ImproveAssistant/DocumentFileList.tsx`, `Onboarding/ImproveAssistant/UploadProgressStepper.tsx`, `Onboarding/Stepper/OnboardingSidebar.tsx`, `Onboarding/Stepper/OnboardingStepper.tsx`.
**Changement :** tokens standards (`textBody`, `iconAccent`, `errorIconAccent`). **`StepFooter.tsx:37` : `colorScheme="pink"` — seule occurrence de rose dans tout le repo, reste de prototypage, à remplacer par le colorScheme vert standard.** `UploadProgressStepper.tsx` : hex `#E7E7E7` en dur sans variante dark → `borderDefault`. Inclut le fix du bug `textmuted`→`textMuted` (voir intro Partie B).
**Risque : faible.**

## Lot B6 — Agents/Workflow — gros fichiers `*OverviewTab.tsx` + `RewriterNodeContent`
**Fichiers (5) :** `Workflow/NodeModalContent/Query/QueryNodeOverviewTab.tsx`, `ReRanker/ReRankerNodeOverviewTab.tsx`, `Response/ResponseNodeOverviewTab.tsx`, `Document/DocumentNodeOverviewTab.tsx`, `Rewriter/RewriterNodeContent.tsx`.
**Changement :** remplacer les dizaines de `green.100-700`/`grey.300-800`/`rgba(34,197,94,...)` par les tokens correspondants. **À faire avant le Lot E7 (extraction du moteur d'animation)** pour ne pas retoucher deux fois les mêmes lignes — ou après, au choix, mais pas en parallèle sur les mêmes fichiers.
**Risque : faible** (mais fichiers volumineux, donc diff long à relire).

## Lot B7 — Agents/Workflow — ModelSelector + settings
**Fichiers (6) :** `Workflow/NodeModalContent/NodeSettingsEditor.tsx`, `ModelSelector/ModelDetailHelpers.tsx`, `ModelSelector/ModelDetailPanel.tsx`, `ModelSelector/ModelListItem.tsx`, `ModelSelector/ModelListPanel.tsx`, `SettingPlaceholderContent.tsx`.
**Changement :** tokens standards. `ModelListPanel.tsx:88` : `color="grey"` (mot-clé CSS brut passé à une icône) → résoudre via `useToken` comme déjà fait dans `ModelDetailHelpers.tsx`. `SettingPlaceholderContent.tsx:159` : `borderColor="textSecondary"` détourne un token texte comme couleur de bordure → remplacer par un vrai token de bordure. `SettingPlaceholderContent.tsx:163` : `_hover="textSecondary"` est invalide (attend un objet de style) — probable faute de frappe à corriger (`_hover={{ borderColor: "..." }}`).
**Risque : faible.**

## Lot B8 — Agents — modales + carte d'agent
**Fichiers (5) :** `AgentFormPanel.tsx`, `CreateAgentModal.tsx`, `DeleteAgentModal.tsx`, `TemplateCard.tsx`, `pages/Agents/index.tsx`.
**Changement :** `DeleteAgentModal.tsx` a 7 couleurs "danger" en dur (`red.100`, `rgba(239,68,68,...)`) — il n'existe pas de token danger dédié : **ajouter 2-3 tokens `danger*` dans `colorTokens.ts`** (additif, sans risque) puis les utiliser ici. `TemplateCard.tsx` mélange tokens et Chakra brut dans le même fichier alors que `borderAccentCardActive` existe déjà pour la bordure de carte sélectionnée. `pages/Agents/index.tsx` : `tint: "#1c2527"/"#281e1f"` en dur.
**Risque : faible.**

## Lot B9 — Deployment (cœur du module)
**Fichiers (15) :** `AccessControl/ApiKeysSection.tsx`, `AccessControl/MembersSection.tsx`, `AccessControl/VisibilitySection.tsx`, `DashboardTab/CreditSummaryCard.tsx`, `DashboardTab/HeaderCard/HeaderCardMain.tsx`, `DashboardTab/QuickLinksCard.tsx`, `DeployModal.tsx`, `ExportCard.tsx`, `LiveDot.tsx`, `PrivacyRow.tsx`, `RegionCard.tsx`, `Settings/DataPrivacy.tsx`, `Settings/HostingRegion.tsx`, `Settings/QueryLogsTable.tsx`, `Settings/UserRights.tsx`.
**Changement :** tokens standards (`surfaceCard`, `borderDefault`, `textStrong`, `textLabel`, `iconAccent`). `DataPrivacy.tsx` et `QueryLogsTable.tsx` utilisent `Button`/`IconButton` Chakra natif au lieu de `components/ui/Button` — corriger l'import en même temps que la couleur (cohérence du dossier). Inclut le fix `textmuted`→`textMuted` de `DeployModal.tsx:86`.
**Risque : faible.**

## Lot B10 — Deployment/VersionsHistory
**Fichiers (5) :** `PipelineJsonPanel.tsx`, `VersionDetailPanel.tsx`, `VersionHeaderActions.tsx`, `VersionsSidebar.tsx`, `VersionListItem.tsx`.
**Changement :** tokens standards. `PipelineJsonPanel.tsx` mélange `var(--chakra-colors-green-*)`, hex Dracula (`#FF79C6`, `#FFB86C`) — la coloration syntaxique JSON custom peut garder une palette dédiée assumée, mais les couleurs de fond/bordure du panneau doivent suivre les tokens.
**Risque : faible.**

## Lot B11 — Document + Assistant
**Fichiers (9) :** `Document/Drawer/DocumentInfoGrid.tsx`, `Document/Drawer/DocumentPreview.tsx`, `Document/Drawer/KnowledgeBaseStatus.tsx`, `Document/Drawer/PreviewDrawer.tsx`, `Document/Header/StorageOverviewPanel.tsx`, `Document/Modal/UploadProgressList.tsx`, `Assistant/AssistantChatLayout.tsx`, `Assistant/AssistantInput.tsx`, `Assistant/Drawer/QuerySourcesTab.tsx`.
**Changement :** tokens standards (`textFaint`, `iconAccent`, `errorIconAccent`). `AssistantInput.tsx:147` : `borderColor="green.400"` sur focus → token **`inputActiveBorder`** (= green.400) déjà prévu pour ce cas exact.
**Risque : faible.**

## Lot B12 — Assistant/ConversationSidebar (bug inclus)
**Fichiers (1) :** `Assistant/ConversationSidebar.tsx`.
**Changement :** ligne 61/66 `borderRight="1px solid var(--chakra-colors-sidebarBorder)"` → `borderColor="sidebarBorder"` (utiliser la prop Chakra, pas la CSS var). **Ligne 130 : `bg={isActive ? currentDarkTheme.hex.primary : "dotInactive"}` — bug potentiel, le hex du thème dark est utilisé même en light mode** → remplacer par `iconAccent`.
**Risque : faible** (fichier isolé mais contient un vrai bug visuel probable, à tester en light mode après fix).

## Lot B13 — Sidebars (`app/Navigation/**`) + layout agent
**Fichiers (7) :** `MainSidebar/WorkspaceDropdown.tsx`, `SidebarFooter.tsx`, `LegalSidebar/LegalSidebar.tsx`, `MainSidebar/Sidebar.tsx`, `SidebarItem.tsx`, `PrivateAgentAppLayout.tsx`.
**Changement :** tokens standards + fix de la duplication `tooltipBg` (voir intro Partie B). `PrivateAgentAppLayout.tsx:30,39` : gradients `rgba(18,185,140,...)`/`rgba(74,159,216,...)` en dur, à évaluer si assumés (glow décoratif) ou à tokeniser.
**Risque : faible.**

## Lot B14 — Page Workflow builder
**Fichiers (4) :** `pages/Agents/Workflow/CustomControls.tsx`, `pages/Agents/Workflow/MenuNodeModal.tsx`, `pages/Agents/Workflow/index.tsx`.
**Changement :** `MenuNodeModal.tsx` est le pire fichier du lot (18 couleurs brutes). `index.tsx` : la MiniMap a `"#8b5cf6"` répété 3x + rgba/hex en dur pour ses couleurs de node — à tokeniser ou au moins factoriser en constantes locales nommées.
**Risque : faible** (mais fichiers volumineux, prévoir une relecture attentive).

## Lot B15 — Pages diverses
**Fichiers (5) :** `pages/Agents/AccessControl/index.tsx`, `pages/Agents/Documents/index.tsx`, `pages/NotFound/index.tsx`, `pages/Assistant/AssistantHome.tsx`, `pages/Assistant/AssistantList.tsx`.
**Changement :** remplacer les ternaires manuels `isDark/colorMode === "dark" ? "grey.X" : "grey.Y"` par les tokens existants (`surfaceAppShell`, `tableBg`, `borderDefault`). `AssistantHome.tsx`/`AssistantList.tsx` mélangent déjà tokens et couleurs brutes dans le même fichier — uniformiser vers les tokens partout.
**Risque : faible.**

## Lot B16 — Pages Auth + Onboarding (+ décision de convention)
**Fichiers (6) :** `pages/Auth/Login/PasswordForm.tsx`, `pages/Auth/Register/CreateAccountForm.tsx`, `pages/Auth/ResetPassword.tsx`, `pages/Auth/ApplyResetPassword.tsx`, `pages/Auth/ValidateAccountForm.tsx`, `pages/Onboarding/OnBoarding.tsx`.
**Changement :** `PasswordForm.tsx:114` importe `colors.font.disabled` directement depuis `themeNew/foundations/colors` — **troisième système d'accès couleur dans un fichier qui utilise déjà `useColorModeValue` par ailleurs** : choisir un seul pattern (token sémantique) avant de corriger. `OnBoarding.tsx` utilise `currentDarkTheme` (4 occurrences) → `iconAccent`/tokens équivalents.
**Risque : faible.**

---

# Partie C — Typage (`any`, casts, assertions) — risque faible à moyen

## Lot C1 — `any` dans `components/ui` et state global
**Fichiers (5) :** `components/ui/Banner.tsx`, `components/ui/RowContainer.tsx`, `components/ui/BoxIcon.tsx`, `store/index.ts`, `hooks/useThemedToast.tsx`.
**Changement :** `Banner.tsx` — typer `SizeBannerVariants`/`StyleBannerVariants` (actuellement `Record<string, any>`), ajouter `size` à `GenragBannerProps` pour supprimer le cast `as any` ligne 329, typer `variant` en union de clés. `RowContainer.tsx` — retirer `[key: string]: any`. `BoxIcon.tsx` — typer `icon` proprement (`LucideIcon | React.ComponentType<...>` sans `any`). `store/index.ts:12` — laisser `configureStore` inférer le type de `getDefaultMiddleware` au lieu de `any`. `useThemedToast.tsx:134-136` — créer une interface `ThemedToastOptions extends UseToastOptions { actionLabel?; onAction?; }` au lieu de 3 casts `as any`.
**Risque : faible** (changements de type purs, pas de comportement modifié).

## Lot C2 — `any` sur les icônes de navigation
**Fichiers (4) :** `app/Navigation/SidebarItem.tsx`, `app/Navigation/SidebarFooter.tsx`, `pages/Profile/ProfileSidebar.tsx`, `pages/Profile/sections/AppearanceSection.tsx`.
**Changement :** typer `icon: any` en `icon: LucideIcon`, comme déjà fait correctement dans `app/Navigation/sidebarConfig.ts` (référence à suivre).
**Risque : faible.**

## Lot C3 — `catch`/erreurs non typées (Auth, Profile, Documents)
**Fichiers (9) :** `pages/Auth/Login/PasswordForm.tsx`, `pages/Profile/index.tsx`, `pages/Agents/Documents/index.tsx`, `components/Deployment/DeployModal.tsx`, `components/Deployment/AccessControl/MembersSection.tsx`, `pages/Auth/Register/CreateAccountForm.tsx`, `pages/Auth/ResetPassword.tsx`, `pages/Auth/ApplyResetPassword.tsx`, `pages/Auth/ValidateAccountForm.tsx`.
**Changement :** remplacer `catch (err: any)`/`(err as any)?.data?.message` par `catch (err: unknown)` + narrowing (le format d'erreur RTK Query est connu : `{ data: { message } }`, cf. `services/api.ts`).
**Risque : faible.**

## Lot C4 — Casts dans Agents/Workflow et Analytics
**Fichiers (9) :** `components/Agents/CreateAgentModal.tsx`, `components/Agents/Workflow/NodeModalContent/SettingPlaceholderContent.tsx`, `Analytics/CostByModelCard.tsx`, `Analytics/CostChart.tsx`, `Analytics/ErrorsChart.tsx`, `Analytics/LatencyChart.tsx`, `Analytics/VolumeChart.tsx`, `Analytics/AnalyticsTabs.tsx`, `pages/Agents/Workflow/index.tsx`.
**Changement :** `CreateAgentModal.tsx` — double cast `as unknown as {...}` sur `serializeWorkflow` à typer proprement. Les casts `as string`/`as number` répétés sur les points de tooltip (`Analytics/*Chart.tsx`) viennent d'un typage insuffisant du composant `ChartTooltip` partagé — envisager de préciser son type générique plutôt que de caster à chaque appelant. `AnalyticsTabs.tsx` — typer `onChange` sur l'union `AnalyticsTab` directement.
**Risque : faible à moyen** (le fix du typage de `ChartTooltip` peut nécessiter une modification partagée hors de ce lot).

## Lot C5 — Non-null assertions sur les paramètres de route
**Fichiers (4) :** `components/Document/Drawer/DocumentPreview.tsx`, `components/Document/Drawer/PreviewDrawer.tsx`, `components/Deployment/VersionsHistory/PipelineJsonPanel.tsx`, `components/Deployment/VersionsHistory/VersionDetailPanel.tsx`.
**Changement :** remplacer les `workspaceId!`/`agentId!`/`workflowVersion!`/`selectedId!` par une garde explicite (early return si absent) ou un typage de route qui garantit leur présence.
**Risque : moyen** (touche des points d'entrée de composants, à tester après coup).

---

# Partie D — Dossiers/imports mal placés (risque moyen : renommer/déplacer + mettre à jour tous les imports)

## Lot D1 — Déplacer les fichiers hors convention
**Fichiers concernés :**
- `types/localStorage.ts` → créer `src/constants/` (n'existe pas encore) et y déplacer (ce n'est pas un type, c'est un objet de constantes `LocalStorageKeys`)
- `hooks/useGetEnv.ts` (exporte en fait `useDeploymentEnvGetter`) → `hooks/deployment/useGetEnv.ts`
- `hooks/useOnBoarding.ts` → dépend de `pages/Onboarding/OnBoardingProvider` (sens de dépendance inversé) : déplacer dans `hooks/onboarding/` et clarifier la relation avec le provider
- `components/Assistant/Drawer/types.ts` → `src/types/assistant/`
- `components/Agents/Workflow/NodeModalContent/ModelSelector/modelUtils.ts` (aucun JSX, pur formatage) → `src/utils/models/`
- `MODEL_BADGE_CONFIG` (dans le même fichier) → `src/constants/models/`

**Changement :** déplacer + mettre à jour tous les imports (grep avant/après pour vérifier zéro référence cassée).
**Risque : moyen** — mécanique mais transverse, à faire fichier par fichier avec vérification de compilation entre chaque déplacement.

## Lot D2 — Uniformiser les imports (`@/...` vs chemin bare)
**Fichiers (7) :** `components/Dashboard/MetricCard.tsx`, `components/Agents/Chat/index.tsx` *(à vérifier — probablement `pages/Agents/Chat/index.tsx`)*, `pages/Agents/Analytics/index.tsx`, `pages/Agents/Deployment/Settings.tsx`, `components/Deployment/Settings/MessageItem.tsx` *(vérifier chemin exact)*, `components/Deployment/Settings/QueryDetailsDrawer.tsx`, `components/Agents/Analytics/CostChart.tsx`.
**Changement :** **d'abord vérifier si l'alias `@/` est réellement déclaré** dans `tsconfig.json`/`craco.config.js` (webpack alias). S'il l'est, uniformiser tout le repo vers `@/` OU vers le chemin bare (`components/...`) — choisir une seule convention. S'il ne l'est pas de façon fiable, ces imports sont un risque de build cassé et doivent être corrigés en priorité.
**Risque : moyen** — dépend d'une vérification de config préalable ; potentiellement plus urgent que son rang ne l'indique si l'alias n'est pas fiable.

---

# Partie E — Logique/formatage dupliqué à consolider (risque moyen)

## Lot E1 — Consolider le formatage de dates
**Fichiers (7) :** `utils/documentFormatters.ts`, `utils/analytics/dateUtils.ts`, `components/Deployment/DashboardTab/RecentDeploymentsCard.tsx`, `components/Deployment/VersionsHistory/VersionHeaderActions.tsx`, `components/Deployment/VersionsHistory/VersionsSidebar.tsx`, `components/Deployment/Settings/QueryLogsTable.tsx`, `components/Assistant/ConversationSidebar.tsx`.
**Changement :** `utils/documentFormatters.formatDate` (temps relatif "il y a 5 min") et les 3 `formatDate` locaux de `Deployment/*` (date absolue "12 mars 2025") **portent le même nom pour un comportement différent** — risque de bug si quelqu'un importe le mauvais. Consolider dans un seul `utils/date.ts` avec deux noms explicites (`formatRelativeDate` / `formatAbsoluteDate`), et migrer tous les appelants listés. Inclut `pages/Assistant/AssistantHome.tsx`/`AssistantList.tsx` (`formatRelativeDate`/`formatDate` dupliqués, cf. Lot E-bis ci-dessous).
**Risque : moyen** — vérifier le format de sortie exact attendu par chaque appelant avant de fusionner (locale FR, format court/long).

## Lot E2 — Consolider le formatage de taille de fichier
**Fichiers (2) :** `utils/documentFormatters.ts` (`formatFileSize`), `components/Document/Header/StorageOverviewPanel.tsx` (`fmt()`, doublon).
**Changement :** supprimer `fmt()` local, utiliser `formatFileSize` partagé.
**Risque : faible à moyen.**

## Lot E3 — Extraire `useSkeletonCount`/`CardSkeleton` dupliqués
**Fichiers (2) + 1 nouveau :** `pages/Agents/index.tsx`, `pages/Assistant/AssistantList.tsx` → nouveau `hooks/useSkeletonCount.ts` + composant `CardSkeleton` partagé.
**Risque : faible à moyen.**

## Lot E4 — Fusionner `CardHeader`/`RowContainer`
**Fichiers (4) :** `components/ui/CardHeader.tsx`, `components/ui/RowContainer.tsx`, `components/Dashboard/AgentsCard.tsx`, `components/Dashboard/RecentActivityCard.tsx` (+ suppression d'un des deux composants une fois fusionnés).
**Risque : moyen.**

## Lot E5 — Fusionner les 3 pages légales
**Fichiers (3) + 1 nouveau :** `pages/Legal/PrivacyPage.tsx`, `pages/Legal/TermsPage.tsx`, `pages/Legal/NoticesPage.tsx` → nouveau composant `LegalDocPage` paramétrable (icône/titre/description/date/tableau). Corriger au passage le `<>...</>` sans `key` dans un `.map()` présent dans les 3 fichiers.
**Risque : moyen.**

## Lot E6 — Extraire `AnalyticsChartCard` (header dupliqué)
**Fichiers (6) + 1 nouveau :** `components/Agents/Analytics/CostChart.tsx`, `ErrorsChart.tsx`, `LatencyChart.tsx`, `VolumeChart.tsx`, `CostByModelCard.tsx`, `CostByTypeCard.tsx` → nouveau composant `AnalyticsChartCard` (header titre + tooltip + sélecteur de période + slot contenu).
**Risque : moyen.**

## Lot E7 — Fusionner les `*HoverBridge` dupliqués
**Fichiers (3) :** `components/Agents/Analytics/ChartHoverBridge.tsx`, `components/Dashboard/ActivityChart.tsx` (bridge inline), `components/Dashboard/MetricCard.tsx` (`SparkHoverBridge` inline) → généraliser en un seul hook/composant partagé.
**Risque : moyen.**

## Lot E8 — Extraire le moteur d'animation "step progress" (plus gros doublon du repo)
**Fichiers (4) + 2 nouveaux :** `Workflow/NodeModalContent/Query/QueryNodeOverviewTab.tsx`, `ReRanker/ReRankerNodeOverviewTab.tsx`, `Response/ResponseNodeOverviewTab.tsx`, `Document/DocumentNodeOverviewTab.tsx` → nouveau hook `useStepAnimation(stepCount)` + composant `<StepProgressBar>` (et le wrapper `motion.div` répété ~15 fois → composant `<AnimationStepFrame>`).
**Changement :** ces 4 fichiers sont aussi les plus gros du repo (683/506/472/387 lignes) — cette extraction fait déjà baisser leur taille de façon significative, à faire **avant** la Partie I (découpage des gros fichiers) pour ne pas dupliquer l'effort.
**Risque : moyen** (comportement visuel à préserver à l'identique, bien tester chaque type de node).

## Lot E9 — Unifier les 3 "cartes modèle"
**Fichiers (3) + 1 nouveau :** `Workflow/NodeModalContent/NodeSettingsEditor.tsx` (`ModelPickerCard`), `ModelSelector/ModelListItem.tsx`, `SettingPlaceholderContent.tsx` (`ModelCard`) → composant partagé unique (nom + provider + description + prix in/out).
**Risque : moyen.**

## Lot E10 — Fusionner `NodeInformation/Rewriter.tsx` et `Reranker.tsx`
**Fichiers (2) + 2 nouveaux :** → `NodeInformationLayout` (titre/description/animation/impact bars/bénéfices) + sous-composant `BenefitItem`.
**Risque : moyen.**

## Lot E11 — Hook `useAuthStepConfig` (Auth)
**Fichiers (3) + 1 nouveau :** `pages/Auth/Login/index.tsx`, `pages/Auth/Register/index.tsx`, `pages/Auth/Validate/index.tsx` → factoriser le `useEffect` de config `canGoBack`/`showBackground` dupliqué.
**Risque : moyen.**

## Lot E12 — Composant `MobileSidebarDrawer` partagé
**Fichiers (2) + 1 nouveau :** `app/Navigation/MainSidebar/Sidebar.tsx`, `app/Navigation/LegalSidebar/LegalSidebar.tsx` → extraire le bloc Drawer+burger dupliqué.
**Risque : moyen.**

## Lot E13 — Dédupliquer l'export de fichiers dans `UserRights.tsx`
**Fichiers (1) :** `components/Deployment/Settings/UserRights.tsx` — fusionner `handleExportConversations`/`handleExportApiLogs` (quasi identiques) en une fonction paramétrée.
**Note :** à faire dans la même passe que le Lot G1 (migration de ces `fetch()` vers RTK Query), pas séparément.
**Risque : moyen.**

---

# Partie F — États de chargement/erreur/vide manquants (risque moyen : ajout de code, peu de suppression)

## Lot F1 — Analytics
**Fichiers (7) :** `components/Agents/Analytics/CostChart.tsx`, `ErrorsChart.tsx`, `LatencyChart.tsx`, `CostByModelCard.tsx`, `CostByTypeCard.tsx`, `ActivityHeatmapCard.tsx`, `RecentQueriesCard.tsx`.
**Changement :** ajouter la gestion `isLoading`/`error` manquante (voir `DocumentHealthCard.tsx` et `ModelSelectorContent.tsx` dans le même repo comme bons exemples à suivre). Corriger le calcul `isEmpty` qui affiche l'état vide pendant le chargement (`!isLoading && length === 0` évalué avant que `data` arrive) dans `CostByModelCard.tsx`/`CostByTypeCard.tsx`/`RecentQueriesCard.tsx`.
**Risque : moyen** — dépend du Lot G-tags (ajout du tag `Analytics`, Partie G) pour que le cache se comporte correctement, mais peut être fait indépendamment côté UI.

## Lot F2 — Deployment
**Fichiers (7) :** `DashboardTab/CreditSummaryCard.tsx`, `Settings/QueryLogsTable.tsx`, `VersionsHistory/PipelineJsonPanel.tsx`, `VersionsHistory/VersionDetailPanel.tsx`, `VersionsHistory/VersionsSidebar.tsx`, `VersionsHistory/VersionHeaderActions.tsx`, `pages/Agents/Deployment/DashboardTab.tsx`.
**Changement :** ajouter états d'erreur manquants ; corriger `pages/Agents/Deployment/DashboardTab.tsx` où `isLoading || !data` reste vrai indéfiniment après une erreur (skeleton infini). `VersionHeaderActions.tsx` : le `rollback(...)` n'utilise ni `.unwrap()` ni try/catch ni toast, contrairement aux autres mutations du même dossier (`DeployModal`, `MembersSection`) — uniformiser.
**Risque : moyen.**

## Lot F3 — Nav/pages
**Fichiers (5) :** `pages/Agents/Workflow/index.tsx` (ajouter `isError` sur `useGetActiveWorkflowQuery`), `app/Navigation/AgentSidebar/AgentSidebar.tsx`, `app/Navigation/MainSidebar/Sidebar.tsx`, `app/Navigation/LegalSidebar/LegalSidebar.tsx`, `components/ui/GlassNav/GlassNavAppExample.tsx`.
**Changement :** ajouter `isLoading`/`isError` sur les queries actuellement traitées avec un simple fallback silencieux (`agent?.name ?? "A"`).
**Risque : moyen.**

## Lot F4 — Document/Assistant
**Fichiers (2) :** `components/Document/Drawer/DocumentPreview.tsx` (remplacer le texte "Chargement..." par un vrai `Skeleton`, cohérent avec le reste de la feature), `components/Assistant/AssistantChatLayout.tsx` (la prop `isHistoryLoading`, reçue avec une vraie valeur du parent, n'est jamais utilisée dans le rendu — brancher un indicateur de chargement de l'historique).
**Risque : moyen.**

## Lot F5 — Simplifier les Skeleton qui recodent le thème par défaut
**Fichiers (3) :** `components/Deployment/AccessControl/MembersSection.tsx`, `components/Assistant/HistoryLoadingSkeleton.tsx`, `components/Assistant/Drawer/QuerySourcesTab.tsx`.
**Changement :** retirer les `startColor`/`endColor` ou `useColorModeValue` manuels pour `grey.100/800`+`grey.200/700` — le thème `Skeleton` (`themeNew/components/skeleton.ts`) applique déjà ces valeurs par défaut.
**Risque : faible** (simplification pure, pourrait aussi bien vivre en Partie B).

## Lot F6 — `DataPrivacy.tsx` : état inatteignable
**Fichiers (1) :** `components/Deployment/Settings/DataPrivacy.tsx` — `anonymize`/`auditLog` sont des `useState` locaux jamais synchronisés au serveur ET les contrôles sont en permanence `disabled`/`comingSoon` : soit retirer ce state mort, soit le brancher (cf. Décisions produit).
**Risque : faible** (suppression de code inatteignable) **à moyen** (si on décide de le brancher).

---

# Partie G — Appels API hors RTK Query / cache RTK Query (risque moyen à élevé)

## Lot G1 — Remplacer les `fetch()` directs par RTK Query
**Fichiers (2, + fichiers de service associés) :**
- `hooks/useUploadDocuments.ts:67` — poll un document via `fetch()` alors que `services/document/document.ts` expose déjà `getDocumentById` avec `providesTags`. Remplacer tout le polling manuel (`useState`, `setTimeout` récursif, `cancelledPolls` ref) par `useGetDocumentByIdQuery(..., { pollingInterval })`.
- `components/Deployment/Settings/UserRights.tsx:31,46` — 2 `fetch()` directs pour des exports (conversations/API logs), aucune gestion d'erreur visible pour l'utilisateur. Créer 2 endpoints RTK Query dans `services/deployment/deployment.ts` (ou nouveau fichier) avec `responseHandler: "blob"`.

**Risque : élevé** — ce sont des flux fonctionnels réels (upload/export), à tester manuellement après migration (pas seulement relire le diff).

## Lot G2 — Nettoyage store/hooks liés au cache
**Fichiers (3) :** `store/index.ts` (retirer ou généraliser l'import `"services/agent/agent"` isolé et trompeur — décider d'une convention : soit importer tous les fichiers `services/*/*.ts` pour la clarté, soit ne compter que sur les imports de composants), `store/reduxProvider.tsx` (retirer la directive `"use client"` héritée de Next.js, sans effet en CRA/craco), `hooks/useAuthentification.ts` (supprimer le `useState`+`useEffect` qui recopie `userData`/`isUserLoading` — dériver directement depuis le résultat de `useGetMeQuery`).
**Risque : faible à moyen.**

## Lot G3 — Invalider les tags après une query RAG (SSE)
**Fichiers (3) :** `hooks/chat/useSSEStream.ts`, `hooks/chat/useAgentQuery.ts`, `hooks/chat/useAssistantQuery.ts`.
**Changement :** après la fin d'un stream réussi, dispatcher `backendApi.util.invalidateTags([...])` pour `Tag.Credits` (le solde a changé) et `Tag.Chat` (nouvelle conversation/message). Les endpoints EventSource restent hors RTK Query (exception acceptable, pas de support SSE natif) mais doivent notifier le cache en sortie.
**Risque : élevé** — touche le flux critique du produit (exécution RAG), doit être testé en conditions réelles pour éviter des refetch en boucle ou des invalidations manquées.

---

# Partie H — RTK Query : tags manquants/incohérents (risque moyen à élevé)

Constat structurel : `services/tags/tag.ts` ne contient que 10 tags (`Workspaces, Users, Documents, Agents, Chat, Workflow, Deployments, Onboarding, Credits, AgentMembers`) — **aucun tag `Analytics` ni `Billing`**.

## Lot H1 — Ajouter le tag `Analytics`
**Fichiers (2) :** `services/tags/tag.ts` (ajouter `Analytics`), `services/analytics/analytics.ts` (ajouter `providesTags` sur les 7 endpoints : `getDailyMetrics`, `getLatency`, `getDocumentHealth`, `getActivityHeatmap`, `getCostByModel`, `getCostByType`, `getRecentQueries`).
**Risque : moyen.**

## Lot H2 — Tags manquants sur crédits/logs de query
**Fichiers (2) :** `services/agentRuntime/agentRuntime.ts` (`executeAgentRuntime` doit `invalidatesTags: [Tag.Credits]` ; `getQueryLogs` doit avoir `providesTags`), `services/credit/credit.ts` (`getWorkspaceConsumption` doit avoir `providesTags`).
**Risque : moyen.**

## Lot H3 — Auth logout + déploiement redondant
**Fichiers (2) :** `services/auth/auth.ts` (`logoutUser` doit `invalidatesTags: [Tag.Users]`, sinon le cache `getMe` de l'utilisateur précédent peut fuiter brièvement après un nouveau login), `services/deployment/deployment.ts` (`rollbackDeployment` a à la fois un `invalidatesTags` correct **et** un `onQueryStarted` qui refait la même invalidation manuellement — retirer le doublon).
**Risque : moyen.**

## Lot H4 — Stats workspace jamais invalidées
**Fichiers (potentiellement nombreux, à identifier précisément avant de coder) :** `services/workspace/workspace.ts` (le tag `{Tag.Workspaces, id: '${workspaceId}-stats'}` de `getWorkspaceStats` n'est invalidé par aucune mutation) + toutes les mutations qui devraient l'invalider : création/suppression d'agent (`services/agent/agent.ts`), upload de document (`services/document/document.ts`), déploiement (`services/deployment/deployment.ts`).
**Changement :** ajouter le tag de stats aux `invalidatesTags` de ces mutations, ou accepter un léger différé et documenter le choix.
**Risque : élevé** — nécessite de tracer précisément toutes les mutations concernées pour ne pas sur-invalider (refetch inutile) ni sous-invalider (dashboard périmé).

## Lot H5 — `services/billing/billing.ts` : passer en vrai RTK Query
**Fichiers (1) :** `services/billing/billing.ts` — actuellement pas de `injectEndpoints`, juste des fonctions stub qui `throw`.
**Changement :** bloqué par la Décision produit (Stripe/paiement réel) — ne pas coder avant clarification, mais si la feature est confirmée, migrer vers `backendApi.injectEndpoints` avec un tag `Billing` dédié.
**Risque : élevé** (dépend du backend, à ne pas commencer sans confirmation produit).

---

# Partie I — Types dupliqués/incohérents (risque élevé : changements transverses)

## Lot I1 — Unifier `Workspace`
**Fichiers de départ (2) + tous les call sites à identifier par grep avant de coder :** `types/user.ts` (`Workspace` sans `users`, dates en `string`) vs `types/workspace.ts` (`Workspace` avec `users`, dates en `Date`) — **deux définitions incompatibles du même nom**.
**Risque : élevé** — toucher un type aussi central peut casser la compilation dans de nombreux fichiers ; à faire dans une branche dédiée avec `tsc --noEmit` comme filet de sécurité à chaque étape.

## Lot I2 — Unifier `UserRole`
**Fichiers (2) + call sites :** `types/user.ts` (union `"ADMIN"|"EDITOR"|"VIEWER"`) vs `types/workspace.ts` (`enum UserRole`). **Attention :** les deux ne sont pas interchangeables (comparaisons `role === "ADMIN"` vs `role === UserRole.ADMIN`), tout call site doit être vérifié un par un.
**Risque : élevé.**

## Lot I3 — Clarifier `AgentStatus` à travers les types
**Fichiers (2) + call sites :** `AgentPreview.status` vs `Agent` (pas de champ statut) vs `AgentApiResponse.deploymentStatus` (type mort, cf. Lot A1) vs `CurrentDeployment.deploymentStatus` — quatre façons différentes de représenter le même concept selon l'endpoint. Une fois `AgentApiResponse` supprimé (Lot A1), documenter clairement quel champ fait foi selon l'endpoint appelé, ou harmoniser côté back si possible.
**Risque : élevé.**

## Lot I4 — Rapatrier les types définis dans les fichiers de service vers `types/`
**Fichiers (7) + nouveaux fichiers de types :** `services/agent/agentMembers.ts` (`AgentMember`), `services/chat/chat.ts` (`ChatMessageHistory`, `ChatResponse`, `ChatMetadata`, `AssistantPreview`, `ConversationPreview`), `services/credit/credit.ts` (`AgentConsumption`, `WorkspaceConsumption`, `CreditBalanceSummary`), `services/onboarding/onboarding.ts` (`OnboardingSession`, `CompareOnboardingResponse`), `services/billing/billing.ts` (`CreditBalance`, `PaymentMethod`, `CreditPackage`), `services/analytics/analytics.ts` (tous les types `*Point`), `services/agentRuntime/agentRuntime.ts` (`QueryLog`, `QueryLogPage`).
**Changement :** créer `types/chat/`, `types/credit/`, `types/analytics/`, `types/billing/` et déplacer, en gardant des ré-exports temporaires si besoin pour limiter le diff d'un coup.
**Risque : élevé** — volume important d'imports à mettre à jour, à faire fichier de service par fichier de service (sous-lots), pas en un seul commit.

## Lot I5 — Fusionner `QueryLog`/`QueryLogEntry` dupliqués
**Fichiers (2) :** `services/agentRuntime/agentRuntime.ts` (`QueryLog`) et `services/analytics/analytics.ts` (`QueryLogEntry`) — même shape, noms différents. À traiter avec le Lot I4 (une fois rapatriés dans `types/`, les fusionner en un seul type).
**Risque : moyen à élevé.**

## Lot I6 — Corriger le typage `Date` vs `string`
**Fichiers (2) + audit des call sites :** `types/document/document.ts` (`createdAt: Date`, `indexedAt?: Date|null`...), `types/workspace.ts` (`createdAt: Date`, `updatedAt: Date`, `agents[].createdAt: Date`) — `fetchBaseQuery` ne fait que `response.json()`, la valeur réelle est une `string` ISO. Incohérent avec `types/user.ts`/`types/agent/agent.ts` qui typent correctement en `string`.
**Changement :** corriger en `string`, puis chercher tout code qui appelait `.getTime()`/`.toLocaleDateString()` directement sur ces champs en supposant un objet `Date` (bug potentiel démasqué par cette correction).
**Risque : élevé** — peut révéler des bugs runtime existants et masqués par le typage actuel.

---

# Partie J — Découpage des fichiers > 200 lignes restants (risque élevé : gros diffs sur des écrans centraux)

À faire **après** les Lots E8/E9/E10 (qui réduisent déjà la taille de plusieurs fichiers ci-dessous en extrayant la duplication) pour ne pas découper deux fois le même code.

## Lot J1 — Workflow builder (page + modale principale)
**Fichiers (3) :** `pages/Agents/Workflow/MenuNodeModal.tsx` (367 lignes), `pages/Agents/Workflow/index.tsx` (304 lignes).
**Changement :** extraire les hooks déjà identifiés — `useIncompleteNodesGuard`/`useUnsavedChangesBlocker` (validation avant sauvegarde + blocage de navigation, `index.tsx` lignes 81-110 et 157-180) et `useCommandPaletteKeyboard` (raccourci ⌘K, `MenuNodeModal.tsx` lignes 167-207).
**Risque : élevé** — cœur du produit (builder de workflow), tester tous les scénarios (ajout/suppression de node, sauvegarde, navigation).

## Lot J2 — `NodeModalContent/*OverviewTab.tsx` restants après extraction d'animation
**Fichiers (4) :** `Query/QueryNodeOverviewTab.tsx`, `ReRanker/ReRankerNodeOverviewTab.tsx`, `Response/ResponseNodeOverviewTab.tsx`, `Document/DocumentNodeOverviewTab.tsx` (683/506/472/387 lignes avant extraction du Lot E8).
**Changement :** découper le reste par section/tab logique une fois l'animation extraite.
**Risque : élevé.**

## Lot J3 — Autres gros fichiers (nav, onboarding, billing, dashboard)
**Fichiers (12) :** `pages/Onboarding/OnBoardingProvider.tsx` (282), `app/Navigation/AgentSidebar/AgentSidebar.tsx` (264), `app/Navigation/SidebarFooter.tsx` (259 — vérifier d'abord s'il duplique `hooks/useIsDark.ts` avant de découper, cf. finding fork pages/app), `components/Billing/BuyCreditsSection.tsx` (264), `components/Billing/ChangePlanSection.tsx` (259), `components/Dashboard/MetricCard.tsx` (269), `app/Navigation/LegalSidebar/LegalSidebar.tsx` (227), `pages/Onboarding/steps/CompareIntelligenceStep.tsx` (214), `pages/Profile/sections/PersonalInfoSection.tsx` (213 — corriger aussi le bug des champs `lastName`/`phone`/`role` non rendus, cf. Décisions produit), `pages/Assistant/AssistantList.tsx` (208), `pages/Dashboard/index.tsx` (206), `pages/Onboarding/OnBoarding.tsx` (201).
**Changement :** découper par responsabilité (sous-composants/hooks), au cas par cas — pas de pattern unique commun à tous.
**Risque : élevé** (volume), à répartir en 2-3 commits séparés (ex. Billing / Onboarding / Nav+Dashboard) plutôt qu'un seul.

## Lot J4 — `components/ui` volumineux
**Fichiers (2) :** `components/ui/Banner.tsx` (356 lignes), `components/ui/GlassNav/GlassNav.tsx` (316 lignes).
**Changement :** `Banner.tsx` gère beaucoup de variantes visuelles dans un seul fichier — envisager de scinder par variante ou d'extraire la logique de hover/glow (`Lot E-hook Banner`, déjà noté en Partie E comme `useHoverGlow` candidat) avant de découper le reste. `GlassNav.tsx` : le prop `action`/`ActionButton` interne (lignes 281-316) n'est appelé par aucun consommateur (`GlassNavAppExample` ne le passe jamais) — à clarifier (code mort ou feature prévue) avant de découper.
**Risque : élevé.**

---

# Synthèse (comptage indicatif)

| Catégorie | Fichiers concernés (approx.) |
|---|---|
| Code mort | 21 |
| Couleurs en dur | ~110 (Parties B1-B16) |
| Typage (`any`/casts) | ~28 |
| Dossiers/imports mal placés | 12 |
| Duplication → composants/hooks | ~35 |
| États chargement/erreur/vide manquants | ~24 |
| API hors RTK Query / cache | 8 |
| Tags RTK Query manquants/incohérents | ~10 |
| Types dupliqués/incohérents | ~15 |
| Fichiers > 200 lignes à découper | 21 |

**Ordre d'exécution recommandé :** Parties A → B → C → D → E → F → G → H → I → J, en respectant à l'intérieur de chaque partie l'ordre des lots (déjà trié par risque croissant). Les Décisions produit doivent être tranchées avant de commencer les lots qui touchent les fichiers concernés (Billing, Deployment/AccessControl+Settings, Legal/ContactForm, Profile/PersonalInfoSection).
