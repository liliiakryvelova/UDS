import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import Link from "next/link";
import { hasAdminPageSession } from "@/lib/auth/admin-guard";
import { getUserSessionIdentity } from "@/lib/auth/user-guard";
import HeaderNav from "@/components/header-nav";
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
  title: "Ukraine Defence Support Events",
  description: "Community events and volunteer registration for Ukraine Defence Support.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
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
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-30 border-b border-[#dce6f2]/90 bg-[#f3f7fc]/90 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <span className={`${brandDisplay.variable} rounded-xl border-2 border-[#4b8de0] bg-[#1859a9] px-3 py-2 font-brand-display text-[1.7rem] leading-none tracking-[-0.03em] text-white shadow-sm`}>
                Ukraine Defence Support Events
              </span>
            </Link>

            <HeaderNav
              isAdminLoggedIn={isAdminLoggedIn}
              isUserLoggedIn={isUserLoggedIn}
              userFullName={userSession?.fullName}
            />
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="mt-12 border-t border-[#dce6f2] bg-white/65">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-xs leading-5 text-[#71839a] md:flex-row md:items-center md:justify-between">
            <p>Ukraine Defence Support Events. Built to support volunteer coordination.</p>
            <p>Created by Liliia Kryvelova.</p>
            <p>All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
