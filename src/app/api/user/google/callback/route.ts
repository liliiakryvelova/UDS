import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createUserSession, hashUserPassword, USER_SESSION_COOKIE } from "@/lib/auth/user-auth";
import {
  exchangeGoogleCodeForIdToken,
  getGoogleOAuthConfig,
  GOOGLE_OAUTH_STATE_COOKIE,
  resolveGoogleRedirectUri,
  verifyGoogleIdToken,
  verifyGoogleOAuthStateCookieValue,
} from "@/lib/auth/google-oauth";
import { createVolunteerAccount, findVolunteerAccountByEmail, getCommunityBySlug } from "@/lib/domain/store";

function parseNameParts(input: {
  fullName?: string;
  givenName?: string;
  familyName?: string;
}) {
  const givenName = input.givenName?.trim();
  const familyName = input.familyName?.trim();

  if (givenName && familyName) {
    return { firstName: givenName, lastName: familyName };
  }

  if (input.fullName) {
    const parts = input.fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
      };
    }

    if (parts.length === 1) {
      return {
        firstName: parts[0],
        lastName: "Volunteer",
      };
    }
  }

  return {
    firstName: "Google",
    lastName: "Volunteer",
  };
}

function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }

  const config = getGoogleOAuthConfig();

  if (!config) {
    return NextResponse.redirect(new URL("/login?error=google_config", request.url));
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const stateCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${GOOGLE_OAUTH_STATE_COOKIE}=`))
    ?.slice(GOOGLE_OAUTH_STATE_COOKIE.length + 1);

  const oauthState = verifyGoogleOAuthStateCookieValue(stateCookie);

  if (!oauthState || oauthState.state !== state) {
    const response = NextResponse.redirect(new URL("/login?error=google_state", request.url));
    clearOAuthStateCookie(response);
    return response;
  }

  const redirectUri = resolveGoogleRedirectUri(request.url, config.redirectUri);
  const idToken = await exchangeGoogleCodeForIdToken({
    code,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri,
  });

  if (!idToken) {
    const response = NextResponse.redirect(new URL("/login?error=google", request.url));
    clearOAuthStateCookie(response);
    return response;
  }

  let profile: Awaited<ReturnType<typeof verifyGoogleIdToken>>;

  try {
    profile = await verifyGoogleIdToken({
      idToken,
      clientId: config.clientId,
      nonce: oauthState.nonce,
    });
  } catch {
    profile = null;
  }

  if (!profile) {
    const response = NextResponse.redirect(new URL("/login?error=google_email", request.url));
    clearOAuthStateCookie(response);
    return response;
  }

  let volunteer = await findVolunteerAccountByEmail(profile.email);

  if (!volunteer) {
    const community = await getCommunityBySlug("uds");

    if (!community) {
      const response = NextResponse.redirect(new URL("/login?error=google", request.url));
      clearOAuthStateCookie(response);
      return response;
    }

    const name = parseNameParts(profile);

    volunteer = await createVolunteerAccount({
      communityId: community.id,
      firstName: name.firstName,
      lastName: name.lastName,
      email: profile.email,
      passwordHash: hashUserPassword(randomUUID()),
    });
  }

  const response = NextResponse.redirect(new URL(oauthState.nextPath, request.url));

  response.cookies.set({
    name: USER_SESSION_COOKIE,
    value: createUserSession(
      `${volunteer.firstName} ${volunteer.lastName}`.trim(),
      volunteer.email,
      volunteer.phone ?? "none",
    ),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  clearOAuthStateCookie(response);
  return response;
}