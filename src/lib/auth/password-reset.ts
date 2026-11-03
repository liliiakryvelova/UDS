import { createHash, randomBytes } from "node:crypto";

export const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 30;
const DEFAULT_APP_ORIGIN = "https://events.ukrainedefensesupport.org";

export function createPasswordResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getAppOrigin(request: Request) {
  const configuredOrigin = process.env.APP_ORIGIN?.trim();
  if (configuredOrigin) {
    const configuredUrl = new URL(configuredOrigin);
    if (!configuredUrl.hostname.endsWith(".vercel.app")) {
      return configuredOrigin.replace(/\/+$/, "");
    }
  }

  const url = new URL(request.url);
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]") {
    return url.origin;
  }

  return DEFAULT_APP_ORIGIN;
}
