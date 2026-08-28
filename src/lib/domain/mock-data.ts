import type { Community, EventItem, Registration, ShiftRoleSlot } from "@/lib/domain/types";

export const communities: Community[] = [
  { id: "com-uds", name: "UDS", slug: "uds", status: "active" },
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
    captainName: "Alyona K.",
    supplies: ["Banners", "Water", "First-aid kit"],
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
];

export const registrations: Registration[] = [];
