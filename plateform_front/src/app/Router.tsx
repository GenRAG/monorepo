import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import RessourcesWorkspace from "pages/Workspace/Ressources";
import WorkflowWorkspace from "pages/Workspace/Workflow";
import AnalyticsWorkspace from "pages/Workspace/Analytics";
import DeploymentWorkspace from "pages/Workspace/Deployment";
import { BillingWorkspace } from "pages/Workspace/Billing";
import PrivateWorkspaceAppLayout from "app/PrivateWorkspaceAppLayout";
import PrivateAppLayout from "app/PrivateAppLayout";
import Dashboard from "pages/Dashboard";
import { AssistantsList } from "pages/Assistant/AssistantList";
import { Assistant } from "pages/Assistant/Assistant";
import { useParams } from "react-router-dom";
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

                        <Route element={<PrivateWorkspaceAppLayout />}>
                            <Route
                                path="/workspaces/:workspaceId/ressources"
                                element={<RessourcesWorkspace />}
                            />
                            <Route
                                path="/workspaces/:workspaceId/chat"
                                element={<ChatWorkspace />}
                            />
                            <Route
                                path="/workspaces/:workspaceId/workflow"
                                element={<WorkflowWorkspace />}
                            />
                            <Route
                                path="/workspaces/:workspaceId/documents"
                                element={<DocumentWorkspace />}
                            />
                            <Route
                                path="/workspaces/:workspaceId/analytics"
                                element={<AnalyticsWorkspace />}
                            />
                            <Route
                                path="/workspaces/:workspaceId/deployment"
                                element={<DeploymentWorkspace />}
                            />
                            <Route
                                path="/workspaces/:workspaceId/settings"
                                element={<div>SETTINGS</div>}
                            />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
