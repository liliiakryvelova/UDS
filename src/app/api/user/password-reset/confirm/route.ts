import { NextResponse } from "next/server";
import { hashUserPassword } from "@/lib/auth/user-auth";
import { resetVolunteerPasswordByToken } from "@/lib/domain/store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return NextResponse.redirect(new URL("/forgot-password", request.url));
  }

  if (password.length < 8) {
    return NextResponse.redirect(new URL(`/reset-password/${encodeURIComponent(token)}?error=weak`, request.url));
  }

  if (password !== confirmPassword) {
    return NextResponse.redirect(new URL(`/reset-password/${encodeURIComponent(token)}?error=match`, request.url));
  }

  const updated = await resetVolunteerPasswordByToken(token, hashUserPassword(password));

  if (!updated) {
    return NextResponse.redirect(new URL(`/reset-password/${encodeURIComponent(token)}?error=invalid`, request.url));
  }

  return NextResponse.redirect(new URL("/login?reset=1", request.url));
}
