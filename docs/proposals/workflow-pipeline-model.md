# Proposition : un modèle de pipeline typé comme source de vérité du builder

Statut : **prototype**, branche `audit/workflow-pipeline-model`. Le cœur est écrit et testé dans `packages/workflow/src/pipeline/`, mais le builder ne l'utilise pas encore : aucun changement de comportement.

## Constat

Le builder édite et sauvegarde un graphe ReactFlow (nodes, edges, handles). Pourtant, ce que l'utilisateur construit et ce que le moteur exécute, c'est une chaîne fixe : `query → [rewrite] → retrieve → [rerank] → answer`, avec les réglages de chaque étape. Le pipeline réel (`blocks`) n'est qu'un dérivé du graphe. D'où :

| Symptôme | Où |
|---|---|
| Deux vérités en base : l'UI recharge `nodes`/`edges`, le moteur lit `blocks` | `Workflow.definition` |
| Un réparateur de graphes chargés | `sanitizeWorkflowEdges` |
| Les réglages sont des nodes reliés par des edges dont le handle porte le **libellé français** de l'input (`setting-source-Modèle IA`) : renommer un texte casse des données | `types/edge.ts`, `TASK_SPECS` |
| Un sac de champs optionnels partagé par tous les nodes, et une table pour savoir où lire et écrire chaque réglage | `AppNodeData`, `SETTING_KINDS` |
| L'ordre de la chaîne est retrouvé en parcourant les edges | `serializeWorkflow` |
| Un nouveau type d'étape touche environ 7 endroits du package | `TaskType`, `TASK_SPECS`, registre, `BLOCK_FACTORIES`, `TASK_TYPE_BY_BLOCK`, `types/pipeline.ts`, `settingValuesOf` |

## Le modèle (dans le prototype)

```ts
interface Pipeline {
    version: 1;
    rewrite: { model: string | null } | null;           // étape optionnelle
    retrieve: { datasetIds: readonly string[] };        // aucune base = toutes les bases de l'agent
    rerank: { model: string | null } | null;            // étape optionnelle
    answer: { model: string | null; instruction: string | null };
}
```

Chaque étape apparaît au plus une fois, dans l'ordre, et les étapes obligatoires sont toujours là : **aucun état de ce type n'est une chaîne invalide**. Le `null` d'un réglage veut dire « pas encore choisi » (l'actuel placeholder).

| Fichier | Rôle |
|---|---|
| `pipeline/model.ts` | `Pipeline`, `emptyPipeline()`, `missingSettings()` (remplacera le parcours du graphe de `useIncompleteNodesGuard`) |
| `pipeline/commands.ts` | `applyCommand(pipeline, command)` : reducer pur (`addStep`, `removeStep`, `setModel`, `setInstruction`, `addDataset`, `removeDataset`). Une commande sans effet renvoie le même objet. Utilisable tel quel avec `useReducer`. |
| `pipeline/convert.ts` | `chainOf` (la chaîne, dont tout le reste dérive), `toBlocks` (vers le moteur), `fromBlocks` (depuis la base, refuse une chaîne invalide), `pipelineToGraph` (le graphe dessiné par les nodes actuels) |

Le dessin reste celui d'aujourd'hui : `pipelineToGraph` passe par `chainToWorkflow`, extrait de `pipelineToWorkflow` sans changement de comportement. Les blocks sont produits par la même fabrique que `serializeWorkflow` (`blockFor`), avec les mêmes modèles par défaut.

## Ce que le prototype prouve (`test/pipeline-model.test.ts`)

Le prototype ajoute 19 tests, ce qui porte le package à 71 tests au total.
- **Contrat moteur inchangé.** Pour un pipeline complet, minimal, vide (rien choisi) ou avec des étapes optionnelles sans modèle, `toBlocks(p)` est identique à `serializeWorkflow(pipelineToGraph(p)).blocks`.
- **Même graphe qu'aujourd'hui.** `pipelineToGraph(fromBlocks(b))` dessine le même graphe que `pipelineToWorkflow(b)` : mêmes nodes, positions, réglages, valeurs et liaisons.
- **Graphe sain par construction.** `sanitizeWorkflowEdges` ne change rien au graphe produit.
- **Aller-retour.** `toBlocks(fromBlocks(b))` redonne les blocks stockés, et `fromBlocks` refuse un type inconnu, une étape manquante, un doublon ou un mauvais ordre.
- **Les tests attrapent les erreurs.** J'ai essayé deux mutations volontaires de `convert.ts` (bases perdues, instruction perdue) : chacune fait échouer des tests.

## Plan de migration

Chaque étape se livre et se vérifie seule.

1. **Charger depuis les blocks.** La page builder construit le graphe avec `pipelineToGraph(fromBlocks(definition.blocks))` au lieu de `sanitizeWorkflowEdges(nodes, edges)`. Tous les workflows et snapshots de déploiement en base ont déjà leurs `blocks`.
2. **État du builder.** `useWorkflowNodes` devient un `useReducer(applyCommand)`, et le graphe est calculé par `useMemo(() => pipelineToGraph(p))`. Les actions des nodes envoient des commandes (le node d'un réglage connaît son étape par `parentNodeId`). Il faut au préalable donner aux nodes de réglage des ids stables (`answer:model` plutôt qu'un uuid), sinon ReactFlow les recrée à chaque édition.
3. **Sauvegarde.** `definition = { version, blocks: toBlocks(p) }`. L'avertissement « workflow incomplet » utilise `missingSettings(p)`. Le back accepte `nodes`/`edges` absents.
4. **Suppression.** On supprime :
   - `sanitizeWorkflowEdges` ;
   - le parcours d'edges de `serializeWorkflow` ;
   - `insertChainNode` et `SETTING_KINDS` ;
   - les champs morts d'`AppNodeData` ;
   - côté back, `nodes`/`edges` dans `Workflow.definition` et dans les snapshots (migration).
5. **Une définition par étape.** Une table unique (libellé, icône, champs de réglage avec des clés stables, `toBlock`/`fromBlock`) remplace `TASK_SPECS`, `BLOCK_FACTORIES` et `TASK_TYPE_BY_BLOCK`. Ajouter une étape devient : une entrée, plus le moteur.

## Décisions à prendre

- **Positions.** Les nodes sont aujourd'hui déplaçables et leurs positions sauvegardées. Avec un graphe calculé, le layout décide : un déplacement manuel est perdu au rechargement. À mon avis c'est mieux pour un outil no-code, mais c'est un choix produit.
- **Brouillons anciens.** `serializeWorkflow` remplace déjà un modèle non choisi par un défaut dans les `blocks`. Un workflow rechargé depuis ses blocks affichera donc ce modèle par défaut au lieu d'un placeholder. C'est ce que le moteur exécute déjà, donc l'affichage devient honnête.
- **Schéma.** L'étape 4 change `Workflow.definition` et les snapshots de déploiement (migration Prisma et rollback).
- **Feuille de route.** Ce modèle suppose une chaîne linéaire. Si des branches arrivent (routage, recherches en parallèle, conditions), il faudra un DAG de blocs à ports typés. Il serait lui aussi piloté par le modèle, mais ce serait un autre chantier.
