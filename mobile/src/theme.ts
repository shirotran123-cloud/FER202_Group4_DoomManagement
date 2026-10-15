export const MOBILE_THEME = {
  brand: "#0f172a",
  accent: "#f97316",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  good: "#16a34a",
  warn: "#d97706",
  bad: "#dc2626",
  radius: 14,
};

export const MOBILE_SCREENS = [
  "Login",
  "Overview",
  "Booking",
  "Billing",
  "Maintenance",
  "Curfew",
  "Profile",
] as const;

export type MobileScreen = (typeof MOBILE_SCREENS)[number];

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
