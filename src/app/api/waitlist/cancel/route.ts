import { NextResponse } from "next/server";
import { cancelRegistrationByToken } from "@/lib/domain/store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "").trim();

  if (!token) {
    return NextResponse.redirect(new URL("/waitlist/cancel?error=missing", request.url));
  }

  const cancelled = await cancelRegistrationByToken(token);

  if (!cancelled) {
    return NextResponse.redirect(new URL("/waitlist/cancel?error=missing", request.url));
  }

  return NextResponse.redirect(new URL("/waitlist/cancel?cancelled=1", request.url));
}
