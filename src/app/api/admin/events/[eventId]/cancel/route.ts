import { hasAdminApiSession } from "@/lib/auth/admin-guard";
import { cancelAdminEvent } from "@/lib/domain/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const event = await cancelAdminEvent(eventId);

  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  return Response.json({ event });
}