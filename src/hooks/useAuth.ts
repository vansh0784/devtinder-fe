import { useContext } from "react";
import { AuthContext, type IAuthContext } from "../context/AuthContext";

export function useAuth(): IAuthContext {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
