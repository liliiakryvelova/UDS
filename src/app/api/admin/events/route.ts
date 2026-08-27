import { getAdminEvents } from "@/lib/domain/store";

export async function GET() {
  const events = await getAdminEvents();
  return Response.json({ items: events, count: events.length });
}

export async function POST() {
  return Response.json(
    {
      message: "Not implemented yet. This endpoint will create events in persistent storage.",
    },
    { status: 501 },
  );
}
