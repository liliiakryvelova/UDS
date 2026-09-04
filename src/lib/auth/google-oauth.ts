import { createHmac, timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_OAUTH_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const GOOGLE_JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");

export const GOOGLE_OAUTH_STATE_COOKIE = "uds_google_oauth_state";

const googleJwks = createRemoteJWKSet(GOOGLE_JWKS_URL) as Parameters<typeof jwtVerify>[1];

interface GoogleOAuthState {
  state: string;
  nonce: string;
  nextPath: string;
  expiresAt: number;
}

function getSessionSecret() {
  return process.env.USER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "dev-only-change-this-secret";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function sanitizeNextPath(value: string | null | undefined) {
  const nextPath = String(value ?? "").trim();

  if (!nextPath.startsWith("/")) {
    return "/my-events";
  }

  if (nextPath.startsWith("//")) {
    return "/my-events";
  }

  return nextPath;
}

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

export function createGoogleOAuthStateCookieValue(input: GoogleOAuthState) {
  const payload = Buffer.from(JSON.stringify(input)).toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifyGoogleOAuthStateCookieValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const lastDot = value.lastIndexOf(".");

  if (lastDot <= 0) {
    return null;
  }

  const payload = value.slice(0, lastDot);
  const providedSignature = value.slice(lastDot + 1);
  const expectedSignature = signPayload(payload);

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GoogleOAuthState;

    if (!decoded.state || !decoded.nonce || !decoded.nextPath || !decoded.expiresAt) {
      return null;
    }

    if (Date.now() > Number(decoded.expiresAt)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function resolveGoogleRedirectUri(requestUrl: string, configuredRedirectUri: string | undefined) {
  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  const url = new URL(requestUrl);
  return `${url.origin}/api/user/google/callback`;
}

export function buildGoogleAuthorizationUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", input.state);
  url.searchParams.set("nonce", input.nonce);
  url.searchParams.set("prompt", "select_account");
  return url;
}

export async function exchangeGoogleCodeForIdToken(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const body = new URLSearchParams({
    code: input.code,
    client_id: input.clientId,
    client_secret: input.clientSecret,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    return null;
  }

  const tokenResponse = (await response.json()) as {
    id_token?: string;
  };

  return tokenResponse.id_token ?? null;
}

export async function verifyGoogleIdToken(input: {
  idToken: string;
  clientId: string;
  nonce: string;
}) {
  const { payload } = await jwtVerify(input.idToken, googleJwks, {
    audience: input.clientId,
    issuer: GOOGLE_OAUTH_ISSUERS,
  });

  if (payload.nonce !== input.nonce) {
    return null;
  }

  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
  const emailVerified = payload.email_verified === true;
  const givenName = typeof payload.given_name === "string" ? payload.given_name : undefined;
  const familyName = typeof payload.family_name === "string" ? payload.family_name : undefined;
  const fullName = typeof payload.name === "string" ? payload.name : undefined;

  if (!email || !emailVerified) {
    return null;
  }

  return {
    email,
    givenName,
    familyName,
    fullName,
  };
}