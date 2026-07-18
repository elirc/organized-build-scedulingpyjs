import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./auth.store";
import { hasMinimumRole, type Role } from "../lib/permissions";

export function RequireRole({ minimumRole }: { minimumRole: Role }) {
  const role = useAuthStore((state) => state.user?.role);
  if (!hasMinimumRole(role, minimumRole)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

