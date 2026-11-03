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
    <main className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#e3eae4] bg-gradient-to-br from-[#edf4ef] via-[#f5f7f3] to-[#f7eee7] p-8 shadow-[0_18px_50px_-38px_rgba(24,58,55,0.28)] md:p-10">
        <div className="absolute -right-20 -top-24 -z-10 h-56 w-56 rounded-full bg-[#d6e8df]/70 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 -z-10 h-56 w-56 rounded-full bg-[#f0dfd2]/70 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52786d]">Community events</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#183a37] md:text-5xl">{title} Events</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5e716b] md:text-base">
            Published and upcoming events for this community. Open any card to view details and register as a volunteer.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm text-[#687972] ring-1 ring-[#e2e9e3]">
            <span className="font-semibold text-[#183a37]">{items.length}</span>
            upcoming event{items.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <section className="mt-8 grid auto-rows-fr items-stretch justify-items-center gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.length > 0 ? (
          items.map((event) => (
            <article
              key={event.id}
              className="group flex min-h-[21rem] w-full max-w-sm self-stretch flex-col rounded-[1.5rem] border border-[#e2e9e3] bg-white p-5 shadow-[0_12px_30px_-24px_rgba(24,58,55,0.35)] transition duration-200 hover:-translate-y-1 hover:border-[#cbdcd1] hover:shadow-[0_20px_40px_-25px_rgba(24,58,55,0.28)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="rounded-full bg-[#edf4ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#52786d] ring-1 ring-[#e0ebe3]">
                  {eventTypeLabel(event.eventType)}
                </p>
                <span className="rounded-full bg-[#f7f8f6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#71817c] ring-1 ring-[#e6ebe7]">
                  {event.status.replace("_", " ")}
                </span>
              </div>

              <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#183a37]">{event.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#687972]">{event.shortDescription}</p>

              <div className="mt-5 space-y-2 text-sm text-[#687972]">
                <p className="rounded-xl bg-[#f7f9f6] px-3 py-2 ring-1 ring-[#e8ede8]">
                  <span className="font-semibold text-[#183a37]">When:</span> {formatDateRange(event.startDate, event.endDate)}
                </p>
                <p className="rounded-xl bg-[#f7f9f6] px-3 py-2 ring-1 ring-[#e8ede8]">
                  <span className="font-semibold text-[#183a37]">Where:</span> {event.venueName}
                </p>
              </div>

              <Link
                href={`/c/${communitySlug}/events/${event.id}`}
                className="mt-auto inline-flex self-start items-center justify-center rounded-full bg-[#205b53] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#17473f]"
              >
                Open Event
              </Link>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-[#cbdcd1] bg-white/75 p-8 text-sm text-[#71817c] md:col-span-2 xl:col-span-3">
            There are no published upcoming events yet. Check back soon.
          </div>
        )}
      </section>
    </main>
  );
}
