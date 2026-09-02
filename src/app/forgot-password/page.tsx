export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";

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
        action="/api/user/password-reset/request"
        method="post"
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
            If an account exists for that email, a password reset link has been sent.
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
