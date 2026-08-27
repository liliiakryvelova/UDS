import { getRegistrationsByEventId } from "@/lib/domain/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const records = await getRegistrationsByEventId(eventId);
  return Response.json({ items: records, count: records.length });
}
