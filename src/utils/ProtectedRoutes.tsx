import { Navigate, Outlet } from "react-router-dom";
import { type ReactNode } from "react";
import { AUTH_TOKEN_KEY } from "./authStorage";
const isAuthenticated = () => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

export default function ProtectedRoute({ children }: { children?: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
