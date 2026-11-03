import EventSignupForm from "@/components/event-signup-form";
import AdminEventQuickActions from "@/components/admin-event-quick-actions";
import EventVolunteerList from "@/components/event-volunteer-list";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasAdminPageSession } from "@/lib/auth/admin-guard";
import { getUserSessionIdentity } from "@/lib/auth/user-guard";
import { getEventById, getRegistrationsByEventId, getSlotsByEventId } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

const TIMEZONE_ALIASES: Record<string, string> = {
  pdt: "America/Los_Angeles",
  pst: "America/Los_Angeles",
  mdt: "America/Denver",
  mst: "America/Denver",
  cdt: "America/Chicago",
  cst: "America/Chicago",
  edt: "America/New_York",
  est: "America/New_York",
};

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function normalizeTimeZone(value: string) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (isValidTimeZone(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed
    .replace(/\s*\/\s*/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (normalized.includes("los angeles") || normalized.includes("seattle")) {
    return "America/Los_Angeles";
  }
  if (normalized.includes("denver")) {
    return "America/Denver";
  }
  if (normalized.includes("chicago")) {
    return "America/Chicago";
  }
  if (normalized.includes("new york")) {
    return "America/New_York";
  }
  if (normalized.includes("kyiv") || normalized.includes("kiev")) {
    return "Europe/Kyiv";
  }

  const tokenMatch = normalized.match(/\b([a-z]{3})\b/);
  if (tokenMatch) {
    return TIMEZONE_ALIASES[tokenMatch[1]];
  }

  return undefined;
}

function formatDateTime(value: string, timezone: string) {
  const safeTimeZone = normalizeTimeZone(timezone);
  const formatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    ...(safeTimeZone ? { timeZone: safeTimeZone } : {}),
  });

  return formatter.format(new Date(value));
}

function eventTypeLabel(eventType: string) {
  return eventType.charAt(0).toUpperCase() + eventType.slice(1);
}

