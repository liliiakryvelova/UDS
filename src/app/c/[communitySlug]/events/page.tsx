import { getPublicUpcomingEventsByCommunitySlug } from "@/lib/domain/public-events";
import PublicEventCard from "@/components/public-event-card";

export const dynamic = "force-dynamic";

export default async function CommunityEventsPage({
  params,
}: {
  params: Promise<{ communitySlug: string }>;
}) {
  const { communitySlug } = await params;
  const items = await getPublicUpcomingEventsByCommunitySlug(communitySlug);
  const title = communitySlug === "uds" ? "UDS" : communitySlug.toUpperCase();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#2b67a5] bg-gradient-to-br from-[#174b87] via-[#1859a9] to-[#0d3a6e] p-8 text-white shadow-[0_24px_70px_-38px_rgba(13,58,110,0.52)] md:p-10">
        <div className="absolute -right-20 -top-24 -z-10 h-56 w-56 rounded-full bg-[#79afea]/40 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 -z-10 h-56 w-56 rounded-full bg-[#4b8de0]/35 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c4dcf8]">Community events</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{title} Events</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d4e4f7] md:text-base">
            Published and upcoming events for this community. Open any card to view details and register as a volunteer.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-[#526b89] ring-1 ring-[#dce6f2]">
            <span className="font-semibold text-[#172f4d]">{items.length}</span>
            upcoming event{items.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      <section className="mt-8 grid auto-rows-fr items-stretch justify-items-center gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.length > 0 ? (
          items.map((event) => (
            <PublicEventCard
              key={event.id}
              event={event}
              href={`/c/${communitySlug}/events/${event.id}`}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-[#b8cce5] bg-white/75 p-8 text-sm text-[#71839a] md:col-span-2 xl:col-span-3">
            There are no published upcoming events yet. Check back soon.
          </div>
        )}
      </section>
    </main>
  );
}
