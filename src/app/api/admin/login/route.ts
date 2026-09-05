import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getAdminCredentials,
  getAdminEmails,
  isAdminEmailAllowed,
} from "@/lib/auth/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/events");

  const credentials = getAdminCredentials();
  const normalizedEmail = email.toLowerCase();

  if (!isAdminEmailAllowed(normalizedEmail) || password !== credentials.password) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSession(email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