function maskVolunteerName(fullName: string) {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "Volunteer";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]} ${parts[1][0]}.`;
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ communitySlug: string; eventId: string }>;
}) {
  const { communitySlug, eventId } = await params;
  const isAdminLoggedIn = await hasAdminPageSession();
  const userSession = await getUserSessionIdentity();
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const [eventSlots, registrations] = await Promise.all([
    getSlotsByEventId(event.id),
    getRegistrationsByEventId(event.id),
  ]);
  const confirmedRegistrations = registrations.filter((registration) => registration.status === "confirmed");
  const activeRegistrations = registrations.filter((registration) =>
    ["confirmed", "waitlisted", "checked_in"].includes(registration.status),
  );
  const slotConfirmedCountById = confirmedRegistrations.reduce<Record<string, number>>((acc, registration) => {
    acc[registration.slotId] = (acc[registration.slotId] ?? 0) + 1;
    return acc;
  }, {});

  const normalizedSignedInEmail = userSession?.email.trim().toLowerCase();
  const isPublicVisitor = !isAdminLoggedIn && !userSession;
  const userRegistrationStatusBySlotId = activeRegistrations.reduce<Record<string, "confirmed" | "waitlisted" | "checked_in">>(
    (acc, registration) => {
      if (normalizedSignedInEmail && registration.email.trim().toLowerCase() === normalizedSignedInEmail) {
        acc[registration.slotId] = registration.status as "confirmed" | "waitlisted" | "checked_in";
      }

      return acc;
    },
    {},
  );

  const volunteerListItems = confirmedRegistrations.map((registration) => {
    const isCurrentUser = Boolean(
      normalizedSignedInEmail && registration.email.trim().toLowerCase() === normalizedSignedInEmail,
    );

    return {
      id: registration.id,
      slotId: registration.slotId,
      displayName: isPublicVisitor && !isCurrentUser ? maskVolunteerName(registration.fullName) : registration.fullName,
      isCurrentUser,
    };
  });

  const hasAnyShiftFull = eventSlots.some((slot) => (slotConfirmedCountById[slot.id] ?? 0) >= slot.peopleNeeded);
  const hasAnyShiftOpen = eventSlots.some((slot) => (slotConfirmedCountById[slot.id] ?? 0) < slot.peopleNeeded);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
      <Link href={`/c/${communitySlug}/events`} className="text-sm font-medium text-[#71839a] transition hover:text-[#1859a9]">
        {"<- Back to events"}
      </Link>

      <section className="mt-5 overflow-hidden rounded-[2rem] border border-[#dce6f2] bg-white shadow-[0_16px_44px_-34px_rgba(23,54,88,0.3)]">
        {event.bannerImageUrl ? (
          <div className="relative aspect-[16/6] max-h-[28rem] w-full overflow-hidden bg-[#e8f0fa]">
            <Image
              src={event.bannerImageUrl}
              alt={`${event.name} banner`}
              fill
              sizes="(max-width: 768px) 100vw, 1152px"
              unoptimized
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_0.7fr] lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#71839a]">
              <span className="rounded-full bg-[#1859a9] px-3 py-1 text-white">{eventTypeLabel(event.eventType)}</span>
              <span>{event.status.replace("_", " ")}</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#172f4d] md:text-4xl">{event.name}</h1>
            <p className="mt-4 max-w-3xl rounded-2xl border border-[#e2eaf5] bg-[#f3f7fc] p-5 text-base leading-7 text-[#526b89] md:text-lg md:leading-8">
              {event.fullDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#405c7e]">
              <span className="rounded-full bg-[#e8f0fa] px-4 py-2 ring-1 ring-[#d5e1ef]">{formatDateRange(event.startDate, event.endDate)}</span>
              <span className="rounded-full bg-[#e8f0fa] px-4 py-2 ring-1 ring-[#d5e1ef]">{event.timezone}</span>
              <span className="rounded-full bg-[#e8f0fa] px-4 py-2 ring-1 ring-[#d5e1ef]">Registration closes {formatDateTime(event.registrationDeadline, event.timezone)}</span>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-[#d5e1ef] bg-[#f3f7fc] p-6 text-[#172f4d]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#59789f]">Event details</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-[#71839a]">Location</dt>
                <dd className="mt-1 text-base font-medium text-[#172f4d]">{event.venueName}</dd>
                <dd className="text-[#5e718b]">{event.fullAddress}</dd>
              </div>
              <div>
                <dt className="text-[#71839a]">Captain</dt>
                <dd className="mt-1 text-base font-medium text-[#172f4d]">{event.captainName ?? "TBD"}</dd>
              </div>
              <div>
                <dt className="text-[#71839a]">Volunteer slots</dt>
                <dd className="mt-1 text-base font-medium text-[#172f4d]">{eventSlots.length} available shift{eventSlots.length === 1 ? "" : "s"}</dd>
              </div>
              <div>
                <dt className="text-[#71839a]">What to bring</dt>
                <dd className="mt-1 text-base font-medium text-[#172f4d]">{event.supplies.length > 0 ? event.supplies.join(", ") : "No supplies listed yet"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {isAdminLoggedIn ? <AdminEventQuickActions eventId={event.id} eventName={event.name} /> : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-[#dce6f2] bg-white p-6 shadow-[0_10px_30px_-24px_rgba(23,54,88,0.25)]">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#172f4d]">Why this event matters</h2>
          <p className="mt-3 text-sm leading-7 text-[#5e718b]">
            {event.shortDescription}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f3f7fc] p-4 ring-1 ring-[#e2eaf5]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#71839a]">Dates</p>
              <p className="mt-2 text-sm font-medium text-[#172f4d]">{formatDateRange(event.startDate, event.endDate)}</p>
            </div>
            <div className="rounded-xl bg-[#f3f7fc] p-4 ring-1 ring-[#e2eaf5]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#71839a]">Timezone</p>
              <p className="mt-2 text-sm font-medium text-[#172f4d]">{event.timezone}</p>
            </div>
            <div className="rounded-xl bg-[#f3f7fc] p-4 ring-1 ring-[#e2eaf5]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#71839a]">Captain</p>
              <p className="mt-2 text-sm font-medium text-[#172f4d]">{event.captainName ?? "TBD"}</p>
            </div>
            <div className="rounded-xl bg-[#f3f7fc] p-4 ring-1 ring-[#e2eaf5]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#71839a]">Supplies</p>
              <p className="mt-2 text-sm font-medium text-[#172f4d]">{event.supplies.length > 0 ? event.supplies.join(", ") : "None listed"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce6f2] bg-white p-6 shadow-[0_10px_30px_-24px_rgba(23,54,88,0.25)]">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#172f4d]">Shift and role availability</h2>
          {hasAnyShiftFull && !hasAnyShiftOpen ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              This event is full. Join the waitlist for a shift below.
            </div>
          ) : null}
          <div className="mt-4 space-y-3">
            {eventSlots.length > 0 ? (
              eventSlots.map((slot) => {
                const confirmedCount = slotConfirmedCountById[slot.id] ?? 0;
                const isFull = confirmedCount >= slot.peopleNeeded;

                return (
                  <div key={slot.id} className="rounded-xl border border-[#dce6f2] bg-[#f8fafd] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#172f4d]">
                          {slot.slotDate} | {slot.startTime} - {slot.endTime}
                        </p>
                        <p className="mt-1 text-sm text-[#5e718b]">{slot.roleName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        <span className="rounded-full bg-[#e8f0fa] px-3 py-1 text-xs font-medium text-[#41638d] ring-1 ring-[#d5e1ef]">
                          Need {slot.peopleNeeded}
                        </span>
                        <span className="text-xs text-[#71839a]">{confirmedCount} signed up</span>
                        {isFull ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700 ring-1 ring-rose-200">
                            Full
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {slot.meetingPoint ? <p className="mt-3 text-xs text-slate-500">Meet at {slot.meetingPoint}</p> : null}
                    {slot.instructions ? <p className="mt-1 text-xs text-slate-500">{slot.instructions}</p> : null}
                    {isFull ? (
                      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                        This shift is full. Join the waitlist.
                      </p>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                Volunteer shifts have not been added yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <EventVolunteerList
        registrations={volunteerListItems}
        slots={eventSlots}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <EventSignupForm
        eventId={event.id}
        slots={eventSlots}
        slotConfirmedCountById={slotConfirmedCountById}
        userRegistrationStatusBySlotId={userRegistrationStatusBySlotId}
        signedInVolunteer={
          userSession
            ? {
                fullName: userSession.fullName,
                email: userSession.email,
                phone: userSession.phone,
              }
            : null
        }
      />
    </main>
  );
}
