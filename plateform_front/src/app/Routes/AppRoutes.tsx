import PrivateAppLayout from "app/PrivateAppLayout";
import WorkspaceGuard from "app/WorkspaceGuard";
import { AgentsList } from "pages/Agents";
import { Assistant } from "pages/Assistant/Assistant";
import { AssistantsList } from "pages/Assistant/AssistantList";
import { BillingWorkspace } from "pages/Billing";
import Dashboard from "pages/Dashboard";
import { ProfilePage } from "pages/Profile";
import { Route, useParams } from "react-router-dom";

const ChatRoute = () => {
    const { assistantId } = useParams<{ assistantId: string }>();
    return <Assistant key={assistantId} />;
};

export const AppRoutes = () => (
    <Route element={<PrivateAppLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/assistants" element={<AssistantsList />} />
        <Route path="/assistants/:assistantId" element={<ChatRoute />} />
        <Route path="/assistants/:assistantId/conversations/:conversationId" element={<ChatRoute />} />
        <Route path="/billing" element={<BillingWorkspace />} />

        <Route element={<WorkspaceGuard />}>
            <Route path="/workspaces/:workspaceId/dashboard" element={<Dashboard />} />
            <Route path="/workspaces/:workspaceId/assistants" element={<AssistantsList />} />
            <Route path="/workspaces/:workspaceId/assistants/:assistantId" element={<ChatRoute />} />
            <Route path="/workspaces/:workspaceId/billing" element={<BillingWorkspace />} />
            <Route path="/workspaces/:workspaceId/agents" element={<AgentsList />} />
        </Route>
    </Route>
);
