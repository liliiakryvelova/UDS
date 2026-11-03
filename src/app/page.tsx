import { getUpcomingPublishedEventsByCommunitySlug } from "@/lib/domain/store";
import Link from "next/link";
import type { EventItem } from "@/lib/domain/types";

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
      events: sortByCalendarOrder(await getUpcomingPublishedEventsByCommunitySlug(community.slug)),
    })),
  );

  const filteredGroups = eventGroups.map((group) => ({
    ...group,
    events: group.events.filter((event) => matchesSearch(event, query)),
  }));
  const totalFilteredCount = filteredGroups.reduce((sum, group) => sum + group.events.length, 0);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 md:py-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#e3eae4] bg-gradient-to-br from-[#eef4ef] via-[#f5f7f3] to-[#f7eee7] p-8 shadow-[0_18px_50px_-38px_rgba(24,58,55,0.28)] md:p-12">
        <div className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-[#d6e8df]/65 blur-3xl" />
        <div className="absolute -bottom-36 right-1/4 -z-10 h-64 w-64 rounded-full bg-[#f0dfd2]/70 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52786d]">UDS · Community events</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#183a37] md:text-5xl">
          Discover events and volunteer opportunities.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5e716b] md:text-base">
          Browse upcoming public events, open the event page for details, and sign up as a volunteer.
          Admins can still reach the management area from the login button above.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e3eae4] bg-white/90 p-4 shadow-[0_10px_30px_-24px_rgba(24,58,55,0.25)]">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center" method="get" action="/">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search events by name, location, type, or description"
            className="w-full rounded-xl border border-[#e1e9e3] bg-[#fbfcfa] px-4 py-3 text-sm text-[#183a37] placeholder:text-[#9aa8a2] focus:border-[#9bb9aa] focus:outline-none focus:ring-4 focus:ring-[#dcebe2]/60"
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
        <p className="mt-3 px-1 text-xs text-[#798780]">
          Showing {totalFilteredCount} event{totalFilteredCount === 1 ? "" : "s"} in calendar order.
        </p>
      </section>

      <section className="mt-8 space-y-8">
        {filteredGroups.map((group) => (
          <div key={group.slug}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#183a37]">{group.title}</h2>
                <p className="mt-1 text-sm text-[#71817c]">Published and upcoming events for this community.</p>
              </div>
              <Link href={`/c/${group.slug}/events`} className="text-sm font-semibold text-[#397166] underline-offset-4 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 grid auto-rows-fr items-stretch justify-items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.events.length > 0 ? (
                group.events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/c/${group.slug}/events/${event.id}`}
                    className="group flex min-h-[22rem] w-full max-w-sm self-stretch flex-col overflow-hidden rounded-[1.4rem] border border-[#e2e9e3] bg-white shadow-[0_12px_30px_-24px_rgba(24,58,55,0.35)] transition duration-200 hover:-translate-y-1 hover:border-[#cbdcd1] hover:shadow-[0_20px_40px_-25px_rgba(24,58,55,0.28)]"
                  >
                    {event.bannerImageUrl ? (
                      <img
                        src={event.bannerImageUrl}
                        alt={`${event.name} banner`}
                        className="h-36 w-full object-cover"
                      />
                    ) : null}

                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64877a]">{event.eventType}</p>
                      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[#183a37]">{event.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#687972]">{event.shortDescription}</p>
                      <p className="mt-3 text-xs leading-5 text-[#7b8982]">
                        {event.startDate} - {event.endDate} | {event.venueName}
                      </p>
                      <span className="mt-auto inline-flex self-center rounded-full bg-[#205b53] px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-[#17473f]">
                        Open Event
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full rounded-2xl border border-dashed border-[#cbdcd1] bg-white/75 p-6 text-sm text-[#71817c] md:col-span-2 xl:col-span-3">
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
