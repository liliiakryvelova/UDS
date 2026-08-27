import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { EventItem, Registration, ShiftRoleSlot } from "@/lib/domain/types";

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function hashManageToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function mapEvent(record: {
  id: string;
  communityId: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  eventType: string;
  status: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  registrationDeadline: Date;
  venueName: string;
  fullAddress: string;
}): EventItem {
  return {
    id: record.id,
    communityId: record.communityId,
    name: record.name,
    shortDescription: record.shortDescription,
    fullDescription: record.fullDescription,
    eventType: record.eventType as EventItem["eventType"],
    status: record.status as EventItem["status"],
    startDate: formatDateOnly(record.startDate),
    endDate: formatDateOnly(record.endDate),
    timezone: record.timezone,
    registrationDeadline: record.registrationDeadline.toISOString(),
    venueName: record.venueName,
    fullAddress: record.fullAddress,
  };
}

function mapSlot(record: {
  id: string;
  eventId: string;
  slotDate: Date;
  startTime: string;
  endTime: string;
  roleName: string;
  peopleNeeded: number;
  meetingPoint: string | null;
  instructions: string | null;
}): ShiftRoleSlot {
  return {
    id: record.id,
    eventId: record.eventId,
    slotDate: formatDateOnly(record.slotDate),
    startTime: record.startTime,
    endTime: record.endTime,
    roleName: record.roleName,
    peopleNeeded: record.peopleNeeded,
    meetingPoint: record.meetingPoint ?? undefined,
    instructions: record.instructions ?? undefined,
  };
}

function mapRegistration(record: {
  id: string;
  eventId: string;
  slotId: string;
  communityId: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string | null;
  consentWaiverAccepted: boolean;
  status: string;
  manageTokenHash: string;
  createdAt: Date;
  updatedAt: Date;
}): Registration {
  return {
    id: record.id,
    eventId: record.eventId,
    slotId: record.slotId,
    communityId: record.communityId,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    notes: record.notes ?? undefined,
    consentWaiverAccepted: record.consentWaiverAccepted,
    status: record.status as Registration["status"],
    manageTokenHash: record.manageTokenHash,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function getCommunityBySlug(slug: string) {
  return prisma.community.findFirst({ where: { slug, status: "active" } });
}

export async function getUpcomingPublishedEventsByCommunitySlug(slug: string): Promise<EventItem[]> {
  const records = await prisma.event.findMany({
    where: {
      community: { slug, status: "active" },
      status: "published",
      startDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: [{ startDate: "asc" }],
  });

  return records.map(mapEvent);
}

export async function getAdminEvents(): Promise<EventItem[]> {
  const records = await prisma.event.findMany({ orderBy: [{ startDate: "asc" }] });
  return records.map(mapEvent);
}

export async function getEventById(eventId: string): Promise<EventItem | undefined> {
  const record = await prisma.event.findUnique({ where: { id: eventId } });
  return record ? mapEvent(record) : undefined;
}

export async function getSlotsByEventId(eventId: string): Promise<ShiftRoleSlot[]> {
  const records = await prisma.eventSlot.findMany({
    where: { eventId, isActive: true },
    orderBy: [{ slotDate: "asc" }, { startTime: "asc" }],
  });

  return records.map(mapSlot);
}

export async function getRegistrationsByEventId(eventId: string): Promise<Registration[]> {
  const records = await prisma.registration.findMany({
    where: { eventId },
    orderBy: [{ createdAt: "desc" }],
  });

  return records.map(mapRegistration);
}

export async function countConfirmedRegistrationsForSlot(slotId: string): Promise<number> {
  return prisma.registration.count({
    where: { slotId, status: "confirmed" },
  });
}

export async function getRegistrationByManageToken(token: string): Promise<Registration | undefined> {
  const record = await prisma.registration.findUnique({
    where: { manageTokenHash: hashManageToken(token) },
  });

  return record ? mapRegistration(record) : undefined;
}

export async function createRegistration(input: {
  eventId: string;
  slotId: string;
  communityId: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  consentWaiverAccepted: boolean;
}) {
  const manageToken = randomUUID();
  const manageTokenHash = hashManageToken(manageToken);

  const registration = await prisma.$transaction(async (tx) => {
    const slot = await tx.eventSlot.findUnique({ where: { id: input.slotId } });

    if (!slot || slot.eventId !== input.eventId || !slot.isActive) {
      throw new Error("SLOT_NOT_FOUND");
    }

    const confirmedCount = await tx.registration.count({
      where: { slotId: input.slotId, status: "confirmed" },
    });

    if (confirmedCount >= slot.peopleNeeded) {
      throw new Error("SLOT_FULL");
    }

    return tx.registration.create({
      data: {
        eventId: input.eventId,
        slotId: input.slotId,
        communityId: input.communityId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        notes: input.notes,
        consentWaiverAccepted: input.consentWaiverAccepted,
        status: "confirmed",
        manageTokenHash,
      },
    });
  });

  return {
    registration: mapRegistration(registration),
    manageToken,
  };
}

export async function updateRegistrationByToken(
  token: string,
  input: Partial<Pick<Registration, "fullName" | "email" | "phone" | "notes" | "slotId">>,
) {
  const manageTokenHash = hashManageToken(token);

  const existing = await prisma.registration.findUnique({
    where: { manageTokenHash },
  });

  if (!existing) {
    return undefined;
  }

  const updateData: Prisma.RegistrationUpdateInput = {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    notes: input.notes,
  };

  if (input.slotId) {
    updateData.slot = { connect: { id: input.slotId } };
  }

  const updated = await prisma.registration.update({
    where: { manageTokenHash },
    data: updateData,
  });

  return mapRegistration(updated);
}

export async function cancelRegistrationByToken(token: string) {
  const manageTokenHash = hashManageToken(token);

  const existing = await prisma.registration.findUnique({
    where: { manageTokenHash },
  });

  if (!existing) {
    return undefined;
  }

  const cancelled = await prisma.registration.update({
    where: { manageTokenHash },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  return mapRegistration(cancelled);
}
