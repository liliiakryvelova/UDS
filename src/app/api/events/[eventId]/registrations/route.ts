import {
  countConfirmedRegistrationsForSlot,
  createRegistration,
  getEventById,
  getSlotsByEventId,
} from "@/lib/domain/store";

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

  if (!payload.consentWaiverAccepted) {
    return Response.json({ error: "Consent is required" }, { status: 400 });
  }

  const slot = (await getSlotsByEventId(eventId)).find((record) => record.id === payload.slotId);

  if (!slot) {
    return Response.json({ error: "Slot not found" }, { status: 404 });
  }

  const confirmedCount = await countConfirmedRegistrationsForSlot(slot.id);

  if (confirmedCount >= slot.peopleNeeded) {
    return Response.json({ error: "Slot is full" }, { status: 409 });
  }

  const result = await createRegistration({
    eventId,
    slotId: payload.slotId,
    communityId: event.communityId,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    notes: payload.notes,
    consentWaiverAccepted: payload.consentWaiverAccepted,
  });

  return Response.json({
    registration: result.registration,
    manageUrl: `/registrations/manage/${result.manageToken}`,
  });
}
