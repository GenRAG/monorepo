# Audit ponytail : `packages/workflow/` (`@genrag/workflow`) et la frontière du contrat `blocks`

**What this repo does:** `@genrag/workflow` est le modèle et l'éditeur visuel des workflows RAG. Un « node » est un bloc du dessin. Un « edge » est un lien entre deux nodes. Le package dessine la chaîne Question → Reformulation ? → Recherche → Classement ? → Réponse, avec ses réglages (modèle IA, instructions, bases). Il la transforme en `blocks`, le tableau que le back valide puis envoie au moteur RAG (`serializeWorkflow`). Il fait aussi le chemin inverse (`pipelineToWorkflow`), et il répare les workflows lus en base (`sanitizeWorkflowEdges`). Charge supposée : une personne qui édite un petit graphe (5 à 15 nodes) dans son navigateur. Ce qui compte ici, c'est l'exactitude du contrat, pas la vitesse.

Vérifié : `yarn typecheck` passe et `yarn test` donne 46/46, avec le test `core-boundary` vert (le core n'atteint ni React, ni Chakra, ni ReactFlow, ni CSS). Les preuves ont été faites avec des scripts node sur `.test-dist` et sur le vrai `getElementsToRemove` de `@xyflow/system` 0.0.76 (ReactFlow 12.10.2).

## Must fix

1. **Le modèle de reformulation choisi par l'utilisateur est ignoré par le moteur** (`packages/workflow/src/utils/serialize.ts:19`, `src/types/pipeline.ts:7`, `plateform_back/src/rag-engine/pipeline.schema.ts:8-12`) — NOUVEAU
   - **What this is:** Le block `query_rewrite` porte le modèle choisi dans le node « Reformulation ». Le package, le schéma Zod du back et les tests l'écrivent tous dans le champ `model`.
   - **Problem:** Le moteur lit `model_name`, pas `model` (`rag-engine/BLOCKS_FORMAT.md:99`, `rag-engine/app/schemas/rag.py:14`, `pipelines/rag_pipeline.py:141`). Pydantic jette le champ inconnu sans erreur. Cas concret : l'utilisateur choisit « Mistral » ; le moteur reçoit `{type:"query_rewrite", model:"mistral"}` et reformule quand même avec `google/gemini-2.5-flash`. Les trois côtés de la plateforme sont d'accord entre eux, mais faux face au moteur.
   - **Fix:** Renommer au seul endroit qui parle au moteur, sans toucher la base. Dans `pipeline.schema.ts`, `RewriteBlock` devient `z.object({...}).transform(({ model, ...b }) => ({ ...b, model_name: model }))`. Puis corriger le commentaire de `types/pipeline.ts` (« mirror » du moteur) et ajouter un test back qui vérifie `model_name` dans le pipeline envoyé.
   - **If we skip it:** Le choix du modèle de reformulation est purement décoratif. Le coût et la qualité affichés pour ce modèle ne sont pas ceux qu'on facture et qu'on sert.

2. **La touche Retour arrière casse la chaîne du workflow sans prévenir** (`src/graph/create-flow-node.ts:19-20,65,212`, `plateform_front/src/pages/Agents/Workflow/index.tsx:111-123`, `src/components/WorkflowCanvas.tsx:53-69`) — NOUVEAU
   - **What this is:** ReactFlow supprime par défaut le node ou l'edge sélectionné quand on appuie sur Retour arrière (`deleteKeyCode = 'Backspace'`), sauf s'il a `deletable: false`. La doc du package dit : « les nodes de chaîne sont `deletable: false` pour que ReactFlow ne les supprime pas au clavier ».
   - **Problem:** `insertChainNode` crée Reformulation et Classement avec `CreateFlowNode(..., optional)`, donc avec `deletable: true` (un test le fige : `test/graph.test.ts:200`). Les nodes de réglage ont aussi `deletable: true` (ligne 65), comme tous les edges. Cas prouvé : on ajoute une Reformulation, on la sélectionne, on appuie sur Retour arrière. ReactFlow retire le node et ses edges, `serializeWorkflow` ne renvoie plus que `[{"name":"query","type":"query"}]`, et le node « modèle » reste orphelin. Même chose si on sélectionne l'edge Question → Recherche. Si on supprime le node « Modèle IA » de la Réponse, il ne reste aucun placeholder, la garde de sauvegarde laisse passer, et `mistral` devient `gpt-4o` en silence. Le schéma du back accepte `[query]` seul.
   - **Fix:** Ajouter `deleteKeyCode={null}` aux deux `<ReactFlow>` (la page builder et `WorkflowCanvas`). Toutes les suppressions voulues passent déjà par des boutons (`handleRemoveChainNode`, `handleRemoveSettingNode`). Ensuite, supprimer le paramètre `deletable` de `CreateFlowNode` et le test qui fige `true`.
   - **If we skip it:** Une seule touche produit un agent qui ne répond plus (le pipeline ne finit pas par `answer`) ou qui utilise un autre modèle. Le résultat est sauvegardé, puis déployé.

## Should fix

3. **`sanitizeWorkflowEdges` garde les nodes orphelins et ne recrée jamais un réglage manquant** (`src/utils/sanitize.ts:25-36,71-75`) — NOUVEAU
   - **What this is:** C'est la réparation appelée sur tout workflow lu en base. D'après la doc, elle « retire les nodes orphelins ».
   - **Problem:** Elle ne retire un node de réglage que s'il a encore un edge dont le parent a disparu. Un node de réglage sans aucun edge (le cas du point 2, une fois sauvegardé) reste pour toujours : c'est prouvé, l'orphelin est toujours là après `sanitize`. Elle n'ajoute pas non plus le réglage qui manque. Or le panneau de la Réponse n'est qu'une vue d'ensemble (`plateform_front/.../NodeModalContent/panels.tsx`). Une fois le node « Modèle IA » perdu, l'utilisateur ne peut donc plus jamais choisir de modèle.
   - **Fix:** Dans `sanitizeWorkflowEdges`, retirer aussi les nodes qui ont un `parentNodeId` mais aucun edge `settings` entrant. Ensuite, appeler `withAutoSettings(nodes, edges, undefined, DEFAULT_LAYOUT, registry)`, qui est déjà idempotent et testé. Ajouter un test « orphelin sans edge » et un test « réglage manquant recréé ».
   - **If we skip it:** Les workflows déjà abîmés le restent, avec des nodes fantômes à l'écran et un modèle par défaut impossible à changer.

4. **Un workflow ancien (blocks seuls) s'ouvre vide dans le builder, et sauvegarder l'efface** (`plateform_front/src/pages/Agents/Workflow/index.tsx:168-172`) — NOUVEAU
   - **What this is:** Au chargement, la page n'appelle `sanitizeWorkflowEdges` que si la définition a `nodes` et `edges`. Sinon elle passe `undefined`.
   - **Problem:** Le back gère encore des définitions anciennes qui sont un simple tableau de blocks (`agent-runtime.builder.ts:44-46`), et `WorkflowViewer` sait les dessiner avec `pipelineToWorkflow`. Le builder, lui, ne le fait pas. Cas concret : `definition = [{type:"query"},…]`. Le canvas s'ouvre vide. Si on clique sur « Enregistrer », la garde ne voit aucun placeholder et `serializeWorkflow([], [])` écrit `blocks: []` par-dessus l'ancien pipeline.
   - **Fix:** Reprendre la même règle que `WorkflowViewer.tsx:131-133` : quand il n'y a pas de `nodes`, faire `pipelineToWorkflow(Array.isArray(def) ? def : def?.blocks ?? [])`. Trois lignes.
   - **If we skip it:** La configuration d'un agent ancien est perdue si quelqu'un la sauvegarde, à condition qu'une telle ligne existe encore en base (non vérifié).

5. **Une instruction tapée mais pas « validée » passe la garde et se perd** (`plateform_front/src/hooks/useIncompleteNodesGuard.tsx:11`, `src/components/nodes/SettingNodes/InstructionNode.tsx:378`) — NOUVEAU
   - **What this is:** Un clic sur le placeholder d'instruction met `isPlaceholder: false, isEditing: true`. Le texte reste dans un brouillon local jusqu'au clic sur « Valider ».
   - **Problem:** La garde de sauvegarde ne teste que `isPlaceholder`, et le contrôle de déploiement du back fait pareil (`deployment.service.ts:75`). Cas concret : l'utilisateur ouvre l'instruction, tape « Réponds en anglais », puis clique sur « Enregistrer » dans la barre. La sauvegarde réussit, `serializeWorkflow` n'envoie pas de `system_prompt`, et le texte disparaît au rechargement.
   - **Fix:** Dans la garde, tester `n.data.isPlaceholder || n.data.isEditing`. Une ligne.
   - **If we skip it:** L'utilisateur croit avoir réglé son assistant, mais l'agent tourne avec le prompt par défaut du moteur.

6. **Les modèles restés vides deviennent `gpt-4o` / `bge`, et les modèles d'agent les sauvegardent ainsi** (`src/utils/serialize.ts:10,19-22`, `plateform_front/src/components/Agents/CreateAgentModal.tsx:12-21,60`) — W-01, toujours ouvert
   - **What this is:** Un réglage MODEL sans valeur est remplacé par un modèle par défaut. Un test le fige : `test/serialize.test.ts:32`.
   - **Problem:** `CreateAgentModal` et `BLANK_WORKFLOW` appellent `serializeWorkflow` sur des placeholders, sans passer par la garde. Tout agent créé depuis le modèle « Agent Conversationnel Avancé » part donc avec `rerank: "bge"`. Ce modèle n'est pas dans ce que documente le moteur (`provider` zeroentropy/cohere, `model` `zerank-2`, `BLOCKS_FORMAT.md` § rerank), alors que l'app charge les vrais modèles par `/rag/models/rerank`. Le playground l'exécute tel quel.
   - **Fix:** Décision humaine, comme en W-01 : soit ne pas écrire de `model` pour un placeholder (le moteur a ses propres défauts pour les 3 blocks), soit prendre le premier modèle de l'API. La première option supprime `DEFAULT_MODELS`.
   - **If we skip it:** Le premier test d'un agent tout neuf peut échouer ou utiliser un modèle que personne n'a choisi.

7. **`WorkflowViewer` ignore le registre qu'on lui donne** (`src/components/WorkflowViewer.tsx:131-133`) — NOUVEAU
   - **What this is:** Le registre décrit les tâches et le nom de leurs réglages. Le viewer le transmet au canvas, qui dessine les poignées (« handles », les points d'accroche des edges) avec ces noms.
   - **Problem:** Le viewer appelle `pipelineToWorkflow(…, { layout })` et `sanitizeWorkflowEdges(nodes, edges)` sans `registry`. Cas prouvé : avec un registre où « Modèle IA » s'appelle « AI model », les edges visent `setting-source-Modèle IA` alors que le node dessine `setting-source-AI model`. ReactFlow ne trace pas ces edges (erreur 008). En plus, `sanitize` « répare » une définition sauvegardée avec ce registre en lui remettant les noms par défaut.
   - **Fix:** Passer `registry: canvasProps.registry` aux deux appels, et ajouter `registry` aux dépendances du `useMemo`.
   - **If we skip it:** Le cas d'usage du README (registre personnalisé) affiche des réglages détachés, au premier client externe.

8. **Les tests du package ne tournent pas en CI** (`.github/workflows/jobs.yml:122-149`) — W-06, en partie corrigé (les tests existent), toujours ouvert pour la CI
   - **What this is:** `yarn test` protège le contrat `blocks`, l'aller-retour et la frontière « core sans React ».
   - **Problem:** Le job front ne lance que le lint (non bloquant) et le build de `plateform_front`. Une PR peut casser `serializeWorkflow`, ou importer un composant dans `graph/`, et la CI reste verte. La doc le reconnaît : « pas encore dans la CI ».
   - **Fix:** Ajouter une étape `working-directory: packages/workflow` + `run: yarn test` après `yarn install` dans le job `frontend`. Trois lignes, sans nouvelle dépendance (`typescript` est déjà installé par le workspace).
   - **If we skip it:** Le test `core-boundary` et les tests d'aller-retour ne servent que si quelqu'un pense à les lancer.

9. **La suppression d'un node de chaîne n'a pas de test** (`src/hooks/useWorkflowNodes.ts:104-132`) — NOUVEAU
   - **What this is:** `handleRemoveChainNode` supprime un node et ses réglages, puis relie le précédent au suivant. C'est la seule façon autorisée de retirer un node.
   - **Problem:** Cette logique de graphe vit dans un hook React, donc `node --test` ne peut pas la tester. L'ajout, lui, a été sorti dans `insertChainNode`, qui est pur et testé. La règle « toute logique du core a un test » n'est pas tenue pour la moitié « suppression ». Si on casse la reconnexion (par exemple en filtrant mal `EdgeType.Settings`), le prochain pipeline s'arrête à `query` sans qu'aucun test échoue.
   - **Fix:** Déplacer le corps dans `removeChainNode(nodes, edges, id)` dans `create-flow-node.ts`, à côté d'`insertChainNode`. Le hook ne fait plus que `setNodes`/`setEdges`. Ajouter un test : insérer puis retirer une Reformulation redonne la chaîne `q → r → s`, sans orphelin.
   - **If we skip it:** Le chemin de suppression régresse sans bruit.

10. **Code mort et doublons dans le core** (`src/graph/create-flow-node.ts:18-21,90-104`, `src/types/app-node.ts:42-46`, `src/hooks/useWorkflowNodes.ts:148-151`) — NOUVEAU
    - **What this is:** Plusieurs aides restent de l'ancien builder. Elles ont été vérifiées par grep sur tout le monorepo, front et tests compris.
    - **Problem:** `createSettingPlaceholders` fait la même chose que `withAutoSettings` sur un seul node, et ses options `startIndex`/`totalCount` ne servent jamais. `CreateFlowNode` n'a qu'un appelant, et c'est lui qui pose le `deletable: true` du point 2. `ParamProps` n'est utilisé nulle part. `onDragOver` met un curseur « déplacer » alors qu'aucun `onDrop` n'existe dans le package ni dans le builder.
    - **Fix:** Dans `insertChainNode`, remplacer les deux par `makeFlowNode(uuidv4(), …)` + `withAutoSettings([node], [], undefined, layout, registry)`. Supprimer `CreateFlowNode`, `createSettingPlaceholders`, `ParamProps` et `onDragOver` (2 lignes à retirer côté front, dans `pages/Agents/Workflow/index.tsx:60,122`).
    - **If we skip it:** Environ 30 lignes à lire et maintenir, dont une qui a déjà causé un bug.

11. **Dépendances déclarées de travers** (`packages/workflow/package.json:37-41,44-46`, `package-lock.json`, `yarn.lock`) — W-05 toujours ouvert, plus un point NOUVEAU sur Emotion
    - **What this is:** Le package se veut externe : le core ne dépend que de `uuid`, et l'UI attend Chakra et ses dépendances en « peer » (fournies par l'app).
    - **Problem:** `@emotion/react` et `@emotion/styled` sont en `dependencies` alors qu'aucun fichier de `src/` ne les importe. Un consommateur externe peut alors recevoir une deuxième copie d'Emotion, ce qui casse le thème Chakra (deux contextes différents) ; l'app ne s'en sort que grâce aux alias de `craco.config.js`. La peer `lucide-react ^0.500.0` veut dire `<0.501` en 0.x : la propre devDependency du package (0.556) et l'app (0.542) ne la respectent pas. Les lockfiles locaux sont toujours là et ne servent pas (le package est un workspace de la racine).
    - **Fix:** Retirer les deux `@emotion/*` (Chakra les demande déjà en peer), passer la peer lucide à `>=0.500.0`, et supprimer `package-lock.json` et `yarn.lock` du package.
    - **If we skip it:** Avertissements à chaque install, et risque de thème cassé chez un consommateur hors monorepo.

## Nice to have

12. **`useAppResponsive` recopie ce que Chakra fait déjà** (`src/hooks/useAppResponsive.ts:1-63`, utilisé une fois dans `NodeComponent.tsx:22`) — NOUVEAU
    - **What this is:** Un hook de 63 lignes qui lit la largeur de la fenêtre pour savoir si on est sur mobile.
    - **Problem:** Chaque node pose son propre écouteur `resize`, avec des seuils écrits en dur qui ne suivent pas le thème. Chakra, déjà en peer, fournit `useBreakpointValue({ base: true, lg: false })`.
    - **Fix:** Utiliser `useBreakpointValue` dans `NodeComponent` et supprimer le fichier.
    - **If we skip it:** 63 lignes de plus, et des seuils qui peuvent diverger du thème.

13. **Ids des poignées écrits en dur malgré la règle** (`src/components/nodes/NodeComponent.tsx:152,226,279`, `SettingNodes/ModelNode.tsx:181`, `InstructionNode.tsx:349`, `DatasetNode.tsx:39`) — NOUVEAU
    - **What this is:** `HandleId` et `settingSourceHandle` existent justement pour que le graphe et le dessin utilisent les mêmes noms. La doc dit « ne jamais écrire ces chaînes en dur ».
    - **Problem:** Six poignées écrivent encore `"main-source"`, `"setting-target"` ou `` `setting-source-${…}` `` à la main (seul `AllDatasetsNode` utilise `HandleId`). Si on renomme une constante, tous les edges disparaissent du dessin et aucun test ne le voit.
    - **Fix:** Remplacer par `HandleId.MainTarget`, `HandleId.MainSource`, `settingSourceHandle(input.name)` et `HandleId.SettingTarget`.
    - **If we skip it:** Un renommage futur casse l'affichage sans erreur.

14. **Couleurs encore en `useColorModeValue` au lieu des tokens du thème** (`NodeComponent.tsx:24-34`, `ModelNode.tsx`, `InstructionNode.tsx`, `DatasetNode.tsx` : 64 appels) — W-07, toujours ouvert
    - **What this is:** La règle du package est d'utiliser les tokens sémantiques de `colorTokens.ts`. `AllDatasetsNode` le fait déjà.
    - **Problem:** Les quatre autres nodes recopient chacun leurs paires clair/sombre. Si on change une teinte de token, ces nodes ne suivent pas, et le site vitrine (aligné sur les tokens) dérive de l'app.
    - **Fix:** Passer ces nodes sur les tokens déjà listés dans le README § Thème (`surfaceAction`, `borderAccentCard`, `textPrimary`…), un fichier à la fois.
    - **If we skip it:** Le design reste incohérent entre les nodes.

Plus petits, laissés de côté (3) : le README dit que l'aller-retour est « identique », mais les `name` des blocks sont réécrits (`generator` devient `answer`) ; `WorkflowPreview` recrée un `HorizontalLayoutStrategy` à chaque rendu ; `insertChainNode` n'est pas exporté par le core alors que la doc le présente comme tel.

**Verdict:** à corriger d'abord : 1 (le modèle de reformulation n'arrive jamais au moteur), puis 2 (`deleteKeyCode={null}`, deux lignes) et 3 (réparer les workflows déjà abîmés). Le reste du package est sain : core sans React vérifié, aller-retour correct pour les 5 types de blocks avec ou sans bases, le node « Toutes les bases » n'est jamais sauvegardé, ancien format du Retriever (sans `inputs`) et définition démo d'onboarding (anciens noms d'inputs) bien réparés, mode lecture seule sans action d'édition.

**Lean:** -110 lignes de code environ (et 2 lockfiles), -2 dépendances possibles.

**Not checked:** le rendu réel dans un navigateur (le comportement du clavier est déduit du code de ReactFlow 12.10.2 et prouvé avec son `getElementsToRemove`, pas cliqué) ; la liste réelle des modèles servis par `/rag/models` et `/rag/models/rerank` (moteur non lancé) ; l'existence en base de définitions anciennes au format tableau (point 4) ; le détail des panneaux du front sous `components/Agents/Workflow/NodeModalContent/` au-delà de `panels.tsx` ; `rag-engine/` hors `BLOCKS_FORMAT.md` et le schéma Pydantic lu pour confirmer le point 1 ; `RAG-GenRag/` (absent du checkout).
