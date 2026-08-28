import { notFound } from "next/navigation";
import Link from "next/link";
import AdminEventEditor from "@/components/admin-event-editor";
import AdminVolunteerList from "@/components/admin-volunteer-list";
import { ensureAdminPageSession } from "@/lib/auth/admin-guard";
import { getEventById, getRegistrationsByEventId, getSlotsByEventId } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

export default async function AdminEventManagePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  await ensureAdminPageSession(`/admin/events/${eventId}`);

  const event = await getEventById(eventId);
  if (!event) {
    notFound();
  }

  const slots = await getSlotsByEventId(event.id);
  const registrations = await getRegistrationsByEventId(event.id);
  const primarySlot = slots[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Admin Event</p>
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Update details, manage the volunteer slot, or delete this event.
          </p>
        </div>

        <Link href="/admin/events" className="rounded-full border border-slate-300 px-4 py-2 text-sm">
          Back to dashboard
        </Link>
      </div>

      <AdminEventEditor event={event} slot={primarySlot} />

      <AdminVolunteerList registrations={registrations} slots={slots} />
    </main>
  );
}
