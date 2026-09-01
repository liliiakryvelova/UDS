import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { hasAdminPageSession } from "@/lib/auth/admin-guard";
import { getUserSessionIdentity } from "@/lib/auth/user-guard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brandDisplay = DM_Serif_Display({
  variable: "--font-brand-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "UDS Events Module",
  description: "Multi-community events and registration platform",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const isAdminLoggedIn = await hasAdminPageSession();
  const userSession = await getUserSessionIdentity();
  const isUserLoggedIn = Boolean(userSession);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-sky-200 bg-sky-50/85">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/Logo_header.svg" alt="UDS logo" width={36} height={36} className="h-9 w-9" priority />
              <span className={`${brandDisplay.variable} font-brand-display text-2xl leading-none text-slate-900`}>
                UDS Events
              </span>
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/"
                className="rounded-full border border-sky-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-slate-900"
              >
                Dashboard
              </Link>
              {isAdminLoggedIn ? (
                <>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Admin
                  </span>
                  <Link
                    href="/admin/events"
                    className="rounded-full border border-sky-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-slate-900"
                  >
                    Admin Dashboard
                  </Link>
                  <form action="/api/admin/logout" method="post">
                    <button
                      type="submit"
                      className="rounded-full border border-sky-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-slate-900"
                    >
                      Log Out
                    </button>
                  </form>
                </>
              ) : isUserLoggedIn ? (
                <>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                    {userSession?.fullName}
                  </span>
                  <Link
                    href="/my-events"
                    className="rounded-full border border-sky-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-slate-900"
                  >
                    My Events
                  </Link>
                  <form action="/api/user/logout" method="post">
                    <button
                      type="submit"
                      className="rounded-full border border-sky-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-slate-900"
                    >
                      Log Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="rounded-full border border-sky-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-slate-900"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-sky-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-slate-900"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-sky-200 bg-sky-50/85">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <p>UDS Events Module. Built to support Ukraine defense volunteer coordination.</p>
            <p>All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
