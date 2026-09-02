import { hasAdminApiSession } from "@/lib/auth/admin-guard";
import { deleteAdminEvent, getEventById, updateAdminEvent } from "@/lib/domain/store";

interface UpdateEventBody {
  communityId: string;
  name: string;
  eventType: "tournament" | "practice" | "festival" | "volunteer" | "workshop";
  status: "draft" | "published" | "registration_closed";
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  timezone: string;
  bannerImageUrl?: string;
  place: string;
  captainName?: string;
  shortDescription?: string;
  fullDescription?: string;
  supplies: string[];
  slotId?: string;
  slotStartTime: string;
  slotEndTime: string;
  peopleNeeded: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  return Response.json(event);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const body = (await request.json()) as UpdateEventBody;

  if (!body.name || !body.startDate || !body.endDate || !body.registrationDeadline || !body.place) {
    return Response.json({ error: "Missing required event fields" }, { status: 400 });
  }

  const event = await updateAdminEvent({
    eventId,
    communityId: body.communityId,
    name: body.name,
    eventType: body.eventType,
    status: body.status,
    startDate: body.startDate,
    endDate: body.endDate,
    registrationDeadline: body.registrationDeadline,
    timezone: body.timezone || "Europe/Kyiv",
    bannerImageUrl: body.bannerImageUrl,
    place: body.place,
    captainName: body.captainName,
    shortDescription: body.shortDescription,
    fullDescription: body.fullDescription,
    supplies: Array.isArray(body.supplies) ? body.supplies : [],
    slotId: body.slotId,
    slotStartTime: body.slotStartTime || "09:00",
    slotEndTime: body.slotEndTime || "12:00",
    peopleNeeded: Number(body.peopleNeeded) > 0 ? Number(body.peopleNeeded) : 5,
  });

  return Response.json({ event });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const deleted = await deleteAdminEvent(eventId);

  if (!deleted) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  return Response.json({ deleted: true });
}
