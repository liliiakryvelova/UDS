import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-cyan-700 p-8 text-white shadow-lg md:p-12">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">UDS Platform</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          Events Module Foundation
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50 md:text-base">
          Multi-community event management and registration for UDS and Catchball Community.
          This project now includes route scaffolds for public discovery, token-based registration
          management, and admin operations.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/c/uds/events" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">UDS Public Events</h2>
          <p className="mt-2 text-sm text-slate-600">View published and upcoming UDS events.</p>
        </Link>

        <Link
          href="/c/catchball/events"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Catchball Events</h2>
          <p className="mt-2 text-sm text-slate-600">Community-scoped listing for Catchball.</p>
        </Link>

        <Link href="/admin/events" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-slate-600">Manage event catalog, slots, and registrations.</p>
        </Link>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Next Implementation Steps</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Replace mock store with database models and migrations.</li>
          <li>Add admin authentication and role checks.</li>
          <li>Implement email confirmations and reminders.</li>
          <li>Add transactional capacity enforcement in persistence layer.</li>
        </ul>
      </section>
    </main>
  );
}
