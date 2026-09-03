import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from "@/lib/auth/password-reset";
import type {
  EventItem,
  Registration,
  ShiftRoleSlot,
  UserEventRegistration,
} from "@/lib/domain/types";

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
  bannerImageUrl: string | null;
  eventType: string;
  status: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  registrationDeadline: Date;
  venueName: string;
  fullAddress: string;
  captainName: string | null;
  supplies: string[];
}): EventItem {
  return {
    id: record.id,
    communityId: record.communityId,
    name: record.name,
    shortDescription: record.shortDescription,
    fullDescription: record.fullDescription,
    bannerImageUrl: record.bannerImageUrl ?? undefined,
    eventType: record.eventType as EventItem["eventType"],
    status: record.status as EventItem["status"],
    startDate: formatDateOnly(record.startDate),
    endDate: formatDateOnly(record.endDate),
    timezone: record.timezone,
    registrationDeadline: record.registrationDeadline.toISOString(),
    venueName: record.venueName,
    fullAddress: record.fullAddress,
    captainName: record.captainName ?? undefined,
    supplies: record.supplies,
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

export async function getCommunityById(communityId: string) {
  return prisma.community.findUnique({ where: { id: communityId } });
}

export async function getUpcomingPublishedEventsByCommunitySlug(slug: string): Promise<EventItem[]> {
  const records = await prisma.event.findMany({
    where: {
      community: { slug, status: "active" },
      status: "published",
      startDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
  });

  return records.map(mapEvent);
}

export async function getAdminEvents(): Promise<EventItem[]> {
  const records = await prisma.event.findMany({ orderBy: [{ startDate: "asc" }] });
  return records.map(mapEvent);
}

export async function createAdminEvent(input: {
  communityId: string;
  name: string;
  eventType: EventItem["eventType"];
  status: EventItem["status"];
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
  slotStartTime: string;
  slotEndTime: string;
  peopleNeeded: number;
}) {
  const event = await prisma.event.create({
    data: {
      communityId: input.communityId,
      name: input.name,
      shortDescription: input.shortDescription?.trim() || input.name,
      fullDescription: input.fullDescription?.trim() || input.shortDescription?.trim() || input.name,
      bannerImageUrl: input.bannerImageUrl?.trim() || null,
      eventType: input.eventType,
      status: input.status,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      timezone: input.timezone,
      registrationDeadline: new Date(input.registrationDeadline),
      venueName: input.place,
      fullAddress: input.place,
      captainName: input.captainName?.trim() || null,
      supplies: input.supplies,
      slots: {
        create: {
          slotDate: new Date(input.startDate),
          startTime: input.slotStartTime,
          endTime: input.slotEndTime,
          roleName: "Volunteer",
          peopleNeeded: input.peopleNeeded,
          meetingPoint: input.place,
          instructions: "Created by admin dashboard",
          isActive: true,
        },
      },
    },
  });

  return mapEvent(event);
}

export async function updateAdminEvent(input: {
  eventId: string;
  communityId: string;
  name: string;
  eventType: EventItem["eventType"];
  status: EventItem["status"];
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
}) {
  const existingEvent = await prisma.event.findUnique({
    where: { id: input.eventId },
    include: { slots: { orderBy: { createdAt: "asc" }, take: 1 } },
  });

  if (!existingEvent) {
    throw new Error("EVENT_NOT_FOUND");
  }

  const updatedEvent = await prisma.event.update({
    where: { id: input.eventId },
    data: {
      community: { connect: { id: input.communityId } },
      name: input.name,
      shortDescription: input.shortDescription?.trim() || input.name,
      fullDescription: input.fullDescription?.trim() || input.shortDescription?.trim() || input.name,
      bannerImageUrl: input.bannerImageUrl?.trim() || null,
      eventType: input.eventType,
      status: input.status,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      timezone: input.timezone,
      registrationDeadline: new Date(input.registrationDeadline),
      venueName: input.place,
      fullAddress: input.place,
      captainName: input.captainName?.trim() || null,
      supplies: input.supplies,
    },
  });

  const slot = existingEvent.slots[0];

  if (slot) {
    await prisma.eventSlot.update({
      where: { id: input.slotId ?? slot.id },
      data: {
        slotDate: new Date(input.startDate),
        startTime: input.slotStartTime,
        endTime: input.slotEndTime,
        peopleNeeded: input.peopleNeeded,
        meetingPoint: input.place,
        instructions: "Updated from admin dashboard",
      },
    });
  }

  return mapEvent(updatedEvent);
}

export async function deleteAdminEvent(eventId: string) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });

  if (!existing) {
    return false;
  }

  await prisma.event.delete({ where: { id: eventId } });
  return true;
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

export async function getRegistrationById(registrationId: string): Promise<Registration | undefined> {
  const record = await prisma.registration.findUnique({ where: { id: registrationId } });

  return record ? mapRegistration(record) : undefined;
}

export async function updateRegistrationById(
  registrationId: string,
  input: Partial<Pick<Registration, "fullName" | "email" | "phone" | "notes" | "slotId">>,
) {
  const existing = await prisma.registration.findUnique({ where: { id: registrationId } });

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
    const slot = await prisma.eventSlot.findUnique({ where: { id: input.slotId } });

    if (!slot || slot.eventId !== existing.eventId || !slot.isActive) {
      throw new Error("SLOT_NOT_FOUND");
    }

    updateData.slot = { connect: { id: input.slotId } };
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: updateData,
  });

  return mapRegistration(updated);
}

