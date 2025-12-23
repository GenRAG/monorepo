import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "app/AuthContext";
import { useRef } from "react";

const PrivateRoute: React.FC = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const hasChecked = useRef(false);

  if (!isLoading) hasChecked.current = true;

  console.log("PrivateRoute - isLoggedIn:", isLoggedIn, "isLoading:", isLoading, "hasChecked:", hasChecked.current);

  if (isLoading || !hasChecked.current) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
