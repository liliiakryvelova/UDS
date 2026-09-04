import { NextResponse } from "next/server";
import {
  createUserSession,
  USER_SESSION_COOKIE,
  verifyUserPassword,
} from "@/lib/auth/user-auth";
import { sanitizeNextPath } from "@/lib/auth/google-oauth";
import { findVolunteerAccountByEmail } from "@/lib/domain/store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNextPath(String(formData.get("next") ?? "/my-events"));

  const volunteer = await findVolunteerAccountByEmail(email);

  if (!volunteer || !verifyUserPassword(password, volunteer.passwordHash)) {
    return NextResponse.redirect(new URL("/login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));

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

  return response;
}
