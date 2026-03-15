import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "pages/Auth/Login";
import Register from "pages/Auth/Register";
import AuthLayout from "pages/Auth/Layout/AuthLayout";
import Validate from "pages/Auth/Validate";
import ResetPassword from "pages/Auth/Password";
import ApplyResetPassword from "pages/Auth/Password/ApplyResetPassword";
import PrivateRoute from "app/PrivateRoute";
import OnBoarding from "pages/Onboarding/OnBoarding";
import NotFound from "pages/NotFound";
import ChatWorkspace from "pages/Workspace/Chat";
import { DocumentWorkspace } from "pages/Workspace/Documents";
import WorkflowWorkspace from "pages/Workspace/Workflow";
import DeploymentWorkspace from "pages/Workspace/Deployment";
import { BillingWorkspace } from "pages/Workspace/Billing";
import PrivateAgentAppLayout from "app/PrivateAgentAppLayout";
import PrivateAppLayout from "app/PrivateAppLayout";
import Dashboard from "pages/Dashboard";
import { AssistantsList } from "pages/Assistant/AssistantList";
import { Assistant } from "pages/Assistant/Assistant";
import { useParams } from "react-router-dom";
import { AgentsList } from "pages/Agents";
import { Workspaces } from "pages/Workspace";

const ChatRoute = () => {
    const { chatId } = useParams<{ chatId: string }>();
    return <Assistant key={chatId} />;
};

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/validate" element={<Validate />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                        path="/new-password"
                        element={<ApplyResetPassword />}
                    />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/onboarding" element={<OnBoarding />} />

                    <Route element={<PrivateAppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route
                            path="/assistants"
                            element={<AssistantsList />}
                        />
                        <Route
                            path="/assistants/:assistantId"
                            element={<ChatRoute />}
                        />
                        <Route path="/billing" element={<BillingWorkspace />} />

                        <Route path="/workspaces" element={<Workspaces />} />
                        <Route
                            path="/workspaces/:workspaceId/agents"
                            element={<AgentsList />}
                        />
                    </Route>

                    <Route element={<PrivateAgentAppLayout />}>
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
                            path="/workspaces/:workspaceId/agents/:agentId/settings"
                            element={<div>SETTINGS</div>}
                        />
                    </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
