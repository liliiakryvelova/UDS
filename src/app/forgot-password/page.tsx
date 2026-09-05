"use client";

import { useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function ForgotPasswordPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const sent = searchParams.get("sent") === "1";

  const openSentWindow = () => {
    const emailInput = formRef.current?.querySelector<HTMLInputElement>('input[name="email"]');
    const emailValue = emailInput?.value?.trim() || "the email address you provided";

    const popup = window.open(
      "",
      "password-reset-sent",
      "width=460,height=220,noopener,noreferrer,resizable=yes,scrollbars=no"
    );

    if (!popup) return;

    popup.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Reset link sent</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .card {
              width: min(90vw, 380px);
              background: white;
              border: 1px solid #bae6fd;
              border-radius: 18px;
              box-shadow: 0 20px 40px rgba(14, 116, 144, 0.12);
              padding: 24px;
              text-align: center;
            }
            h2 {
              margin: 0 0 12px;
              font-size: 24px;
              color: #075985;
            }
            p {
              margin: 0;
              font-size: 15px;
              line-height: 1.6;
              color: #334155;
            }
            .email {
              display: block;
              margin-top: 10px;
              font-weight: 700;
              color: #0f172a;
              word-break: break-word;
            }
            button {
              margin-top: 18px;
              border: none;
              border-radius: 999px;
              background: #075985;
              color: white;
              font-weight: 600;
              padding: 10px 18px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Reset link sent</h2>
            <p>
              A password reset link was sent to:<br />
              <span class="email">${emailValue}</span>
            </p>
            <button type="button" onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Volunteer area</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your account email and we will send a secure reset link.
        </p>
      </section>

      <form
        ref={formRef}
        action="/api/user/password-reset/request"
        method="post"
        onSubmit={openSentWindow}
        className="mt-8 space-y-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm"
      >
        <label className="block text-sm text-slate-700">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white"
        >
          Send reset link
        </button>

        {sent ? (
          <p className="text-sm text-emerald-700">
            Your request has already been sent. Please check your email for the reset link.
          </p>
        ) : null}

        <p className="text-center text-xs text-slate-600">
          Remembered your password?{" "}
          <a href="/login" className="font-medium text-sky-800 underline-offset-2 hover:underline">
            Back to sign in
          </a>
        </p>
      </form>
    </main>
  );
}
