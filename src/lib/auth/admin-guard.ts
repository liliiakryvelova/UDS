import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/auth/admin-auth";

export async function hasAdminPageSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSession(token);
}

export async function ensureAdminPageSession(nextPath: string) {
  if (!(await hasAdminPageSession())) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
}

export function hasAdminApiSession(request: Request) {
  const rawCookie = request.headers.get("cookie") ?? "";
  const cookieParts = rawCookie.split(";").map((item) => item.trim());
  const match = cookieParts.find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(ADMIN_SESSION_COOKIE.length + 1)) : undefined;

  return verifyAdminSession(token);
}
