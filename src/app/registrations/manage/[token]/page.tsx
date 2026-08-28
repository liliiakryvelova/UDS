import Link from "next/link";
import { getCommunityById, getEventById, getRegistrationByManageToken, getSlotsByEventId } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

function slotLabel(slotDate: string, startTime: string, endTime: string, roleName: string) {
  return `${slotDate} | ${startTime} - ${endTime} | ${roleName}`;
}

export default async function ManageRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const registration = await getRegistrationByManageToken(token);
  const event = registration ? await getEventById(registration.eventId) : undefined;
  const slots = event ? await getSlotsByEventId(event.id) : [];
  const community = event ? await getCommunityById(event.communityId) : undefined;
  const assignedSlot = slots.find((slot) => slot.id === registration?.slotId);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Registration confirmed</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your volunteer signup is saved. You can review the details below and return to the event anytime.
      </p>

      <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        {!registration ? (
          <p className="text-sm text-red-600">Registration not found for this token.</p>
        ) : (
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Signed up as</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{registration.fullName}</p>
              <p className="mt-1 text-slate-700">{registration.email}</p>
              <p className="text-slate-700">{registration.phone}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Event</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{event?.name ?? "Event"}</p>
                <p className="mt-1 text-sm text-slate-600">{community?.name ?? "Community"}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Volunteer shift</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {assignedSlot
                    ? slotLabel(assignedSlot.slotDate, assignedSlot.startTime, assignedSlot.endTime, assignedSlot.roleName)
                    : "Assigned shift"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{registration.status}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Waiver</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {registration.consentWaiverAccepted ? "Accepted" : "Not accepted"}
                </p>
              </div>
            </div>

            {registration.notes ? (
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notes</p>
                <p className="mt-2 text-sm text-slate-700">{registration.notes}</p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Back to dashboard
        </Link>
        {event && community ? (
          <Link
            href={`/c/${community.slug}/events/${event.id}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            View event page
          </Link>
        ) : null}
      </div>
    </main>
  );
}
