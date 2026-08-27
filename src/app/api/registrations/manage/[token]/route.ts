import {
  cancelRegistrationByToken,
  getRegistrationByManageToken,
  updateRegistrationByToken,
} from "@/lib/domain/store";

interface UpdateRegistrationBody {
  fullName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  slotId?: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const record = await getRegistrationByManageToken(token);

  if (!record) {
    return Response.json({ error: "Registration not found" }, { status: 404 });
  }

  return Response.json(record);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const payload = (await request.json()) as UpdateRegistrationBody;

  const updated = await updateRegistrationByToken(token, payload);

  if (!updated) {
    return Response.json({ error: "Registration not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const cancelled = await cancelRegistrationByToken(token);

  if (!cancelled) {
    return Response.json({ error: "Registration not found" }, { status: 404 });
  }

  return Response.json(cancelled);
}
