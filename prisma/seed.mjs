import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function main() {
  await prisma.community.upsert({
    where: { id: "com-uds" },
    update: { name: "UDS", slug: "uds", status: "active" },
    create: { id: "com-uds", name: "UDS", slug: "uds", status: "active" },
  });

  await prisma.community.upsert({
    where: { id: "com-catchball" },
    update: { name: "Catchball Community", slug: "catchball", status: "active" },
    create: {
      id: "com-catchball",
      name: "Catchball Community",
      slug: "catchball",
      status: "active",
    },
  });

  await prisma.event.upsert({
    where: { id: "ev-uds-volunteer-day" },
    update: {
      communityId: "com-uds",
      name: "UDS Volunteer Day",
      shortDescription: "One-day volunteer activation across city partner sites.",
      fullDescription:
        "Join UDS volunteers for logistics, coordination, and participant support. Pick a role and shift that works for you.",
      eventType: "volunteer",
      status: "published",
      startDate: new Date("2026-09-12T00:00:00Z"),
      endDate: new Date("2026-09-13T00:00:00Z"),
      timezone: "Europe/Kyiv",
      registrationDeadline: new Date("2026-09-10T18:00:00Z"),
      venueName: "Central Community Hub",
      fullAddress: "45 Community St, Kyiv",
    },
    create: {
      id: "ev-uds-volunteer-day",
      communityId: "com-uds",
      name: "UDS Volunteer Day",
      shortDescription: "One-day volunteer activation across city partner sites.",
      fullDescription:
        "Join UDS volunteers for logistics, coordination, and participant support. Pick a role and shift that works for you.",
      eventType: "volunteer",
      status: "published",
      startDate: new Date("2026-09-12T00:00:00Z"),
      endDate: new Date("2026-09-13T00:00:00Z"),
      timezone: "Europe/Kyiv",
      registrationDeadline: new Date("2026-09-10T18:00:00Z"),
      venueName: "Central Community Hub",
      fullAddress: "45 Community St, Kyiv",
    },
  });

  await prisma.event.upsert({
    where: { id: "ev-catchball-festival" },
    update: {
      communityId: "com-catchball",
      name: "Catchball Summer Festival",
      shortDescription: "Open festival with practice courts and mentorship.",
      fullDescription:
        "A two-day festival with beginner-friendly sessions, advanced scrimmages, and volunteer support roles.",
      eventType: "festival",
      status: "published",
      startDate: new Date("2026-09-20T00:00:00Z"),
      endDate: new Date("2026-09-21T00:00:00Z"),
      timezone: "Europe/Kyiv",
      registrationDeadline: new Date("2026-09-18T20:00:00Z"),
      venueName: "Riverfront Sports Campus",
      fullAddress: "9 Riverfront Ave, Kyiv",
    },
    create: {
      id: "ev-catchball-festival",
      communityId: "com-catchball",
      name: "Catchball Summer Festival",
      shortDescription: "Open festival with practice courts and mentorship.",
      fullDescription:
        "A two-day festival with beginner-friendly sessions, advanced scrimmages, and volunteer support roles.",
      eventType: "festival",
      status: "published",
      startDate: new Date("2026-09-20T00:00:00Z"),
      endDate: new Date("2026-09-21T00:00:00Z"),
      timezone: "Europe/Kyiv",
      registrationDeadline: new Date("2026-09-18T20:00:00Z"),
      venueName: "Riverfront Sports Campus",
      fullAddress: "9 Riverfront Ave, Kyiv",
    },
  });

  await prisma.eventSlot.upsert({
    where: { id: "slot-1" },
    update: {
      eventId: "ev-uds-volunteer-day",
      slotDate: new Date("2026-09-12T00:00:00Z"),
      startTime: "09:00",
      endTime: "13:00",
      roleName: "Check-in Desk",
      peopleNeeded: 6,
      meetingPoint: "Main Entrance",
      instructions: "Arrive 15 minutes early for briefing.",
      isActive: true,
    },
    create: {
      id: "slot-1",
      eventId: "ev-uds-volunteer-day",
      slotDate: new Date("2026-09-12T00:00:00Z"),
      startTime: "09:00",
      endTime: "13:00",
      roleName: "Check-in Desk",
      peopleNeeded: 6,
      meetingPoint: "Main Entrance",
      instructions: "Arrive 15 minutes early for briefing.",
      isActive: true,
    },
  });

  await prisma.eventSlot.upsert({
    where: { id: "slot-2" },
    update: {
      eventId: "ev-uds-volunteer-day",
      slotDate: new Date("2026-09-12T00:00:00Z"),
      startTime: "13:00",
      endTime: "17:00",
      roleName: "Field Support",
      peopleNeeded: 10,
      meetingPoint: "Court A",
      instructions: "Wear comfortable shoes and bring water.",
      isActive: true,
    },
    create: {
      id: "slot-2",
      eventId: "ev-uds-volunteer-day",
      slotDate: new Date("2026-09-12T00:00:00Z"),
      startTime: "13:00",
      endTime: "17:00",
      roleName: "Field Support",
      peopleNeeded: 10,
      meetingPoint: "Court A",
      instructions: "Wear comfortable shoes and bring water.",
      isActive: true,
    },
  });

  await prisma.eventSlot.upsert({
    where: { id: "slot-3" },
    update: {
      eventId: "ev-catchball-festival",
      slotDate: new Date("2026-09-20T00:00:00Z"),
      startTime: "10:00",
      endTime: "14:00",
      roleName: "Court Host",
      peopleNeeded: 4,
      meetingPoint: "North Courts",
      instructions: "Coordinate schedule and participant groups.",
      isActive: true,
    },
    create: {
      id: "slot-3",
      eventId: "ev-catchball-festival",
      slotDate: new Date("2026-09-20T00:00:00Z"),
      startTime: "10:00",
      endTime: "14:00",
      roleName: "Court Host",
      peopleNeeded: 4,
      meetingPoint: "North Courts",
      instructions: "Coordinate schedule and participant groups.",
      isActive: true,
    },
  });

  await prisma.registration.upsert({
    where: {
      manageTokenHash: hashToken("sample-manage-token"),
    },
    update: {
      eventId: "ev-uds-volunteer-day",
      slotId: "slot-1",
      communityId: "com-uds",
      fullName: "Demo Registrant",
      email: "demo@example.com",
      phone: "+380000000000",
      notes: "Seeded sample registration",
      consentWaiverAccepted: true,
      status: "confirmed",
    },
    create: {
      id: "reg-demo-1",
      eventId: "ev-uds-volunteer-day",
      slotId: "slot-1",
      communityId: "com-uds",
      fullName: "Demo Registrant",
      email: "demo@example.com",
      phone: "+380000000000",
      notes: "Seeded sample registration",
      consentWaiverAccepted: true,
      status: "confirmed",
      manageTokenHash: hashToken("sample-manage-token"),
    },
  });

  console.log("Seed complete. Demo manage token: sample-manage-token");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
