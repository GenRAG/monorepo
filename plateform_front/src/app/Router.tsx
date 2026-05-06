import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "app/PrivateRoute";
import DefaultRedirect from "app/DefaultRedirect";
import OnBoarding from "pages/Onboarding/OnBoarding";
import NotFound from "pages/NotFound";
import { AuthRoutes } from "app/Routes/AuthRoutes";
import { AgentRoutes } from "app/Routes/AgentRoutes";
import { AppRoutes } from "app/Routes/AppRoutes";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {AuthRoutes()}

                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<DefaultRedirect />} />
                    <Route path="/onboarding" element={<OnBoarding />} />
                    {AppRoutes()}
                    {AgentRoutes()}
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
