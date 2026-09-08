import { hasAdminApiSession } from "@/lib/auth/admin-guard";
import { deleteEventSlot, updateEventSlot } from "@/lib/domain/store";

interface UpdateSlotBody {
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  roleName?: string;
  peopleNeeded?: number;
  meetingPoint?: string;
  instructions?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slotId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slotId } = await params;
  const body = (await request.json()) as UpdateSlotBody;

  const updated = await updateEventSlot(slotId, {
    slotDate: body.slotDate,
    startTime: body.startTime,
    endTime: body.endTime,
    roleName: body.roleName,
    peopleNeeded: body.peopleNeeded !== undefined ? Number(body.peopleNeeded) : undefined,
    meetingPoint: body.meetingPoint,
    instructions: body.instructions,
  });

  if (!updated) {
    return Response.json({ error: "Slot not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slotId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slotId } = await params;
  const deleted = await deleteEventSlot(slotId);

  if (!deleted) {
    return Response.json({ error: "Slot not found" }, { status: 404 });
  }

  return Response.json(deleted);
}