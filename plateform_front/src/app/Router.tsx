import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "pages/Auth/Login";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Login />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
