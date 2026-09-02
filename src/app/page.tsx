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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-sky-900 to-blue-700 p-8 text-white shadow-lg md:p-12">
        <p className="text-xs uppercase tracking-[0.18em] text-sky-100">UDS Public Dashboard</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          Discover events and volunteer opportunities.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-50 md:text-base">
          Browse upcoming public events, open the event page for details, and sign up as a volunteer.
          Admins can still reach the management area from the login button above.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center" method="get" action="/">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search events by name, location, type, or description"
            className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white">
              Search
            </button>
            {query ? (
              <Link href="/" className="rounded-full border border-sky-200 px-4 py-2 text-sm font-medium text-slate-700">
                Clear
              </Link>
            ) : null}
          </div>
        </form>
        <p className="mt-3 text-sm text-slate-600">
          Showing {totalFilteredCount} event{totalFilteredCount === 1 ? "" : "s"} in calendar order.
        </p>
      </section>

      <section className="mt-8 space-y-8">
        {filteredGroups.map((group) => (
          <div key={group.slug}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">{group.title}</h2>
                <p className="mt-1 text-sm text-slate-600">Published and upcoming events for this community.</p>
              </div>
              <Link href={`/c/${group.slug}/events`} className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.events.length > 0 ? (
                group.events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/c/${group.slug}/events/${event.id}`}
                    className="overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {event.bannerImageUrl ? (
                      <img
                        src={event.bannerImageUrl}
                        alt={`${event.name} banner`}
                        className="h-44 w-full object-cover"
                      />
                    ) : null}

                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.12em] text-sky-700">{event.eventType}</p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">{event.name}</h3>
                      <p className="mt-2 text-sm text-slate-700">{event.shortDescription}</p>
                      <p className="mt-3 text-xs text-slate-600">
                        {event.startDate} - {event.endDate} | {event.venueName}
                      </p>
                      <span className="mt-4 inline-flex rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition group-hover:bg-sky-900">
                        Open Event
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50 p-5 text-sm text-slate-600">
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
