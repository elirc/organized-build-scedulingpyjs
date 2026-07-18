import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./auth.store";

export function RequireAuth() {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

