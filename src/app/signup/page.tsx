export const dynamic = "force-dynamic";

export default async function UserSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/my-events";

  const errorMessage =
    params.error === "exists"
      ? "An account with this email already exists. Please sign in."
      : params.error === "1"
        ? "Please complete required fields. Password must be at least 8 characters."
        : "";

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-16">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Volunteer area</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Sign Up</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create your volunteer account to sign in quickly and see all events you joined.
        </p>
      </section>

      <form
        action="/api/user/signup"
        method="post"
        className="mt-8 grid gap-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm md:grid-cols-2"
      >
        <input type="hidden" name="next" value={next} />

        <label className="block text-sm text-slate-700">
          First name
          <input
            type="text"
            name="firstName"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          Last name
          <input
            type="text"
            name="lastName"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700 md:col-span-2">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          Phone (optional)
          <input
            type="text"
            name="phone"
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          Password
          <input
            type="password"
            name="password"
            minLength={8}
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700 md:col-span-2">
          Additional info (optional)
          <textarea
            name="additionalInfo"
            rows={3}
            placeholder="Skills, availability, preferred role, etc."
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        {errorMessage ? <p className="text-sm text-red-600 md:col-span-2">{errorMessage}</p> : null}

        <button
          type="submit"
          className="w-full rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white md:col-span-2"
        >
          Create account
        </button>

        <p className="text-center text-xs text-slate-600 md:col-span-2">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-sky-800 underline-offset-2 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
