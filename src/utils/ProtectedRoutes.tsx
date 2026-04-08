import { Navigate, Outlet } from "react-router-dom";
import { type ReactNode } from "react";
const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

export default function ProtectedRoute({ children }: { children?: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
