import { isPasswordResetTokenValid } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

export default async function ResetPasswordTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const hasValidToken = await isPasswordResetTokenValid(token);

  let message = "";

  if (query.error === "weak") {
    message = "Password must be at least 8 characters.";
  } else if (query.error === "match") {
    message = "Passwords do not match.";
  } else if (query.error === "invalid") {
    message = "Reset link is invalid or expired. Request a new one.";
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Volunteer area</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Choose New Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          This reset link can be used once and expires after 30 minutes.
        </p>
      </section>

      <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm">
        {hasValidToken ? (
          <form action="/api/user/password-reset/confirm" method="post" className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <label className="block text-sm text-slate-700">
              New password
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
              />
            </label>

            <label className="block text-sm text-slate-700">
              Confirm new password
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
              />
            </label>

            {message ? <p className="text-sm text-red-600">{message}</p> : null}

            <button
              type="submit"
              className="w-full rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white"
            >
              Update password
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600">Reset link is invalid or expired.</p>
            <a href="/forgot-password" className="inline-block rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white">
              Request new link
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
