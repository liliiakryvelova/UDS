import { getRegistrationsByEventId } from "@/lib/domain/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const records = await getRegistrationsByEventId(eventId);

  const header = "id,fullName,email,phone,status,slotId";
  const rows = records.map((registration) => {
    return [
      registration.id,
      registration.fullName,
      registration.email,
      registration.phone,
      registration.status,
      registration.slotId,
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=event-${eventId}-registrations.csv`,
    },
  });
}
