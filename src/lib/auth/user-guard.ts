import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USER_SESSION_COOKIE, verifyUserSession } from "@/lib/auth/user-auth";

export async function getUserSessionIdentity() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  return verifyUserSession(token);
}

export async function hasUserPageSession() {
  return Boolean(await getUserSessionIdentity());
}

export async function ensureUserPageSession(nextPath: string) {
  if (!(await hasUserPageSession())) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
}
