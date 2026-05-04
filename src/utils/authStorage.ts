export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_EXPIRED_EVENT = "devtinder:session-expired";

const EDITOR_USER_ID_KEY = "devtinder_user_id";
const EDITOR_USER_NAME_KEY = "devtinder_user_name";

/** Clears JWT and local-only session keys used by collab/editor. */
export function clearAuthStorage(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
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
