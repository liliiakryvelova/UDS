import { getUpcomingPublishedEventsByCommunitySlug } from "@/lib/domain/store";
import Link from "next/link";

export const dynamic = "force-dynamic";

const communities = [
  { slug: "uds", title: "UDS" },
];

export default async function Home() {
  const eventGroups = await Promise.all(
    communities.map(async (community) => ({
      ...community,
      events: await getUpcomingPublishedEventsByCommunitySlug(community.slug),
    })),
  );

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

      <section className="mt-8 space-y-8">
        {eventGroups.map((group) => (
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
                    className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="text-xs uppercase tracking-[0.12em] text-sky-700">{event.eventType}</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">{event.name}</h3>
                    <p className="mt-2 text-sm text-slate-700">{event.shortDescription}</p>
                    <p className="mt-3 text-xs text-slate-600">
                      {event.startDate} - {event.endDate} | {event.venueName}
                    </p>
                    <span className="mt-4 inline-flex rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition group-hover:bg-sky-900">
                      Open Event
                    </span>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50 p-5 text-sm text-slate-600">
                  No upcoming events right now.
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
