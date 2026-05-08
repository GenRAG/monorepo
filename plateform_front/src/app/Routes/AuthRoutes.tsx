import AuthLayout from "pages/Auth/Layout/AuthLayout";
import Login from "pages/Auth/Login";
import ResetPassword from "pages/Auth/Password";
import ApplyResetPassword from "pages/Auth/Password/ApplyResetPassword";
import Register from "pages/Auth/Register";
import Validate from "pages/Auth/Validate";
import { Route } from "react-router-dom";

export const AuthRoutes = () => (
    <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/validate" element={<Validate />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/new-password" element={<ApplyResetPassword />} />
    </Route>
);
