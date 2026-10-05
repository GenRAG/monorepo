# CLAUDE.md — `packages/workflow/` (`@genrag/workflow`)

Modèle et builder visuel des workflows RAG (ReactFlow + Chakra UI), partagé sous forme de package. Usage public et exemples : `README.md`. Vue d'ensemble du monorepo : `../../CLAUDE.md`.

## Rôle et consommateurs

- **Seul consommateur actif : `plateform_front`** (workspace yarn racine). Il compile `src/` directement (alias craco `@genrag/workflow` → `src/index.ts` et `paths` tsconfig) : pas de rebuild en dev. `dist/` sert aux consommateurs externes et au build Vercel.
- `vitrine_front` ne l'utilise plus (maquette propre dans `vitrine_front/src/mockups/`, ancienne intégration dans `_archive/`).
- Le package est autonome : **ne jamais importer depuis `plateform_front` ou `vitrine_front`**. Il dépend seulement du thème GenRAG côté Chakra (voir README § Thème).

## Commandes (depuis `packages/workflow/`)

```bash
yarn build       # tsc -> dist/ + scripts/copy-assets.js (CSS)
yarn typecheck
yarn test        # tsc -p tsconfig.test.json + node --test (test/*.test.ts)
```

## Deux couches

| Entrée | Fichier | Contenu |
|---|---|---|
| `@genrag/workflow/core` | `src/core.ts` | Sans React à l'exécution : `types/`, `graph/` (hors `graph/task/registry.tsx`), `layout/`, `utils/`. **`test/core-boundary.test.ts` échoue si React, Chakra, ReactFlow, lucide, framer-motion ou un CSS devient atteignable depuis le core** : ne pas importer de composant, hook ou icône dans ces dossiers (les `import type` sont permis). |
| `@genrag/workflow` | `src/index.ts` | Le core + `components/`, `hooks/`, `graph/task/registry.tsx` (dessin des tâches). |

## Structure (`src/`)

