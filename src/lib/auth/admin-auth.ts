import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "uds_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-only-change-this-secret";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function getAdminEmails() {
  const rawValue = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "admin@uds.local";

  return rawValue
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmailAllowed(email: string | undefined | null) {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return getAdminEmails().includes(normalizedEmail);
}

export function getAdminCredentials() {
  const [primaryEmail] = getAdminEmails();

  return {
    email: primaryEmail ?? "admin@uds.local",
    password: process.env.ADMIN_PASSWORD ?? "admin",
  };
}

export function createAdminSession(email: string) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${email}:${expiresAt}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminSession(token: string | undefined | null) {
  if (!token) {
    return false;
  }

  const lastDot = token.lastIndexOf(".");

  if (lastDot <= 0) {
    return false;
  }

  const payload = token.slice(0, lastDot);
  const providedSignature = token.slice(lastDot + 1);
  const expectedSignature = signPayload(payload);

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return false;
  }

  const [email, expiresAtRaw] = payload.split(":");
  const expiresAt = Number(expiresAtRaw);

  if (!email || Number.isNaN(expiresAt)) {
    return false;
  }

  if (Date.now() > expiresAt) {
    return false;
  }

  return isAdminEmailAllowed(email);
}
