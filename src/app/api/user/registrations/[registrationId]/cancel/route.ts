import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { USER_SESSION_COOKIE, verifyUserSession } from "@/lib/auth/user-auth";
import { cancelRegistrationByIdForUser } from "@/lib/domain/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ registrationId: string }> },
) {
  const { registrationId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  const identity = verifyUserSession(token);

  if (!identity) {
    return NextResponse.redirect(new URL("/login?next=/my-events", request.url));
  }

  const cancelled = await cancelRegistrationByIdForUser(registrationId, identity.email);

  if (!cancelled.ok && cancelled.reason === "forbidden") {
    return NextResponse.redirect(new URL("/my-events?error=forbidden", request.url));
  }

  if (!cancelled.ok && cancelled.reason === "not_found") {
    return NextResponse.redirect(new URL("/my-events?error=missing", request.url));
  }

  return NextResponse.redirect(new URL("/my-events?cancelled=1", request.url));
}