| Dossier | Contenu |
|---|---|
| `types/` | `task.ts` (`TaskType`, `TaskSpec` = données d'une tâche, `Task` = spec + `icon` / `component`), `app-node.ts` (`AppNode`, `AppNodeData`, `WorkflowNodeProps`), `edge.ts` (`EdgeType`, `HandleId`, `settingSourceHandle`), `pipeline.ts` (blocks du moteur, `WorkflowDefinition`), `model-option.ts` |
| `graph/` | `task-specs.ts` (`TASK_SPECS` : les 7 tâches), `models.ts` (catalogues `LLMS`, `LLMSRewriter`, `ReRanker`), `task-utils.ts`, `create-flow-node.ts` (`makeFlowNode`, `linkNodes`, `withAutoSettings`…), `task/registry.tsx` (UI : icônes, `TaskRegistry`, `createTaskRegistry`, `getTaskDef`, contexte `TaskRegistryProvider` / `useTaskRegistry`) |
| `layout/` | `LayoutStrategy` ; `LinearLayoutStrategy` configurable, `VerticalLayoutStrategy` (défaut du builder, réglages à droite) et `HorizontalLayoutStrategy` (réglages empilés sous chaque node) |
| `utils/` | `serialize.ts` (graphe → blocks), `pipeline-to-workflow.ts` (blocks → graphe), `sanitize.ts` |
| `components/` | `WorkflowCanvas` (canvas composable), `WorkflowViewer` (lecture seule depuis `pipeline` ou `definition`), `nodes/` (`NodeComponent`, `SettingNodes/ModelNode`, `SettingNodes/InstructionNode`), `edges/` (`GenEdge`, `SettingsEdge` + `edge-animations.css`), `BoxIcon` (interne) |
| `hooks/` | `useWorkflowNodes` (état central), `useWorkflowCanvas` (composition pour `<ReactFlow>`), `useFlowTypes`, `useNodeSelection`, `useNodeInformation`, `useFixNodePosition`, `useAppResponsive` (interne) |

## Modèle

- `TaskType` : `QUERY` (entrée), `REWRITER` (optionnel, supprimable), `RETRIEVER`, `RERANKER` (optionnel, supprimable), `RESPONSE` (sortie), et deux types de réglages : `MODEL`, `INSTRUCTION`.
- `chainOutputs` d'une tâche = nodes optionnels qu'elle peut chaîner (QUERY → REWRITER, RETRIEVER → RERANKER), filtrés par `getAddableTaskTypes` pour le menu d'ajout.
- Registre injectable : les utilitaires du core prennent un registre en dernier argument (défaut `TASK_SPECS`) ; `WorkflowCanvas` / `useWorkflowCanvas` acceptent `registry` (défaut `TaskRegistry`) et les nodes le lisent par contexte (un `<ReactFlow>` sans `WorkflowCanvas`, comme la page builder de l'app, utilise le registre par défaut).

### Edges et handles (`types/edge.ts`)

| Edge | Type ReactFlow | Rôle |
|---|---|---|
| `GenEdge` | `default` (`EdgeType.Main`) | Chaîne principale (animée) |
| `SettingsEdge` | `settings` (`EdgeType.Settings`) | Node principal → MODEL / INSTRUCTION (pointillés) |

Handles : `HandleId.MainSource` / `MainTarget` (chaîne), `settingSourceHandle(inputName)` = `setting-source-{inputName}`, `HandleId.SettingTarget`. Ne jamais écrire ces chaînes en dur.

## Utilitaires clés

- `useWorkflowNodes({ initialNodes, initialEdges, registry, readonly, layout })` → `nodes`, `edges`, `onNodesChange`, `onEdgesChange`, `handleSettingSelect`, `handleAddChainNode`, `handleRemoveChainNode`, `isVertical` (celui du layout), `readonly`.
- `handleRemoveChainNode(id)` supprime le node, ses réglages et reconnecte le précédent au suivant. **Ne jamais supprimer un node chaîné autrement** (les nodes de chaîne sont `deletable: false` pour que ReactFlow ne les supprime pas au clavier).
- `serializeWorkflow(nodes, edges)` → `{ nodes, edges, blocks }` : parcourt la chaîne depuis QUERY et lit MODEL / INSTRUCTION via les edges `settings`. C'est ce que l'API RAG reçoit.
- `pipelineToWorkflow(blocks, { layout, registry })` : inverse de `serializeWorkflow` (aller-retour testé) ; lève `UnsupportedPipelineBlockError` sur un type inconnu.
- `sanitizeWorkflowEdges(nodes, edges)` répare les handles de réglages devenus stales (renommage d'input) et retire les nodes orphelins. **À appeler sur tout workflow chargé depuis la DB avant de l'injecter dans ReactFlow.**
- En `readonly`, les nodes reçoivent `readonly: true` et pas de `onRemoveNode` : un node custom doit masquer toute action d'édition dans ce cas.

## Règles

- Tout changement de `TaskType`, de `TASK_SPECS` ou d'un nom d'input impacte `serializeWorkflow`, `pipelineToWorkflow`, les workflows déjà en base (d'où `sanitizeWorkflowEdges`) et le format `blocks` attendu par le moteur (`types/pipeline.ts`, `plateform_back/src/rag-engine/pipeline.schema.ts`, `rag-engine/BLOCKS_FORMAT.md`). Vérifier tous.
- Un réglage MODEL resté placeholder n'est **pas** ignoré par `serializeWorkflow` : il est remplacé par un modèle par défaut (`gpt-4o` pour reformulation / réponse, `bge` pour le classement). L'app avertit avant la sauvegarde (`plateform_front/src/hooks/useIncompleteNodesGuard.tsx`). Changer ce comportement touche le contrat avec le moteur.
- Les catalogues de `graph/models.ts` sont statiques. L'app charge aussi les modèles réels via `services/models/models.ts` ; un consommateur peut les injecter par le registre.
- Styles via les props Chakra et `useColorModeValue`, pas de CSS custom (seule exception : l'animation des settings edges, copiée dans `dist/` au build).
- Toute logique du core est accompagnée d'un test dans `test/` (lancés par `yarn test`, pas encore dans la CI).
