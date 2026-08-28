import { createHmac, timingSafeEqual } from "node:crypto";
import { randomBytes, scryptSync } from "node:crypto";

export const USER_SESSION_COOKIE = "uds_user_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

export interface UserSessionIdentity {
  fullName: string;
  email: string;
  phone: string;
}

function getSessionSecret() {
  return process.env.USER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "dev-only-change-this-secret";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createUserSession(fullName: string, email: string, phone: string) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ fullName, email, phone, expiresAt }),
  ).toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyUserSession(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const lastDot = token.lastIndexOf(".");

  if (lastDot <= 0) {
    return null;
  }

  const payload = token.slice(0, lastDot);
  const providedSignature = token.slice(lastDot + 1);
  const expectedSignature = signPayload(payload);

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  let decoded: { fullName?: string; email?: string; phone?: string; expiresAt?: number };

  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      fullName?: string;
      email?: string;
      phone?: string;
      expiresAt?: number;
    };
  } catch {
    return null;
  }

  const fullName = decoded.fullName;
  const email = decoded.email;
  const phone = decoded.phone;
  const expiresAt = Number(decoded.expiresAt);

  if (!fullName || !email || !phone || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return null;
  }

  return { fullName, email, phone } satisfies UserSessionIdentity;
}

export function hashUserPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyUserPassword(password: string, encoded: string) {
  const [salt, storedHash] = encoded.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const checkHash = scryptSync(password, salt, 64).toString("hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  const checkBuffer = Buffer.from(checkHash, "hex");

  if (storedBuffer.length !== checkBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, checkBuffer);
}
