import {
  createRegistration,
  getEventById,
  getSlotsByEventId,
} from "@/lib/domain/store";
import { getAppOrigin } from "@/lib/auth/password-reset";
import { sendEventRegistrationEmail } from "@/lib/notifications/event-registration-email";
import { Prisma } from "@prisma/client";

interface CreateRegistrationBody {
  slotId: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  consentWaiverAccepted: boolean;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  const payload = (await request.json()) as CreateRegistrationBody;

  const fullName = String(payload.fullName ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const phone = String(payload.phone ?? "").trim();
  const notes = payload.notes ? String(payload.notes).trim() : undefined;

  if (!payload.consentWaiverAccepted) {
    return Response.json({ error: "Consent is required" }, { status: 400 });
  }

  if (!fullName || !email || !phone || !payload.slotId) {
    return Response.json({ error: "Missing required registration fields" }, { status: 400 });
  }

  const slot = (await getSlotsByEventId(eventId)).find((record) => record.id === payload.slotId);

  if (!slot) {
    return Response.json({ error: "Slot not found" }, { status: 404 });
  }

  try {
    const result = await createRegistration({
      eventId,
      slotId: payload.slotId,
      communityId: event.communityId,
      fullName,
      email,
      phone,
      notes,
      consentWaiverAccepted: payload.consentWaiverAccepted,
    });

    const appOrigin = getAppOrigin(request);
    const manageUrl = `${appOrigin}/registrations/manage/${result.manageToken}`;
    const cancelUrl = `${appOrigin}/waitlist/cancel?token=${encodeURIComponent(result.manageToken)}`;
    const shiftLabel = `${slot.slotDate} | ${slot.startTime}-${slot.endTime} | ${slot.roleName}`;

    await sendEventRegistrationEmail({
      to: email,
      fullName,
      eventName: event.name,
      eventDateRange: `${event.startDate} - ${event.endDate}`,
      timezone: event.timezone,
      venueName: event.venueName,
      shiftLabel,
      notes,
      manageUrl,
      cancelUrl,
      registrationStatus: result.registration.status,
    });

    return Response.json({
      registration: result.registration,
      manageUrl: `/registrations/manage/${result.manageToken}`,
      waitlisted: result.registration.status === "waitlisted",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_NOT_FOUND") {
      return Response.json({ error: "Slot not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message === "ALREADY_REGISTERED") {
      return Response.json(
        { error: "You already have an active registration for this shift." },
        { status: 409 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json(
        { error: "You are already registered for this shift with this email." },
        { status: 409 },
      );
    }

    return Response.json({ error: "Could not register right now. Please try again." }, { status: 500 });
  }
}
