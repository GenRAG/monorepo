import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "pages/Auth/Login";
import Register from "pages/Auth/Register";
import AuthLayout from "pages/Auth/Layout/AuthLayout";
import Validate from "pages/Auth/Validate";
import ResetPassword from "pages/Auth/Password";
import ApplyResetPassword from "pages/Auth/Password/ApplyResetPassword";
import PrivateRoute from "app/PrivateRoute";
import Sidebar from "app/Navigation/Sidebar";
import PrivateAppLayout from "app/PrivateAppLayout";

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
          <Route element={<PrivateAppLayout />}>
            <Route path="/" element={<div>YO</div>} />
            <Route path="/dashboard" element={<div>DASHBOARD</div>} />
          </Route>
        </Route>


        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
