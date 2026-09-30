# CLAUDE.md — `packages/workflow/` (`@genrag/workflow`)

Builder de workflow RAG (ReactFlow + Chakra UI), partagé sous forme de package. Vue d'ensemble du monorepo : `../../CLAUDE.md`.

## Rôle et consommateurs

- Exporte le canvas ReactFlow, les nodes/edges, le registre des tâches, les hooks d'état, les layouts et la sérialisation.
- **Seul consommateur actif : `plateform_front`** (`"@genrag/workflow": "file:../packages/workflow"`, workspace yarn racine).
- `vitrine_front` ne l'utilise plus : le site Vite redessine sa propre maquette (`vitrine_front/src/mockups/`). L'ancienne intégration Next.js (`WorkflowPackagePreview`) est dans `vitrine_front/_archive/`, ne pas s'en inspirer.
- Le package est autonome : **ne jamais importer depuis `plateform_front` ou `vitrine_front`**.

## Commandes (depuis `packages/workflow/`)

```bash
yarn build       # tsc -> dist/ (main: dist/index.js, types: dist/index.d.ts)
yarn typecheck
```

`plateform_front` consomme `dist/` : **rebuild le package après toute modification** avant de tester dans l'app.

Peer dependencies : `react`/`react-dom` 19, `@chakra-ui/react` 2, `@xyflow/react` 12, `framer-motion` 12, `lucide-react`. Le consommateur doit fournir un `ChakraProvider` avec les palettes `grey` et `green` du thème GenRAG, sinon les nodes retombent sur les couleurs Chakra par défaut.

## Structure (`src/`)

| Dossier | Contenu |
|---|---|
| `components/` | `WorkflowCanvas.tsx` (canvas composable, read-only ou non), `nodes/` (`NodeComponent`, `NodeCard`, `NodeHeader`, `NodeInputs`, `NodeOutputs`, `NodeShape`, `Common.tsx`, `SettingNodes/ModelNode.tsx`, `SettingNodes/InstructionNode.tsx`), `edges/` (`GenEdge`, `SettingsEdge`) |
| `graph/` | `task/registry.tsx` + une définition par tâche (`add-query`, `add-rewriter`, `add-database`, `add-reranking`, `add-response`, `add-model`, `add-instruction`), `create-flow-node.ts` (`makeFlowNode`, `linkNodes`, `withAutoSettings`), `task-utils.ts` |
| `hooks/` | `useWorkflowNodes` (état central), `useWorkflowCanvas` (composition pour `<ReactFlow>`), `useFlowTypes`, `useNodeSelection`, `useNodeInformation`, `useFixNodePosition`, `useCenterNodePosition`, `useAppResponsive` (réimplémenté sans dépendre de l'app) |
| `layout/` | `LayoutStrategy` : `vertical.ts` (défaut, gap 140px), `horizontal.ts` (gap 280px), `dagre.ts` (optionnel, fallback vertical) |
| `utils/` | `serialize.ts` (`serializeWorkflow`), `sanitize.ts` (`sanitizeWorkflowEdges`) |
| `types/` | `app-node.ts`, `edge.ts`, `task.ts`, `model-option.ts` |

Points d'entrée : `index.ts` et les barrels `components.ts`, `edges.ts`, `graph.ts`, `hooks.ts`, `nodes.ts`, `types.ts`.

## Modèle

- `TaskType` : `QUERY` (entrée), `REWRITER` (optionnel, supprimable), `RETRIEVER`, `RERANKER` (optionnel, supprimable), `RESPONSE` (sortie), et deux types de réglages : `MODEL`, `INSTRUCTION`.
- `AppNodeData` : `type`, `inputs`, `outputs` + champs dynamiques (`isPlaceholder`, `modelName`, `stringValue`, `settingLabel`, `parentNodeId`, `configItems`…).
- `chainOutputs` d'une tâche = nodes optionnels qu'elle peut chaîner (QUERY → REWRITER, RETRIEVER → RERANKER). C'est ce que filtre le menu d'ajout (`getAddableTaskTypes`).

### Edges et handles

| Edge | Type ReactFlow | Rôle |
|---|---|---|
| `GenEdge` | `default` | Chaîne principale (animé) |
| `SettingsEdge` | `settings` | Node principal → MODEL / INSTRUCTION (pointillés) |

Handles : `main-source` / `main-target` (chaîne), `setting-source-{inputName}` (sortie vers un réglage), `setting-target` (entrée d'un node de réglage).

## Hooks et utilitaires clés

- `useWorkflowNodes({ initialNodes, initialEdges, registry, readonly, layout })` → `nodes`, `edges`, `onNodesChange`, `onEdgesChange`, `handleSettingSelect`, `handleAddChainNode`, `handleRemoveChainNode`, `registry`, `isVertical`.
- `handleAddChainNode(type)` trouve le parent qui déclare ce type dans ses `chainOutputs`, insère le node + ses placeholders de réglages, reroute les edges et repositionne via le layout.
- `handleRemoveChainNode(id)` supprime le node, ses nodes de réglages, et reconnecte le précédent au suivant. **Ne jamais supprimer un node chaîné autrement.**
- `serializeWorkflow(nodes, edges)` → `{ nodes, edges, blocks }`. `blocks` parcourt la chaîne `main-source → main-target` (QUERY → REWRITER? → RETRIEVER → RERANKER? → RESPONSE) et lit MODEL / INSTRUCTION via les edges `settings`. C'est ce que l'API RAG reçoit.
- `sanitizeWorkflowEdges(nodes, edges)` répare les `sourceHandle` de settings-edges devenus stales (renommage d'input) et retire les nodes orphelins. **À appeler sur tout workflow chargé depuis la DB avant de l'injecter dans ReactFlow.**
- `makeFlowNode`, `linkNodes`, `withAutoSettings(nodes, edges, settingValues?)` : construisent des presets (utilisés par `CreateAgentModal` et `WorkflowPreview` côté app).

## Règles

- Tout changement de `TaskType`, `Task`, du registre ou d'un nom d'input impacte `serializeWorkflow`, les workflows déjà en base (d'où `sanitizeWorkflowEdges`) et le format `blocks` attendu par `rag-engine` (`rag-engine/BLOCKS_FORMAT.md`). Vérifier les trois.
- Un MODEL / INSTRUCTION avec `isPlaceholder: true` est ignoré par `serializeWorkflow` : le pipeline peut être incomplet si l'utilisateur sauvegarde sans configurer (l'app met ces nodes en évidence et avertit avant la sauvegarde : `hooks/useIncompleteNodesGuard.tsx`).
- Les listes `LLMS`, `LLMSRewriter`, `ReRanker` de `components/nodes/Common.tsx` sont statiques. L'app charge aussi les modèles réels via `services/models/models.ts` : ne pas diverger sans raison.
- Styles via les props Chakra et `useColorModeValue`, pas de CSS custom (le package n'a pas accès aux semantic tokens de l'app).
- Aucun test dans le package pour l'instant.
