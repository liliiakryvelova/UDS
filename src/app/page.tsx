import { getPublicUpcomingEventsByCommunitySlug } from "@/lib/domain/public-events";
import Link from "next/link";
import type { EventItem } from "@/lib/domain/types";
import PublicEventCard from "@/components/public-event-card";

export const dynamic = "force-dynamic";

const communities = [
  { slug: "uds", title: "UDS" },
];

function sortByCalendarOrder(events: EventItem[]) {
  return [...events].sort((a, b) => {
    const startDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    if (startDiff !== 0) {
      return startDiff;
    }

    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });
}

function matchesSearch(event: EventItem, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [event.name, event.shortDescription, event.venueName, event.eventType].join(" ").toLowerCase();
  return haystack.includes(query);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();

  const eventGroups = await Promise.all(
    communities.map(async (community) => ({
      ...community,
      events: sortByCalendarOrder(await getPublicUpcomingEventsByCommunitySlug(community.slug)),
    })),
  );

  const filteredGroups = eventGroups.map((group) => ({
    ...group,
    events: group.events.filter((event) => matchesSearch(event, query)),
  }));
  const totalFilteredCount = filteredGroups.reduce((sum, group) => sum + group.events.length, 0);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 md:py-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#2b67a5] bg-gradient-to-br from-[#174b87] via-[#1859a9] to-[#0d3a6e] p-8 text-white shadow-[0_24px_70px_-38px_rgba(13,58,110,0.52)] md:p-12">
        <div className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-[#79afea]/40 blur-3xl" />
        <div className="absolute -bottom-36 right-1/4 -z-10 h-64 w-64 rounded-full bg-[#4b8de0]/35 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c4dcf8]">UDS · Community events</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white md:text-5xl">
          Discover events and volunteer opportunities.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d4e4f7] md:text-base">
          Browse upcoming public events, open the event page for details, and sign up as a volunteer.
          Admins can still reach the management area from the login button above.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-[#dce6f2] bg-white/95 p-4 shadow-[0_10px_30px_-24px_rgba(23,54,88,0.25)]">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center" method="get" action="/">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search events by name, location, type, or description"
            className="w-full rounded-xl border border-[#d5e1ef] bg-[#f8fafd] px-4 py-3 text-sm text-[#172f4d] placeholder:text-[#8fa0b6] focus:border-[#8eb0dc] focus:outline-none focus:ring-4 focus:ring-[#d9e7f7]/70"
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="rounded-full bg-[#205b53] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[#205b53]/15 hover:bg-[#17473f]">
              Search
            </button>
            {query ? (
              <Link href="/" className="rounded-full border border-[#e1e9e3] px-4 py-3 text-sm font-medium text-[#52645e] hover:bg-[#f5f8f5]">
                Clear
              </Link>
            ) : null}
          </div>
        </form>
        <p className="mt-3 px-1 text-xs text-[#71839a]">
          Showing {totalFilteredCount} event{totalFilteredCount === 1 ? "" : "s"} in calendar order.
        </p>
      </section>

      <section className="mt-8 space-y-8">
        {filteredGroups.map((group) => (
          <div key={group.slug}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172f4d]">{group.title}</h2>
                <p className="mt-1 text-sm text-[#71839a]">Published and upcoming events for this community.</p>
              </div>
              <Link href={`/c/${group.slug}/events`} className="text-sm font-semibold text-[#416fa7] underline-offset-4 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 grid auto-rows-fr items-stretch justify-items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.events.length > 0 ? (
                group.events.map((event) => (
                  <PublicEventCard
                    key={event.id}
                    event={event}
                    href={`/c/${group.slug}/events/${event.id}`}
                  />
                ))
              ) : (
                <div className="w-full rounded-2xl border border-dashed border-[#b8cce5] bg-white/75 p-6 text-sm text-[#71839a] md:col-span-2 xl:col-span-3">
                  {query ? "No events match your search." : "No upcoming events right now."}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
