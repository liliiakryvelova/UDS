import { NextResponse } from "next/server";
import { USER_SESSION_COOKIE } from "@/lib/auth/user-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set({
    name: USER_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
