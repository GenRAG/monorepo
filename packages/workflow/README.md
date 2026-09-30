# @genrag/workflow

Modèle et builder visuel des workflows RAG de GenRAG : la chaîne de tâches (question → reformulation ? → recherche → classement ? → réponse), leurs réglages (modèle IA, instructions), la conversion avec le pipeline envoyé au moteur RAG, et les composants ReactFlow pour les éditer ou les afficher.

Le package est consommé par `plateform_front`, mais il est conçu comme un package externe : il n'importe rien de l'app.

## Deux points d'entrée

| Import | Contenu | Dépendances à l'exécution |
|---|---|---|
| `@genrag/workflow/core` | Types, registre des tâches (`TASK_SPECS`), catalogues de modèles, construction de graphes, layouts, `serializeWorkflow`, `pipelineToWorkflow`, `sanitizeWorkflowEdges` | `uuid` uniquement (ni React, ni Chakra, ni ReactFlow ; vérifié par un test) |
| `@genrag/workflow` | Tout le core, plus le canvas (`WorkflowCanvas`, `WorkflowViewer`), les nodes, les edges, les hooks et le registre de dessin (`TaskRegistry`) | Peer dependencies ci-dessous |

Peer dependencies de l'entrée principale : `react` / `react-dom` 19, `@chakra-ui/react` 2 (et ses peers `@emotion/*`), `@xyflow/react` 12, `framer-motion` 12, `lucide-react`.

## Afficher un workflow à partir de sa config RAG

C'est le cas d'un dashboard admin qui ne connaît que le pipeline d'un agent (`definition.blocks`, le format envoyé au moteur) :

```tsx
import { Background } from "@xyflow/react";
import { HorizontalLayoutStrategy, WorkflowViewer, type PipelineBlock } from "@genrag/workflow";

const HORIZONTAL = new HorizontalLayoutStrategy();

export function AgentWorkflow({ blocks }: { blocks: PipelineBlock[] }) {
    return (
        <div style={{ height: 420 }}>
            <WorkflowViewer pipeline={blocks} layout={HORIZONTAL} fitView>
                <Background />
            </WorkflowViewer>
        </div>
    );
}
```

- `pipeline` : les blocks seuls. Chaque block devient un node, ses `model` / `system_prompt` deviennent des nodes de réglage. Un réglage absent reste un placeholder.
- `definition` : une définition complète sauvegardée par le builder (`{ nodes, edges, blocks }`). Son graphe est affiché tel quel (positions choisies par l'utilisateur, réparé par `sanitizeWorkflowEdges`). S'il n'a pas de nodes, ses `blocks` sont dessinés.
- Le viewer est en lecture seule : pas de suppression, pas d'édition. Un type de block inconnu lève `UnsupportedPipelineBlockError`, à intercepter avec un error boundary.

Sans React, la même conversion est disponible dans le core :

```ts
import { pipelineToWorkflow, serializeWorkflow } from "@genrag/workflow/core";

const { nodes, edges } = pipelineToWorkflow(blocks);             // config → graphe
const { blocks: sameBlocks } = serializeWorkflow(nodes, edges);  // graphe → config (aller-retour identique)
```

Seules limites de l'aller-retour : `collection_name` et `top_k` d'un block `retrieve` n'ont pas de node et reprennent leurs valeurs par défaut.

## Thème

Les nodes utilisent Chakra UI. Il faut un `ChakraProvider` avec le thème GenRAG (`plateform_front/src/themeNew`) : palettes `grey` (dont `grey.750`, `grey.850`, `grey.950`) et `green`, token sémantique `accentIconBg`, et variante de bouton `superPrimary` (bouton « Valider » des instructions, en édition seulement). Sans ce thème, le rendu retombe sur les couleurs Chakra par défaut.

## Éditer un workflow

```tsx
import { ReactFlow } from "@xyflow/react";
import { useWorkflowCanvas, sanitizeWorkflowEdges, serializeWorkflow } from "@genrag/workflow";

const { nodes: initialNodes, edges: initialEdges } = sanitizeWorkflowEdges(saved.nodes, saved.edges);
const { nodes, edges, nodeTypes, edgeTypes, onNodesChange, onEdgesChange, handleAddChainNode } =
    useWorkflowCanvas({ initialNodes, initialEdges, onNodeClick });
// <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} … />
// Sauvegarde : serializeWorkflow(nodes, edges) → { nodes, edges, blocks }
```

`WorkflowCanvas` fait la même chose en un composant, avec ses enfants (`Background`, `MiniMap`…) injectés dans le canvas.

## Personnaliser les tâches

`TASK_SPECS` décrit les tâches (libellés, chaînage, réglages, catalogues de modèles). `createTaskRegistry(specs, visuals)` ajoute les icônes et composants de nodes. Tous les utilitaires du core prennent un registre en dernier argument, et `WorkflowCanvas` / `useWorkflowCanvas` acceptent `registry`. Exemple pour exposer les modèles réellement servis par l'API :

```tsx
import { TASK_SPECS, TaskType, createTaskRegistry } from "@genrag/workflow";

const specs = {
    ...TASK_SPECS,
    [TaskType.RESPONSE]: {
        ...TASK_SPECS[TaskType.RESPONSE],
        inputs: TASK_SPECS[TaskType.RESPONSE].inputs.map((i) => (i.nodeType === TaskType.MODEL ? { ...i, items: apiModels } : i)),
    },
};
<WorkflowCanvas registry={createTaskRegistry(specs)} … />
```

Un nouveau **type** de tâche demande en plus : une valeur de `TaskType`, un type de block dans `types/pipeline.ts` et dans le schéma du back (`plateform_back/src/rag-engine/pipeline.schema.ts`), sa conversion dans `serializeWorkflow` et `pipelineToWorkflow`, et son support par le moteur RAG.

## Commandes

```bash
yarn build       # tsc -> dist/ + copie des CSS
yarn typecheck
yarn test        # tsc + node --test (aucune dépendance de test)
```