export async function cancelRegistrationById(registrationId: string) {
  const existing = await prisma.registration.findUnique({ where: { id: registrationId } });

  if (!existing) {
    return undefined;
  }

  const cancelled = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  return mapRegistration(cancelled);
}

export async function cancelRegistrationByIdForUser(registrationId: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.registration.findUnique({ where: { id: registrationId } });

  if (!existing) {
    return { ok: false as const, reason: "not_found" as const };
  }

  if (existing.email.trim().toLowerCase() !== normalizedEmail) {
    return { ok: false as const, reason: "forbidden" as const };
  }

  if (existing.status === "cancelled") {
    return { ok: true as const, registration: mapRegistration(existing) };
  }

  const cancelled = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });

  return { ok: true as const, registration: mapRegistration(cancelled) };
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
  const normalizedEmail = input.email.trim().toLowerCase();

  const registration = await prisma.$transaction(async (tx) => {
    const slot = await tx.eventSlot.findUnique({ where: { id: input.slotId } });

    if (!slot || slot.eventId !== input.eventId || !slot.isActive) {
      throw new Error("SLOT_NOT_FOUND");
    }

    const existingActiveRegistration = await tx.registration.findFirst({
      where: {
        slotId: input.slotId,
        email: { equals: normalizedEmail, mode: "insensitive" },
        status: { in: ["confirmed", "waitlisted", "checked_in"] },
      },
    });

    if (existingActiveRegistration) {
      throw new Error("ALREADY_REGISTERED");
    }

    const confirmedCount = await tx.registration.count({
      where: { slotId: input.slotId, status: "confirmed" },
    });

    const nextStatus = confirmedCount >= slot.peopleNeeded ? "waitlisted" : "confirmed";

    return tx.registration.create({
      data: {
        eventId: input.eventId,
        slotId: input.slotId,
        communityId: input.communityId,
        fullName: input.fullName,
        email: normalizedEmail,
        phone: input.phone,
        notes: input.notes,
        consentWaiverAccepted: input.consentWaiverAccepted,
        status: nextStatus,
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

export async function createVolunteerAccount(input: {
  communityId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  additionalInfo?: string;
  passwordHash: string;
}) {
  return prisma.volunteerAccount.create({
    data: {
      communityId: input.communityId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      additionalInfo: input.additionalInfo || null,
      passwordHash: input.passwordHash,
    },
  });
}

export async function findVolunteerAccountByEmail(email: string) {
  return prisma.volunteerAccount.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
}

export async function issuePasswordResetToken(volunteerId: string) {
  const token = createPasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({
    where: {
      volunteerId,
      OR: [{ usedAt: null }, { expiresAt: { lt: new Date() } }],
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      volunteerId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function isPasswordResetTokenValid(token: string) {
  const tokenHash = hashPasswordResetToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { usedAt: true, expiresAt: true },
  });

  if (!record) {
    return false;
  }

  if (record.usedAt) {
    return false;
  }

  return record.expiresAt.getTime() > Date.now();
}

export async function resetVolunteerPasswordByToken(token: string, passwordHash: string) {
  const tokenHash = hashPasswordResetToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, volunteerId: true, usedAt: true, expiresAt: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    return false;
  }

  await prisma.$transaction([
    prisma.volunteerAccount.update({
      where: { id: record.volunteerId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        volunteerId: record.volunteerId,
        id: { not: record.id },
      },
    }),
  ]);

  return true;
}

export async function getUserEventRegistrations(email: string): Promise<UserEventRegistration[]> {
  const normalizedEmail = email.trim().toLowerCase();

  const records = await prisma.registration.findMany({
    where: {
      email: { contains: normalizedEmail, mode: "insensitive" },
      status: { in: ["confirmed", "waitlisted", "checked_in"] },
    },
    orderBy: [{ event: { startDate: "asc" } }, { slot: { slotDate: "asc" } }, { createdAt: "desc" }],
    include: {
      event: {
        include: {
          community: {
            select: { slug: true, name: true },
          },
        },
      },
      slot: true,
    },
  });

  const exactMatches = records.filter((record) => record.email.trim().toLowerCase() === normalizedEmail);

  return exactMatches.map((record) => ({
    registrationId: record.id,
    registrationStatus: record.status as UserEventRegistration["registrationStatus"],
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    eventId: record.event.id,
    eventName: record.event.name,
    eventStartDate: formatDateOnly(record.event.startDate),
    eventEndDate: formatDateOnly(record.event.endDate),
    eventTimezone: record.event.timezone,
    eventVenueName: record.event.venueName,
    eventStatus: record.event.status as UserEventRegistration["eventStatus"],
    communitySlug: record.event.community.slug,
    communityName: record.event.community.name,
    slotDate: formatDateOnly(record.slot.slotDate),
    slotStartTime: record.slot.startTime,
    slotEndTime: record.slot.endTime,
    slotRoleName: record.slot.roleName,
    createdAt: record.createdAt.toISOString(),
  }));
}
