import { hasAdminApiSession } from "@/lib/auth/admin-guard";
import { getRegistrationsByEventId } from "@/lib/domain/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const records = await getRegistrationsByEventId(eventId);
  return Response.json({ items: records, count: records.length });
}
