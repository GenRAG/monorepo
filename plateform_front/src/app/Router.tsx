import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "pages/Auth/Login";
import Register from "pages/Auth/Register";
import AuthLayout from "pages/Auth/Layout/AuthLayout";
import Validate from "pages/Auth/Validate";
import ResetPassword from "pages/Auth/Password";
import ApplyResetPassword from "pages/Auth/Password/ApplyResetPassword";
import PrivateRoute from "app/PrivateRoute";
import Sidebar from "app/Navigation/MainSidebar/Sidebar";
import PrivateAppLayout from "app/PrivateAppLayout";
import OnBoarding from "pages/Onboarding/OnBoarding";
import NotFound from "pages/NotFound";
import ChatWorkspace from "pages/Workspace/Chat";
import DocumentWorkspace from "pages/Workspace/Documents";
import RessourcesWorkspace from "pages/Workspace/Ressources";
import WorkflowWorkspace from "pages/Workspace/Workflow";
import AnalyticsWorkspace from "pages/Workspace/Analytics";
import DeploymentWorkspace from "pages/Workspace/Deployment";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/validate" element={<Validate />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/new-password" element={<ApplyResetPassword />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/onboarding" element={<OnBoarding />} />
          <Route element={<PrivateAppLayout />}>
            <Route path="/" element={<div>YO</div>} />
            <Route path="/dashboard" element={<div>DASHBOARD</div>} />
            <Route path="/workspace/:workspaceId/ressources" element={<RessourcesWorkspace />} />
            <Route path="/workspace/:workspaceId/chat" element={<ChatWorkspace />} />
            <Route path="/workspace/:workspaceId/workflow" element={<WorkflowWorkspace />} />
            <Route path="/workspace/:workspaceId/documents" element={<DocumentWorkspace />} />
            <Route path="/workspace/:workspaceId/analytics" element={<AnalyticsWorkspace />} />
            <Route path="/workspace/:workspaceId/deployment" element={<DeploymentWorkspace />} />
            <Route path="/workspace/:workspaceId/settings" element={<div>SETTINGS</div>} />
          </Route>
        </Route>


        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
