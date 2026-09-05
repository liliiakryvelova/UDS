import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WaitlistCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string; error?: string; token?: string }>;
}) {
  const params = await searchParams;
  const tokenValue = params.token ?? "";

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-16">
      <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Volunteer waitlist</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Leave the waitlist</h1>
        <p className="mt-2 text-sm text-slate-600">
          If you no longer want to stay on the list for this shift, you can remove your spot here.
        </p>
      </section>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
        {params.cancelled === "1" ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-700">Your waitlist entry has been cancelled.</p>
            <p className="text-sm text-slate-600">You can still sign up for another available shift at any time.</p>
            <div className="pt-2">
              <Link href="/my-events" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Go to My Events
              </Link>
            </div>
          </div>
        ) : (
          <form action="/api/waitlist/cancel" method="post" className="space-y-4">
            <label className="block text-sm text-slate-700">
              Registration token
              <input
                type="text"
                name="token"
                defaultValue={tokenValue}
                required
                placeholder="Paste your registration access token"
                className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2"
              />
            </label>

            {params.error === "missing" ? (
              <p className="text-sm text-red-600">
                We could not find that waitlist entry. Please check the token and try again.
              </p>
            ) : null}

            <button type="submit" className="w-full rounded-full bg-amber-700 px-4 py-2 text-sm font-medium text-white">
              Remove me from the waitlist
            </button>

            <p className="text-center text-xs text-slate-600">
              Need help? <Link href="/login" className="font-medium text-sky-800 underline-offset-2 hover:underline">Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
