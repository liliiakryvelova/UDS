import EventSignupForm from "@/components/event-signup-form";
import AdminEventQuickActions from "@/components/admin-event-quick-actions";
import EventVolunteerList from "@/components/event-volunteer-list";
import { notFound } from "next/navigation";
import Link from "next/link";
import { hasAdminPageSession } from "@/lib/auth/admin-guard";
import { getEventById, getRegistrationsByEventId, getSlotsByEventId } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

function formatDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function eventTypeLabel(eventType: string) {
  return eventType.charAt(0).toUpperCase() + eventType.slice(1);
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ communitySlug: string; eventId: string }>;
}) {
  const { communitySlug, eventId } = await params;
  const isAdminLoggedIn = await hasAdminPageSession();
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const [eventSlots, registrations] = await Promise.all([
    getSlotsByEventId(event.id),
    getRegistrationsByEventId(event.id),
  ]);
  const confirmedRegistrations = registrations.filter((registration) => registration.status === "confirmed");

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <Link href={`/c/${communitySlug}/events`} className="text-sm text-slate-500 transition hover:text-slate-900">
        {"<- Back to events"}
      </Link>

      <section className="mt-5 overflow-hidden rounded-[2rem] border border-sky-200 bg-white shadow-sm">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_0.7fr] lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span className="rounded-full bg-sky-800 px-3 py-1 text-white">{eventTypeLabel(event.eventType)}</span>
              <span>{event.status.replace("_", " ")}</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{event.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{event.fullDescription}</p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="rounded-full bg-sky-50 px-4 py-2 ring-1 ring-sky-100">{formatDateRange(event.startDate, event.endDate)}</span>
              <span className="rounded-full bg-sky-50 px-4 py-2 ring-1 ring-sky-100">{event.timezone}</span>
              <span className="rounded-full bg-sky-50 px-4 py-2 ring-1 ring-sky-100">Registration closes {formatDateTime(event.registrationDeadline, event.timezone)}</span>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-6 text-slate-900">
            <p className="text-sm uppercase tracking-[0.2em] text-sky-700">Event details</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-sky-700">Location</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{event.venueName}</dd>
                <dd className="text-slate-700">{event.fullAddress}</dd>
              </div>
              <div>
                <dt className="text-sky-700">Captain</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{event.captainName ?? "TBD"}</dd>
              </div>
              <div>
                <dt className="text-sky-700">Volunteer slots</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{eventSlots.length} available shift{eventSlots.length === 1 ? "" : "s"}</dd>
              </div>
              <div>
                <dt className="text-sky-700">What to bring</dt>
                <dd className="mt-1 text-base font-medium text-slate-900">{event.supplies.length > 0 ? event.supplies.join(", ") : "No supplies listed yet"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {isAdminLoggedIn ? <AdminEventQuickActions eventId={event.id} eventName={event.name} /> : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Why this event matters</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {event.shortDescription}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4 ring-1 ring-sky-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dates</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{formatDateRange(event.startDate, event.endDate)}</p>
            </div>
            <div className="rounded-xl bg-white p-4 ring-1 ring-sky-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Timezone</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{event.timezone}</p>
            </div>
            <div className="rounded-xl bg-white p-4 ring-1 ring-sky-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Captain</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{event.captainName ?? "TBD"}</p>
            </div>
            <div className="rounded-xl bg-white p-4 ring-1 ring-sky-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Supplies</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{event.supplies.length > 0 ? event.supplies.join(", ") : "None listed"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Shift and role availability</h2>
          <div className="mt-4 space-y-3">
            {eventSlots.length > 0 ? (
              eventSlots.map((slot) => (
                <div key={slot.id} className="rounded-xl border border-sky-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {slot.slotDate} | {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{slot.roleName}</p>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
                      Need {slot.peopleNeeded}
                    </span>
                  </div>
                  {slot.meetingPoint ? <p className="mt-3 text-xs text-slate-500">Meet at {slot.meetingPoint}</p> : null}
                  {slot.instructions ? <p className="mt-1 text-xs text-slate-500">{slot.instructions}</p> : null}
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                Volunteer shifts have not been added yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <EventVolunteerList
        registrations={confirmedRegistrations}
        slots={eventSlots}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <EventSignupForm eventId={event.id} slots={eventSlots} />
    </main>
  );
}
