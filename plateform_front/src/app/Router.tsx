import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import PrivateRoute from "app/PrivateRoute";
import DefaultRedirect from "app/DefaultRedirect";
import OnBoarding from "pages/Onboarding/OnBoarding";
import NotFound from "pages/NotFound";
import { AuthRoutes } from "app/Routes/AuthRoutes";
import { AgentRoutes } from "app/Routes/AgentRoutes";
import { AppRoutes } from "app/Routes/AppRoutes";
import { LegalRoutes } from "app/Routes/LegalRoutes";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {AuthRoutes()}
            <Route element={<PrivateRoute />}>
                <Route path="/" element={<DefaultRedirect />} />
                <Route path="/onboarding/:workspaceId" element={<OnBoarding />} />
                {AppRoutes()}
                {AgentRoutes()}
                {LegalRoutes()}
            </Route>
            <Route path="*" element={<NotFound />} />
        </>,
    ),
);

export default function Router() {
    return <RouterProvider router={router} />;
}
