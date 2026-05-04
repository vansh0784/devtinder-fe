import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthContext } from "./AuthContext";
import { type IUser } from "../utils/types";
import {
  AUTH_EXPIRED_EVENT,
  clearAuthStorage,
} from "../utils/authStorage";
import { socket } from "../utils/socket";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  const clearSession = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    socket.disconnect();
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    const onExpired = () => {
      clearSession();
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, setUser, logout }),
    [user, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
