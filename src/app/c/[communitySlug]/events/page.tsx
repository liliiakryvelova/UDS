import Link from "next/link";
import { getUpcomingPublishedEventsByCommunitySlug } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

function eventTypeLabel(eventType: string) {
  return eventType.charAt(0).toUpperCase() + eventType.slice(1);
}

export default async function CommunityEventsPage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;
  const items = await getUpcomingPublishedEventsByCommunitySlug(communitySlug);
  const title = communitySlug === "uds" ? "UDS" : communitySlug.toUpperCase();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-100 p-8 shadow-sm md:p-10">
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sky-300/40 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Community events</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{title} Events</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
            Published and upcoming events for this community. Open any card to view details and register as a volunteer.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm text-slate-700 ring-1 ring-sky-100">
            <span className="font-semibold text-slate-900">{items.length}</span>
            upcoming event{items.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <section className="mt-8 grid auto-rows-fr items-stretch justify-items-center gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.length > 0 ? (
          items.map((event) => (
            <article
              key={event.id}
              className="group flex min-h-[21rem] w-full max-w-sm self-stretch flex-col rounded-3xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 ring-1 ring-sky-200">
                  {eventTypeLabel(event.eventType)}
                </p>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 ring-1 ring-sky-200">
                  {event.status.replace("_", " ")}
                </span>
              </div>

              <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">{event.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">{event.shortDescription}</p>

              <div className="mt-5 space-y-2 text-sm text-slate-700">
                <p className="rounded-xl bg-white px-3 py-2 ring-1 ring-sky-100">
                  <span className="font-semibold text-slate-900">When:</span> {formatDateRange(event.startDate, event.endDate)}
                </p>
                <p className="rounded-xl bg-white px-3 py-2 ring-1 ring-sky-100">
                  <span className="font-semibold text-slate-900">Where:</span> {event.venueName}
                </p>
              </div>

              <Link
                href={`/c/${communitySlug}/events/${event.id}`}
                className="mt-auto inline-flex self-center items-center justify-center rounded-full bg-sky-800 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-sky-900"
              >
                Open Event
              </Link>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600 md:col-span-2 xl:col-span-3">
            There are no published upcoming events yet. Check back soon.
          </div>
        )}
      </section>
    </main>
  );
}
