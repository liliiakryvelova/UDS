import { hasAdminApiSession } from "@/lib/auth/admin-guard";
import { createAdminEvent, getAdminEvents } from "@/lib/domain/store";

interface CreateEventBody {
  communityId: string;
  name: string;
  eventType: "tournament" | "practice" | "festival" | "volunteer" | "workshop";
  status: "draft" | "published";
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  timezone: string;
  place: string;
  captainName?: string;
  shortDescription?: string;
  fullDescription?: string;
  supplies: string[];
  slotStartTime: string;
  slotEndTime: string;
  peopleNeeded: number;
}

export async function GET(request: Request) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getAdminEvents();
  return Response.json({ items: events, count: events.length });
}

export async function POST(request: Request) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateEventBody;

  if (!body.name || !body.startDate || !body.endDate || !body.registrationDeadline || !body.place) {
    return Response.json({ error: "Missing required event fields" }, { status: 400 });
  }

  if (Number.isNaN(new Date(body.startDate).getTime()) || Number.isNaN(new Date(body.endDate).getTime())) {
    return Response.json({ error: "Invalid date fields" }, { status: 400 });
  }

  const event = await createAdminEvent({
    communityId: body.communityId,
    name: body.name,
    eventType: body.eventType,
    status: body.status,
    startDate: body.startDate,
    endDate: body.endDate,
    registrationDeadline: body.registrationDeadline,
    timezone: body.timezone || "Europe/Kyiv",
    place: body.place,
    captainName: body.captainName,
    shortDescription: body.shortDescription,
    fullDescription: body.fullDescription,
    supplies: Array.isArray(body.supplies) ? body.supplies : [],
    slotStartTime: body.slotStartTime || "09:00",
    slotEndTime: body.slotEndTime || "12:00",
    peopleNeeded: Number(body.peopleNeeded) > 0 ? Number(body.peopleNeeded) : 5,
  });

  return Response.json({ event }, { status: 201 });
}
