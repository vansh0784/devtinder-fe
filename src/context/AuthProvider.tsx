import axios from "axios";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AuthContext } from "./AuthContext";
import { type IUser } from "../utils/types";
import {
  AUTH_EXPIRED_EVENT,
  AUTH_TOKEN_KEY,
  clearAuthStorage,
  persistUserSnapshot,
  readUserSnapshotFromStorage,
} from "../utils/authStorage";
import { getApi } from "../utils/api";
import { socket } from "../utils/socket";

function initialUserWhileTokenPresent(): IUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return null;
    return readUserSnapshotFromStorage();
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(initialUserWhileTokenPresent);
  const [authReady, setAuthReady] = useState(false);

  const setUser = useCallback((next: SetStateAction<IUser | null>) => {
    setUserState((prev) => {
      const resolved =
        typeof next === "function"
          ? (next as (p: IUser | null) => IUser | null)(prev)
          : next;
      persistUserSnapshot(resolved);
      return resolved;
    });
  }, []);

  const clearSession = useCallback(() => {
    clearAuthStorage();
    persistUserSnapshot(null);
    setUserState(null);
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

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromToken() {
      let token: string | null = null;
      try {
        token = localStorage.getItem(AUTH_TOKEN_KEY);
      } catch {
        token = null;
      }

      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        const me = await getApi<IUser>("/user/profile", {
          skipErrorToast: true,
        });
        if (!cancelled) {
          setUserState(me);
          persistUserSnapshot(me);
        }
      } catch (e: unknown) {
        if (!cancelled && axios.isAxiosError(e)) {
          const status = e.response?.status;
          /* Token/session invalid or user removed from DB */
          if (status === 401 || status === 404) clearSession();
          /* Network / 5xx: keep JWT + cached user so backend restarts do not wipe the UI */
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    }

    void hydrateFromToken();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, setUser, logout, authReady }),
    [user, logout, authReady, setUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
