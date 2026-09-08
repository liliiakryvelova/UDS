import { hasAdminApiSession } from "@/lib/auth/admin-guard";
import { createEventSlot } from "@/lib/domain/store";

interface CreateSlotBody {
  slotDate: string;
  startTime: string;
  endTime: string;
  roleName: string;
  peopleNeeded: number;
  meetingPoint?: string;
  instructions?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const body = (await request.json()) as CreateSlotBody;

  if (!body.slotDate || !body.startTime || !body.endTime || !body.roleName || !body.peopleNeeded) {
    return Response.json({ error: "Missing required slot fields" }, { status: 400 });
  }

  if (Number.isNaN(new Date(body.slotDate).getTime())) {
    return Response.json({ error: "Invalid slot date" }, { status: 400 });
  }

  try {
    const slot = await createEventSlot({
      eventId,
      slotDate: body.slotDate,
      startTime: body.startTime,
      endTime: body.endTime,
      roleName: body.roleName,
      peopleNeeded: Number(body.peopleNeeded),
      meetingPoint: body.meetingPoint,
      instructions: body.instructions,
    });

    return Response.json({ slot }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EVENT_NOT_FOUND") {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    throw error;
  }
}