import AdminEventForm from "@/components/admin-event-form";
import { ensureAdminPageSession } from "@/lib/auth/admin-guard";
import { getAdminEvents } from "@/lib/domain/store";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  await ensureAdminPageSession("/admin/events");
  const events = await getAdminEvents();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Admin dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Events</h1>
          <p className="mt-2 text-sm text-slate-600">Create and manage UDS events.</p>
        </div>

        <form action="/api/admin/logout" method="post">
          <button type="submit" className="rounded-full border border-sky-300 bg-white px-4 py-2 text-sm text-slate-700">
            Log Out
          </button>
        </form>
      </div>

      <AdminEventForm />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{event.name}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {event.startDate} - {event.endDate}
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase text-sky-700 ring-1 ring-sky-200">
                {event.status}
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-700">Type: {event.eventType}</p>
            <p className="mt-1 text-sm text-slate-700">Captain: {event.captainName ?? "TBD"}</p>
            <p className="mt-1 text-sm text-slate-700">Supplies: {event.supplies.join(", ") || "None"}</p>

            <p className="mt-4 text-sm font-medium text-slate-900">Manage event →</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
