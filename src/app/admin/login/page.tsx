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
      <h1 className="text-3xl font-bold tracking-tight">Admin Login</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in to create and manage events.</p>

      <form
        action="/api/admin/login"
        method="post"
        className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="next" value={next} />

        <label className="block text-sm text-slate-700">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </label>

        {hasError ? <p className="text-sm text-red-600">Invalid credentials.</p> : null}

        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Log In
        </button>
      </form>
    </main>
  );
}
