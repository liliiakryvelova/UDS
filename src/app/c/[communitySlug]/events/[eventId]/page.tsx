import { notFound } from "next/navigation";
import { getEventById, getSlotsByEventId } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ communitySlug: string; eventId: string }>;
}) {
  const { communitySlug, eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const eventSlots = await getSlotsByEventId(event.id);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <a href={`/c/${communitySlug}/events`} className="text-sm text-slate-500">
        {"<- Back to events"}
      </a>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">{event.name}</h1>
      <p className="mt-3 max-w-2xl text-slate-700">{event.fullDescription}</p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Shift and Role Availability</h2>
        <div className="mt-4 space-y-3">
          {eventSlots.map((slot) => (
            <div key={slot.id} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {slot.slotDate} | {slot.startTime} - {slot.endTime}
              </p>
              <p className="text-sm text-slate-700">{slot.roleName}</p>
              <p className="text-xs text-slate-500">Capacity: {slot.peopleNeeded}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
