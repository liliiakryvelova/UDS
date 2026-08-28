import { hasAdminApiSession } from "@/lib/auth/admin-guard";
import { cancelRegistrationById, getRegistrationById, updateRegistrationById } from "@/lib/domain/store";

interface UpdateRegistrationBody {
  fullName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  slotId?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ registrationId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { registrationId } = await params;
  const record = await getRegistrationById(registrationId);

  if (!record) {
    return Response.json({ error: "Registration not found" }, { status: 404 });
  }

  return Response.json(record);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ registrationId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { registrationId } = await params;
  const payload = (await request.json()) as UpdateRegistrationBody;

  try {
    const updated = await updateRegistrationById(registrationId, payload);

    if (!updated) {
      return Response.json({ error: "Registration not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_NOT_FOUND") {
      return Response.json({ error: "Slot not found" }, { status: 404 });
    }

    throw error;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ registrationId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { registrationId } = await params;
  const cancelled = await cancelRegistrationById(registrationId);

  if (!cancelled) {
    return Response.json({ error: "Registration not found" }, { status: 404 });
  }

  return Response.json(cancelled);
}
