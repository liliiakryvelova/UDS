import { hasAdminApiSession } from "@/lib/auth/admin-guard";
import { getRegistrationById, getEventById, getSlotsByEventId } from "@/lib/domain/store";
import { getCommunityById } from "@/lib/domain/store";
import { sendVolunteerReminderEmail } from "@/lib/notifications/volunteer-reminder-email";
import { getAppOrigin } from "@/lib/auth/password-reset";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ registrationId: string }> },
) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { registrationId } = await params;
  const registration = await getRegistrationById(registrationId);

  if (!registration) {
    return Response.json({ error: "Registration not found" }, { status: 404 });
  }

  if (registration.status === "cancelled") {
    return Response.json({ error: "This volunteer is no longer active." }, { status: 409 });
  }

  const event = await getEventById(registration.eventId);
  const slots = await getSlotsByEventId(registration.eventId);
  const slot = slots.find((record) => record.id === registration.slotId);
  const community = registration.communityId ? await getCommunityById(registration.communityId) : null;

  if (!event || !slot) {
    return Response.json({ error: "Event data not found" }, { status: 404 });
  }

  const appOrigin = getAppOrigin(request);
  const eventUrl = `${appOrigin}/c/${community?.slug ?? "events"}/events/${event.id}`;

  await sendVolunteerReminderEmail({
    to: registration.email,
    fullName: registration.fullName,
    eventName: event.name,
    communityName: community?.name,
    eventDateRange: `${event.startDate} - ${event.endDate}`,
    timezone: event.timezone,
    venueName: event.venueName,
    shiftLabel: `${slot.slotDate} | ${slot.startTime}-${slot.endTime} | ${slot.roleName}`,
    eventUrl,
  });

  return Response.json({ ok: true });
}
