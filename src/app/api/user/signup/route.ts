import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  createUserSession,
  hashUserPassword,
  USER_SESSION_COOKIE,
} from "@/lib/auth/user-auth";
import { sanitizeNextPath } from "@/lib/auth/google-oauth";
import { createVolunteerAccount, getCommunityBySlug } from "@/lib/domain/store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const additionalInfo = String(formData.get("additionalInfo") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeNextPath(String(formData.get("next") ?? "/my-events"));

  if (!firstName || !lastName || !email || password.length < 8) {
    return NextResponse.redirect(new URL("/signup?error=1", request.url));
  }

  const community = await getCommunityBySlug("uds");

  if (!community) {
    return NextResponse.redirect(new URL("/signup?error=1", request.url));
  }

  try {
    const account = await createVolunteerAccount({
      communityId: community.id,
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      additionalInfo: additionalInfo || undefined,
      passwordHash: hashUserPassword(password),
    });

    const response = NextResponse.redirect(new URL(next, request.url));
    response.cookies.set({
      name: USER_SESSION_COOKIE,
      value: createUserSession(`${account.firstName} ${account.lastName}`.trim(), account.email, account.phone ?? "none"),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.redirect(new URL("/signup?error=exists", request.url));
    }

    return NextResponse.redirect(new URL("/signup?error=1", request.url));
  }
}
