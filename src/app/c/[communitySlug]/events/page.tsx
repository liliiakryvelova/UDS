import Link from "next/link";
import { getUpcomingPublishedEventsByCommunitySlug } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

export default async function CommunityEventsPage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;
  const items = await getUpcomingPublishedEventsByCommunitySlug(communitySlug);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{communitySlug.toUpperCase()} Events</h1>
      <p className="mt-2 text-sm text-slate-600">Published and upcoming events for this community.</p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((event) => (
          <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{event.eventType}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{event.name}</h2>
            <p className="mt-2 text-sm text-slate-700">{event.shortDescription}</p>
            <p className="mt-3 text-xs text-slate-600">
              {event.startDate} - {event.endDate} | {event.venueName}
            </p>
            <Link
              href={`/c/${communitySlug}/events/${event.id}`}
              className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Open Event
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
