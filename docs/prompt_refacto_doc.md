Tu travailles sur le monorepo GenRAG. Je veux migrer le système de documents 
de l'architecture actuelle (Document lié à un Agent) vers un système de 
Knowledge Datasets réutilisables entre agents, au niveau Workspace.

---

## CONTEXTE ACTUEL

### Modèle de données actuel
- `Document` appartient à un `Agent` via `agentId`
- `Agent` appartient à un `Workspace`
- Les documents sont indexés dans le RAG engine avec un `document_id`
- Le pipeline RETRIEVER utilise un `collection_name` statique ("genrag_knowledge_base")
- Upload : S3 (storageKey) + BullMQ (queue "documents") + statuts UPLOADED/PROCESSING/INDEXED/FAILED

### Stack
- Backend : NestJS + Prisma + PostgreSQL + BullMQ/Redis + AWS S3
- Frontend : React + Vite + Chakra UI v2 + RTK Query
- Prisma schema splitté dans `plateform_back/prisma/schema/`
- Migrations dans `plateform_back/prisma/migrations/`
- API RAG externe : POST /rag/index (indexation) et POST /rag/stream (query)
  - Le bloc RETRIEVER du pipeline envoie `collection_name` et `top_k`

---

## OBJECTIF

Implémenter un système de **Knowledge Datasets** (similare a dify.ai avec leur page https://cloud.dify.ai/datasets):

1. Un `Dataset` appartient à un `Workspace` (pas à un Agent)
2. Un `Dataset` contient des `Document`s
3. Un `Agent` peut utiliser plusieurs `Dataset`s via une table de liaison `AgentDataset`
4. Dans le workflow builder, le node RETRIEVER permet de sélectionner quel(s) dataset(s) utiliser
5. Chaque dataset a son propre `collectionName` dans le vector store (format: `dataset_{id}`)
6. La mécanique S3 + BullMQ reste identique, seule la relation change

---

## TRAVAIL À EFFECTUER

### 1. PRISMA SCHEMA

Créer le fichier `plateform_back/prisma/schema/dataset.prisma` :

```prisma
model Dataset {
  id             String          @id @default(cuid())
  name           String
  description    String?
  collectionName String          @unique
  workspaceId    String
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  workspace      Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  documents      Document[]
  agents         AgentDataset[]
}

model AgentDataset {
  agentId   String
  datasetId String
  agent     Agent   @relation(fields: [agentId], references: [id], onDelete: Cascade)
  dataset   Dataset @relation(fields: [datasetId], references: [id], onDelete: Cascade)

  @@id([agentId, datasetId])
}
```

Modifier `plateform_back/prisma/schema/document.prisma` :
- Remplacer `agentId String` par `datasetId String`
- Mettre à jour la relation vers `Dataset` au lieu de `Agent`
- Garder tous les autres champs identiques (name, size, storageKey, mimeType, status, indexedAt, failedAt, indexError, retryCount)

Modifier `plateform_back/prisma/schema/agent.prisma` :
- Supprimer la relation `documents Document[]`
- Ajouter la relation `datasets AgentDataset[]`

Modifier `plateform_back/prisma/schema/workspace.prisma` :
- Ajouter la relation `datasets Dataset[]`

Générer la migration Prisma avec le nom `add_dataset_model`.

### 2. BACKEND — MODULE DATASET

Créer le module `plateform_back/src/dataset/` avec la structure suivante :

**dataset.repository.ts** : CRUD sur Dataset (findOne, findAll par workspaceId, create, update, delete) + méthodes pour gérer les liaisons AgentDataset (addAgentToDataset, removeAgentFromDataset, findDatasetsByAgent)

**dataset.service.ts** :
- `create(workspaceId, dto)` → génère automatiquement le `collectionName` = `dataset_${cuid()}` (ou utiliser l'id après création)
- `findAll(workspaceId)`
- `findOne(id, workspaceId)`
- `delete(id, workspaceId)`
- `attachToAgent(datasetId, agentId)` / `detachFromAgent(datasetId, agentId)`

**dataset.controller.ts** :
- Route de base : `workspaces/:workspaceId/datasets`
- `POST /` → créer un dataset (ADMIN, EDITOR)
- `GET /` → lister les datasets du workspace
- `GET /:id` → détail d'un dataset
- `DELETE /:id` → supprimer (ADMIN)
- `POST /:id/agents/:agentId` → attacher un dataset à un agent (ADMIN, EDITOR)
- `DELETE /:id/agents/:agentId` → détacher (ADMIN, EDITOR)
- Guards : `JwtAuthGuard` + `WorkspaceRolesGuard`

**dataset.module.ts** : exporter `DatasetService`

Enregistrer `DatasetModule` dans `app.module.ts`.

### 3. BACKEND — MIGRATION DU MODULE DOCUMENT

Modifier `plateform_back/src/document/` :

**document.controller.ts** :
- Changer la route de `workspaces/:workspaceId/agents/:agentId/documents` vers `workspaces/:workspaceId/datasets/:datasetId/documents`
- Garder exactement les mêmes endpoints (POST upload, GET stats, GET liste paginée, GET :id, GET :id/url, DELETE :id)

**document.service.ts** :
- Remplacer `agentId` par `datasetId` dans toutes les méthodes
- La logique S3 et BullMQ reste identique
- Le `storageKey` S3 devient `datasets/${datasetId}/${Date.now()}-${filename}`

**document.repository.ts** :
- Remplacer `agentId` par `datasetId` dans toutes les requêtes Prisma

**handlers/index-document.handler.ts** :
- Remplacer `agentId` par `datasetId` dans la commande et les events

**commands/index-document.command.ts** :
- Remplacer `agentId` par `datasetId`

**events** : mettre à jour `DocumentIndexedEvent` et `DocumentFailedEvent` pour utiliser `datasetId` au lieu de `agentId`

### 4. BACKEND — MIGRATION DU RUNTIME

Modifier `plateform_back/src/agent-runtime/agent-runtime.builder.ts` :

La méthode `buildPipeline` doit :
1. Récupérer les datasets liés à l'agent via `AgentDataset`
2. Pour chaque dataset, injecter son `collectionName` dans le bloc RETRIEVER correspondant du pipeline
3. Si l'agent a plusieurs datasets, créer plusieurs blocs RETRIEVER dans le pipeline (un par dataset)
4. Conserver la compatibilité avec les anciens workflows (fallback sur `def.blocks ?? def`)

Le format du pipeline pour plusieurs datasets :
```json
{
  "blocks": [
    { "name": "query", "type": "query" },
    { "name": "retrieve_0", "type": "retrieve", "collection_name": "dataset_xxx", "top_k": 5 },
    { "name": "retrieve_1", "type": "retrieve", "collection_name": "dataset_yyy", "top_k": 5 },
    { "name": "answer", "type": "answer", "model": "gpt-4o", "system_prompt": "..." }
  ]
}
```

### 5. BACKEND — TESTS

Mettre à jour `plateform_back/src/document/` tests si existants.
Créer `plateform_back/src/dataset/test/dataset.service.spec.ts` avec les cas :
- Création d'un dataset avec génération automatique du collectionName
- findAll retourne uniquement les datasets du workspace
- delete throw NotFoundException si non trouvé
- attachToAgent / detachFromAgent

### 6. FRONTEND — SERVICES RTK QUERY

Créer `plateform_front/src/services/dataset/dataset.ts` avec les endpoints :
- `getWorkspaceDatasets` (GET /workspaces/:workspaceId/datasets)
- `getDatasetById` (GET /workspaces/:workspaceId/datasets/:id)
- `createDataset` (POST /workspaces/:workspaceId/datasets)
- `deleteDataset` (DELETE /workspaces/:workspaceId/datasets/:id)
- `attachDatasetToAgent` (POST /workspaces/:workspaceId/datasets/:id/agents/:agentId)
- `detachDatasetFromAgent` (DELETE /workspaces/:workspaceId/datasets/:id/agents/:agentId)

Modifier `plateform_front/src/services/document/document.ts` :
- Remplacer `agentId` par `datasetId` dans tous les endpoints
- Changer les routes pour correspondre au nouveau controller backend

### 7. FRONTEND — TYPES

Créer `plateform_front/src/types/dataset/dataset.ts` :
```typescript
export interface DatasetEntity {
  id: string;
  name: string;
  description?: string;
  collectionName: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  documents?: DocumentEntity[];
}

export interface AgentDatasetLink {
  agentId: string;
  datasetId: string;
}
```

### 8. FRONTEND — PAGES

**Nouvelle page Dataset Library** : `plateform_front/src/pages/Datasets/`

Créer une page `DatasetLibrary` accessible via la route `/workspaces/:workspaceId/datasets` dans le layout `PrivateAppLayout` (sidebar principale). Cette page affiche :
- La liste des datasets du workspace sous forme de cards (nom, description, nombre de documents, badge nombre d'agents qui l'utilisent)
- Un bouton "Créer un dataset" ouvrant une modal simple (nom + description)
- En cliquant sur un dataset, navigation vers `/workspaces/:workspaceId/datasets/:datasetId/documents`

**Page Documents d'un Dataset** : `plateform_front/src/pages/Datasets/DatasetDocuments/`

C'est essentiellement le même composant que l'actuel `DocumentWorkspace` mais :
- Route : `/workspaces/:workspaceId/datasets/:datasetId/documents`
- Utilise `datasetId` au lieu de `agentId`
- Affiche en header le nom du dataset et les agents qui l'utilisent

**Modifier la page Agent Settings** (ou créer un onglet dans les settings de l'agent) :
- Route : `/workspaces/:workspaceId/agents/:agentId/datasets`
- Afficher les datasets actuellement liés à cet agent
- Permettre d'attacher/détacher des datasets depuis la liste des datasets du workspace
- Utiliser les mutations `attachDatasetToAgent` / `detachDatasetFromAgent`

**Retirer la page Documents de l'agent** :
- Supprimer ou rediriger `/workspaces/:workspaceId/agents/:agentId/documents` vers la nouvelle architecture
- Mettre à jour `PrivateAgentAppLayout` pour remplacer le lien "Documents" par "Datasets"

### 9. FRONTEND — WORKFLOW BUILDER

Modifier le node RETRIEVER dans `@genrag/workflow` ou dans `plateform_front` :

Dans `packages/workflow/src/graph/task/add-database.tsx` (le node RETRIEVER), le settings node MODEL doit être remplacé ou complété par un settings node "Dataset" qui permet de sélectionner un dataset.

La sérialisation dans `serializeWorkflow` doit injecter le `collectionName` du dataset sélectionné dans le bloc RETRIEVER des blocks.

Si la modification du package est complexe, une alternative acceptable est de gérer la sélection de dataset directement dans la modal de node dans `plateform_front` (dans `NodeModal.tsx`) et de le stocker dans `AppNodeData.inputs["collectionName"]`.

### 10. ROUTING

Mettre à jour `plateform_front/src/App.tsx` (ou le fichier de routing principal) :
- Ajouter `/workspaces/:workspaceId/datasets` → `DatasetLibrary`
- Ajouter `/workspaces/:workspaceId/datasets/:datasetId/documents` → `DatasetDocuments`
- Ajouter `/workspaces/:workspaceId/agents/:agentId/datasets` → `AgentDatasets`

Mettre à jour la sidebar `PrivateAppLayout` pour ajouter un lien "Datasets" au niveau workspace.

---

## CONTRAINTES IMPORTANTES

1. **Ne pas casser le système de crédits** : `UsageTrackerService` ne dépend pas directement des documents/agents, ça ne change pas.

2. **Garder la compatibilité du runtime** : les anciens workflows sans dataset lié doivent continuer à fonctionner (fallback sur `collection_name: "genrag_knowledge_base"`).

3. **Respecter les conventions existantes** :
   - Architecture NestJS : Controller → Service → Repository → Prisma
   - Pas de logique métier dans les controllers
   - Guards : `JwtAuthGuard` + `WorkspaceRolesGuard` sur toutes les routes privées
   - Frontend : jamais d'appel API direct dans les composants, toujours via RTK Query
   - Chakra UI : `useColorModeValue` pour le dark mode, tokens `grey.X` et `green.X`

4. **Générer les migrations Prisma** avec `npx prisma migrate dev --name add_dataset_model` dans `plateform_back/`.

5. **Exporter `DatasetService`** depuis `DatasetModule` car il sera utilisé par `AgentRuntimeModule`.

Commence par le schema Prisma et la migration, puis le backend (dataset module → document module → runtime), puis le frontend. À chaque étape, dis-moi ce que tu fais avant de coder.