import type { SessionUser } from "@/shared/session/session";

const ADMIN_TECH_EMAIL = "admin@fastone.local";
const FALLBACK_NAME = "Operador Admin";
const FALLBACK_EMAIL = "carlos@delivery.com";

const labelFromEmail = (email: string): string => {
  const trimmed = email.trim();
  if (!trimmed) return "";
  return trimmed.toLowerCase() === ADMIN_TECH_EMAIL ? FALLBACK_NAME : trimmed;
};

export const displayNameOf = ({ name, email }: SessionUser): string =>
  name || labelFromEmail(email) || FALLBACK_NAME;

export const displayEmailOf = ({ email }: SessionUser): string =>
  email || FALLBACK_EMAIL;

export const avatarLabelOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "U";
