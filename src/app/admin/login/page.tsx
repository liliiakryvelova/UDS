export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const next = params.next ?? "/admin/events";

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Admin area</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to create and manage events.</p>
      </section>

      <form
        action="/api/admin/login"
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

        {hasError ? <p className="text-sm text-red-600">Invalid credentials.</p> : null}

        <button
          type="submit"
          className="w-full rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white"
        >
          Log In
        </button>
      </form>
    </main>
  );
}
