import Link from "next/link";
import { ensureUserPageSession, getUserSessionIdentity } from "@/lib/auth/user-guard";
import { getUserEventRegistrations } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

function formatDateRange(startDate: string, endDate: string) {
  if (startDate === endDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

export default async function MyEventsPage() {
  await ensureUserPageSession("/my-events");
  const session = await getUserSessionIdentity();

  if (!session) {
    return null;
  }

  const registrations = await getUserEventRegistrations(session.email);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Volunteer dashboard</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">My Events</h1>
        <p className="mt-2 text-sm text-slate-600">All events where you are signed up with this account.</p>
        <p className="mt-1 text-sm text-slate-700">Signed in as {session.fullName}</p>
      </section>

      <section className="mt-6 grid auto-rows-fr items-stretch justify-items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
        {registrations.length > 0 ? (
          registrations.map((registration) => (
            <article key={registration.registrationId} className="flex min-h-[16rem] w-full max-w-sm self-stretch flex-col rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">{registration.eventName}</h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase text-sky-700 ring-1 ring-sky-200">
                  {registration.registrationStatus}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-700">
                {formatDateRange(registration.eventStartDate, registration.eventEndDate)} | {registration.eventTimezone}
              </p>
              <p className="mt-1 text-sm text-slate-700">{registration.eventVenueName}</p>
              <p className="mt-2 text-sm text-slate-700">
                Shift: {registration.slotDate} | {registration.slotStartTime}-{registration.slotEndTime} | {registration.slotRoleName}
              </p>

              <Link
                href={`/c/${registration.communitySlug}/events/${registration.eventId}`}
                className="mt-auto inline-flex self-center rounded-full border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Open Event
              </Link>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50 p-5 text-sm text-slate-600 md:col-span-2 xl:col-span-3">
            No registrations found for this account yet.
          </div>
        )}
      </section>
    </main>
  );
}
