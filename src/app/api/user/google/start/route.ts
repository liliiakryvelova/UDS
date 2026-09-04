import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  buildGoogleAuthorizationUrl,
  createGoogleOAuthStateCookieValue,
  getGoogleOAuthConfig,
  GOOGLE_OAUTH_STATE_COOKIE,
  resolveGoogleRedirectUri,
  sanitizeNextPath,
} from "@/lib/auth/google-oauth";

export async function GET(request: Request) {
  const config = getGoogleOAuthConfig();

  if (!config) {
    return NextResponse.redirect(new URL("/login?error=google_config", request.url));
  }

  const requestUrl = new URL(request.url);
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const state = randomUUID();
  const nonce = randomUUID();
  const expiresAt = Date.now() + 1000 * 60 * 10;
  const redirectUri = resolveGoogleRedirectUri(request.url, config.redirectUri);

  const googleAuthUrl = buildGoogleAuthorizationUrl({
    clientId: config.clientId,
    redirectUri,
    state,
    nonce,
  });

  const response = NextResponse.redirect(googleAuthUrl);

  response.cookies.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: createGoogleOAuthStateCookieValue({
      state,
      nonce,
      nextPath,
      expiresAt,
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}