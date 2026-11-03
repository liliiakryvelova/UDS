"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderNavProps {
  isAdminLoggedIn: boolean;
  isUserLoggedIn: boolean;
  userFullName?: string;
}

function navItemClass(active: boolean) {
  return active
    ? "rounded-full border border-[#205b53] bg-[#205b53] px-4 py-2 font-medium text-white shadow-sm shadow-[#205b53]/15"
    : "rounded-full border border-[#e0e8e2] bg-white/80 px-4 py-2 font-medium text-[#52645e] transition hover:border-[#c5d8ce] hover:bg-white hover:text-[#183a37]";
}

export default function HeaderNav({ isAdminLoggedIn, isUserLoggedIn, userFullName }: HeaderNavProps) {
  const pathname = usePathname();
  const onDashboard = pathname === "/" || pathname.startsWith("/c/");
  const onMyEvents = pathname === "/my-events";
  const onSignUp = pathname === "/signup";
  const onSignIn = pathname === "/login" || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password/");

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      <Link href="/" className={navItemClass(onDashboard)}>
        Dashboard
      </Link>

      {isAdminLoggedIn ? (
        <>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Admin
          </span>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-[#e0e8e2] bg-white/80 px-4 py-2 font-medium text-[#52645e] transition hover:border-[#c5d8ce] hover:bg-white hover:text-[#183a37]"
            >
              Log Out
            </button>
          </form>
        </>
      ) : isUserLoggedIn ? (
        <>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            {userFullName}
          </span>
          <Link href="/my-events" className={navItemClass(onMyEvents)}>
            My Events
          </Link>
          <form action="/api/user/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-[#e0e8e2] bg-white/80 px-4 py-2 font-medium text-[#52645e] transition hover:border-[#c5d8ce] hover:bg-white hover:text-[#183a37]"
            >
              Log Out
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/signup" className={navItemClass(onSignUp)}>
            Sign Up
          </Link>
          <Link href="/login" className={navItemClass(onSignIn)}>
            Sign In
          </Link>
        </>
      )}
    </nav>
  );
}
