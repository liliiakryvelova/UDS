import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ukraine Defense Support Events — Volunteer App",
  description: "Discover UDS events and find your next way to help.",
  applicationName: "Ukraine Defense Support Events",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ukraine Defense Support Events",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/app-icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1859a9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
