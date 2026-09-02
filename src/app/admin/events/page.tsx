import AdminEventForm from "@/components/admin-event-form";
import { ensureAdminPageSession } from "@/lib/auth/admin-guard";
import { getAdminEvents } from "@/lib/domain/store";
import Link from "next/link";

export const dynamic = "force-dynamic";

type AdminEventView = "all" | "upcoming" | "ongoing" | "past" | "closed";

const ADMIN_EVENT_VIEWS: Array<{ key: AdminEventView; label: string }> = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing", label: "Ongoing" },
  { key: "past", label: "Past" },
  { key: "closed", label: "Completed / Cancelled" },
];

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function isClosedStatus(status: string) {
  return status === "completed" || status === "cancelled";
}

function filterEventsByView(
  events: Awaited<ReturnType<typeof getAdminEvents>>,
  view: AdminEventView,
  today: Date,
) {
  return events.filter((event) => {
    if (view === "all") {
      return true;
    }

    if (view === "closed") {
      return isClosedStatus(event.status);
    }

    const startDate = parseDateOnly(event.startDate);
    const endDate = parseDateOnly(event.endDate);
    const isClosed = isClosedStatus(event.status);

    if (isClosed) {
      return false;
    }

    if (view === "upcoming") {
      return startDate > today;
    }

    if (view === "ongoing") {
      return startDate <= today && endDate >= today;
    }

    if (view === "past") {
      return endDate < today;
    }

    return true;
  });
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await ensureAdminPageSession("/admin/events");
  const params = await searchParams;
  const events = await getAdminEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const requestedView = params.view;
  const activeView = ADMIN_EVENT_VIEWS.some((view) => view.key === requestedView)
    ? (requestedView as AdminEventView)
    : "all";

  const eventsByView = {
    all: filterEventsByView(events, "all", today),
    upcoming: filterEventsByView(events, "upcoming", today),
    ongoing: filterEventsByView(events, "ongoing", today),
    past: filterEventsByView(events, "past", today),
    closed: filterEventsByView(events, "closed", today),
  };

  const visibleEvents = eventsByView[activeView];

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

      <section className="mt-8 rounded-2xl border border-sky-200 bg-white/90 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Event views</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ADMIN_EVENT_VIEWS.map((view) => {
            const isActive = activeView === view.key;
            return (
              <Link
                key={view.key}
                href={view.key === "all" ? "/admin/events" : `/admin/events?view=${view.key}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-sky-800 text-white"
                    : "bg-sky-50 text-sky-800 ring-1 ring-sky-200 hover:bg-sky-100"
                }`}
              >
                {view.label} ({eventsByView[view.key].length})
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleEvents.map((event) => (
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

      {visibleEvents.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 px-4 py-3 text-sm text-slate-600">
          No events found in this view.
        </p>
      ) : null}
    </main>
  );
}
