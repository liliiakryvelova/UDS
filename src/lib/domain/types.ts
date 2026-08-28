export type EventStatus =
  | "draft"
  | "published"
  | "registration_closed"
  | "cancelled"
  | "completed";

export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled" | "checked_in";

export interface Community {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
}

export interface EventItem {
  id: string;
  communityId: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  eventType: "tournament" | "practice" | "festival" | "volunteer" | "workshop";
  status: EventStatus;
  startDate: string;
  endDate: string;
  timezone: string;
  registrationDeadline: string;
  venueName: string;
  fullAddress: string;
  captainName?: string;
  supplies: string[];
}

export interface ShiftRoleSlot {
  id: string;
  eventId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  roleName: string;
  peopleNeeded: number;
  meetingPoint?: string;
  instructions?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  slotId: string;
  communityId: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  consentWaiverAccepted: boolean;
  status: RegistrationStatus;
  manageTokenHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserEventRegistration {
  registrationId: string;
  registrationStatus: RegistrationStatus;
  fullName: string;
  email: string;
  phone: string;
  eventId: string;
  eventName: string;
  eventStartDate: string;
  eventEndDate: string;
  eventTimezone: string;
  eventVenueName: string;
  eventStatus: EventStatus;
  communitySlug: string;
  communityName: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  slotRoleName: string;
  createdAt: string;
}
