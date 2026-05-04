import type { IUser } from "./types";

export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_EXPIRED_EVENT = "devtinder:session-expired";
/** Last known `/user/profile` snapshot; used for instant UI on reload while we re-fetch. */
export const AUTH_USER_SNAPSHOT_KEY = "devtinder_user_snapshot";

const EDITOR_USER_ID_KEY = "devtinder_user_id";
const EDITOR_USER_NAME_KEY = "devtinder_user_name";

export function persistUserSnapshot(user: IUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_USER_SNAPSHOT_KEY);
      return;
    }
    localStorage.setItem(AUTH_USER_SNAPSHOT_KEY, JSON.stringify(user));
  } catch {
    /* noop */
  }
}

export function readUserSnapshotFromStorage(): IUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_SNAPSHOT_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as IUser;
    if (u && typeof u === "object" && "_id" in u && u._id) return u;
    return null;
  } catch {
    return null;
  }
}

/** Clears JWT and local-only session keys used by collab/editor. */
export function clearAuthStorage(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_SNAPSHOT_KEY);
    localStorage.removeItem(EDITOR_USER_ID_KEY);
    localStorage.removeItem(EDITOR_USER_NAME_KEY);
  } catch {
    /* noop */
  }
}

export function isHandshakeAuthUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("/user/login") ||
    u.includes("/user/register") ||
    u.includes("/user/auth/google")
  );
}
