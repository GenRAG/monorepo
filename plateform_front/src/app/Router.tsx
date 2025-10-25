import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "pages/Auth/Login";
import Register from "pages/Auth/Register";
import AuthLayout from "pages/Auth/Layout/AuthLayout";
import Validate from "pages/Auth/Validate";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/validate" element={<Validate />} />
        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
