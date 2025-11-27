import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
}
