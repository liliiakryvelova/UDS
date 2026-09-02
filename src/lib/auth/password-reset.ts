import { createHash, randomBytes } from "node:crypto";

export const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

export function createPasswordResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getAppOrigin(request: Request) {
  if (process.env.APP_ORIGIN) {
    return process.env.APP_ORIGIN;
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
