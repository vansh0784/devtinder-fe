/**
 * Normalize API values for UI: avoid showing literal "undefined" / "null".
 */
export function displayField(value: unknown, empty = ""): string {
  if (value === null || value === undefined) return empty;
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : empty;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return empty;
    const lower = t.toLowerCase();
    if (lower === "null" || lower === "undefined") return empty;
    return t;
  }
  return empty;
}

export function displayInitials(
  username: string | undefined | null,
  fallback = "?",
): string {
  const u = displayField(username).replace(/^@+/, "").trim();
  if (!u) return fallback;
  const parts = u.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    if (first && last) return (first + last).toUpperCase();
  }
  return u.slice(0, Math.min(2, u.length)).toUpperCase();
}
