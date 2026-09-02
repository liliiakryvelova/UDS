export const dynamic = "force-dynamic";

export default async function UserLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const wasReset = params.reset === "1";
  const next = params.next ?? "/my-events";

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Volunteer area</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Volunteer Sign In</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to access your account and see all events you joined.
        </p>
      </section>

      <form
        action="/api/user/login"
        method="post"
        className="mt-8 space-y-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm"
      >
        <input type="hidden" name="next" value={next} />

        <label className="block text-sm text-slate-700">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <div className="-mt-2 text-right">
          <a href="/forgot-password" className="text-xs font-medium text-sky-800 underline-offset-2 hover:underline">
            Forgot password?
          </a>
        </div>

        {hasError ? (
          <p className="text-sm text-red-600">Invalid email or password.</p>
        ) : null}

        {wasReset ? (
          <p className="text-sm text-emerald-700">Password updated successfully. Sign in with your new password.</p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white"
        >
          Sign In
        </button>

        <p className="text-center text-xs text-slate-600">
          New here?{" "}
          <a href="/signup" className="font-medium text-sky-800 underline-offset-2 hover:underline">
            Sign up
          </a>
          {" · "}
          Admin access?{" "}
          <a href="/admin/login" className="font-medium text-sky-800 underline-offset-2 hover:underline">
            Sign in as admin
          </a>
        </p>
      </form>
    </main>
  );
}
