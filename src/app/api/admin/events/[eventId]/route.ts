import { getEventById } from "@/lib/domain/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  return Response.json(event);
}

export async function PATCH() {
  return Response.json({ message: "Not implemented yet." }, { status: 501 });
}

export async function DELETE() {
  return Response.json({ message: "Not implemented yet." }, { status: 501 });
}
