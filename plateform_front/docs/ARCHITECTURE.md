# Frontend Architecture: Workspaces & Agents

## Overview

The app currently follows a **workspace-first** model:

- **Workspace**: top-level container used for navigation and scoping.
- **Agent**: belongs to a workspace and owns:
  - its document collection
  - its RAG workflow
  - its deployment configuration
  - its playground

Legacy `/organisation/*` routes are still supported via redirects.

## Routing Structure

| Path | Description |
|------|-------------|
| `/workspaces` | Workspace list |
| `/workspaces/:workspaceId/agents` | Agent list for one workspace |
| `/workspaces/:workspaceId/agents/:agentId` | Redirects to playground |
| `/workspaces/:workspaceId/agents/:agentId/playground` | Agent chat / playground |
| `/workspaces/:workspaceId/agents/:agentId/documents` | Agent documents |
| `/workspaces/:workspaceId/agents/:agentId/workflow` | Agent workflow builder |
| `/workspaces/:workspaceId/agents/:agentId/deploy` | Agent deployment |
| `/workspaces/:workspaceId/agents/:agentId/settings` | Agent settings |
| `/organisation` | Redirect to `/workspaces` |
| `/organisation/agents` | Redirect to `/workspaces` |

## Folder Structure (current)

```text
src/
├── app/
│   ├── Router.tsx                     # Route definitions
│   ├── PrivateAppLayout.tsx           # Main shell + main sidebar
│   ├── PrivateAgentAppLayout.tsx      # Agent shell + agent sidebar
│   └── Navigation/
│       ├── MainSidebar/
│       ├── AgentSidebar/
│       └── sidebarConfig.ts
├── pages/
│   ├── Workspace/
│   │   ├── index.tsx                  # Workspace list
│   │   ├── Chat/                      # Used as agent playground
│   │   ├── Documents/
│   │   ├── Workflow/
│   │   └── Deployment/
│   ├── Organisation/
│   │   └── Agents/                    # Agent list page (workspace-scoped route)
│   ├── Dashboard/
│   └── Assistant/
├── types/
│   ├── agent.ts                       # AgentPreview, Agent
│   └── workspace.ts                   # WorkspacePreview
└── services/
    ├── agent/agent.ts                 # useGetWorkspaceAgentsQuery
    └── workspace/workspace.ts         # useGetUserWorkspacesQuery
```

## Component Hierarchy

1. **PrivateRoute → PrivateAppLayout**
   - `/dashboard`, `/assistants`, `/billing`, `/workspaces`, `/workspaces/:workspaceId/agents`

2. **PrivateRoute → PrivateAgentAppLayout**
   - `/workspaces/:workspaceId/agents/:agentId/*`
   - Pages: Playground, Documents, Workflow, Deploy, Settings

## State Management

- **Routing state**: `workspaceId` and `agentId` are taken from `useParams()`.
- **RTK Query**:
  - `useGetUserWorkspacesQuery()` for workspace listing
  - `useGetWorkspaceAgentsQuery(workspaceId)` for agent listing
- **Workflow state** remains local in workflow pages/components until backend persistence is wired.

## Backward Compatibility

- Legacy organisation paths are redirected:
  - `/organisation` → `/workspaces`
  - `/organisation/agents` → `/workspaces`
