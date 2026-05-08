import PrivateAgentAppLayout from "app/PrivateAgentAppLayout";
import WorkspaceGuard from "app/WorkspaceGuard";
import AccessControlWorkspace from "pages/Agents/AccessControl";
import ChatWorkspace from "pages/Agents/Chat";
import DeploymentWorkspace from "pages/Agents/Deployment";
import { DocumentWorkspace } from "pages/Agents/Documents";
import SettingsWorkspace from "pages/Agents/Settings";
import WorkflowWorkspace from "pages/Agents/Workflow";
import { Navigate, Route } from "react-router-dom";

export const AgentRoutes = () => (
    <Route element={<PrivateAgentAppLayout />}>
        <Route element={<WorkspaceGuard />}>
            <Route
                path="/workspaces/:workspaceId/agents/:agentId"
                element={<Navigate to="playground" replace />}
            />
            <Route
                path="/workspaces/:workspaceId/agents/:agentId/playground"
                element={<ChatWorkspace />}
            />
            <Route
                path="/workspaces/:workspaceId/agents/:agentId/documents"
                element={<DocumentWorkspace />}
            />
            <Route
                path="/workspaces/:workspaceId/agents/:agentId/workflow"
                element={<WorkflowWorkspace />}
            />
            <Route
                path="/workspaces/:workspaceId/agents/:agentId/deploy"
                element={<DeploymentWorkspace />}
            />
            <Route
                path="/workspaces/:workspaceId/agents/:agentId/access-control"
                element={<AccessControlWorkspace />}
            />
            <Route
                path="/workspaces/:workspaceId/agents/:agentId/settings"
                element={<SettingsWorkspace />}
            />
        </Route>
    </Route>
);
