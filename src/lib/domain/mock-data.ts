import type { Community, EventItem, Registration, ShiftRoleSlot } from "@/lib/domain/types";

export const communities: Community[] = [
  { id: "com-uds", name: "UDS", slug: "uds", status: "active" },
  {
    id: "com-catchball",
    name: "Catchball Community",
    slug: "catchball",
    status: "active",
  },
];

export const events: EventItem[] = [
  {
    id: "ev-uds-volunteer-day",
    communityId: "com-uds",
    name: "UDS Volunteer Day",
    shortDescription: "One-day volunteer activation across city partner sites.",
    fullDescription:
      "Join UDS volunteers for logistics, coordination, and participant support. Pick a role and shift that works for you.",
    eventType: "volunteer",
    status: "published",
    startDate: "2026-09-12",
    endDate: "2026-09-13",
    timezone: "Europe/Kyiv",
    registrationDeadline: "2026-09-10T18:00:00Z",
    venueName: "Central Community Hub",
    fullAddress: "45 Community St, Kyiv",
  },
  {
    id: "ev-catchball-festival",
    communityId: "com-catchball",
    name: "Catchball Summer Festival",
    shortDescription: "Open festival with practice courts and mentorship.",
    fullDescription:
      "A two-day festival with beginner-friendly sessions, advanced scrimmages, and volunteer support roles.",
    eventType: "festival",
    status: "published",
    startDate: "2026-09-20",
    endDate: "2026-09-21",
    timezone: "Europe/Kyiv",
    registrationDeadline: "2026-09-18T20:00:00Z",
    venueName: "Riverfront Sports Campus",
    fullAddress: "9 Riverfront Ave, Kyiv",
  },
];

export const slots: ShiftRoleSlot[] = [
  {
    id: "slot-1",
    eventId: "ev-uds-volunteer-day",
    slotDate: "2026-09-12",
    startTime: "09:00",
    endTime: "13:00",
    roleName: "Check-in Desk",
    peopleNeeded: 6,
    meetingPoint: "Main Entrance",
    instructions: "Arrive 15 minutes early for briefing.",
  },
  {
    id: "slot-2",
    eventId: "ev-uds-volunteer-day",
    slotDate: "2026-09-12",
    startTime: "13:00",
    endTime: "17:00",
    roleName: "Field Support",
    peopleNeeded: 10,
    meetingPoint: "Court A",
    instructions: "Wear comfortable shoes and bring water.",
  },
  {
    id: "slot-3",
    eventId: "ev-catchball-festival",
    slotDate: "2026-09-20",
    startTime: "10:00",
    endTime: "14:00",
    roleName: "Court Host",
    peopleNeeded: 4,
    meetingPoint: "North Courts",
    instructions: "Coordinate schedule and participant groups.",
  },
];

export const registrations: Registration[] = [];
