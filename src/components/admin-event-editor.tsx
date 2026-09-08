"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventItem, ShiftRoleSlot } from "@/lib/domain/types";

interface AdminEventEditorProps {
  event: EventItem;

  slots: ShiftRoleSlot[];
}

const TIMEZONE_OPTIONS = [
  { value: "Europe/Kyiv", label: "Kyiv" },
  { value: "America/Los_Angeles", label: "PTS (Pacific Time - Seattle/Los Angeles)" },
  { value: "America/New_York", label: "ETS (Eastern Time - New York)" },
];

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offsetMinutes = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offsetMinutes * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function suppliesToText(supplies: string[]) {
  return supplies.join(", ");
}

export default function AdminEventEditor({ event, slots }: AdminEventEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosingRegistration, setIsClosingRegistration] = useState(false);
  const [isCancellingEvent, setIsCancellingEvent] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotStatus, setSlotStatus] = useState<string>("");
  const hasExistingTimeZoneOption = TIMEZONE_OPTIONS.some((timezoneOption) => timezoneOption.value === event.timezone);
  const primarySlot = slots[0] ?? null;

  async function onSave(formData: FormData) {
    setIsSaving(true);
    setStatus("");

    const suppliesRaw = String(formData.get("supplies") ?? "");

    const payload = {
      communityId: String(formData.get("communityId") ?? event.communityId),
      name: String(formData.get("name") ?? event.name),
      eventType: String(formData.get("eventType") ?? event.eventType),
      status: String(formData.get("status") ?? event.status),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      registrationDeadline: String(formData.get("registrationDeadline") ?? ""),
      timezone: String(formData.get("timezone") ?? event.timezone),
      bannerImageUrl: String(formData.get("bannerImageUrl") ?? event.bannerImageUrl ?? ""),
      place: String(formData.get("place") ?? event.venueName),
      captainName: String(formData.get("captainName") ?? event.captainName ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? event.shortDescription),
      fullDescription: String(formData.get("fullDescription") ?? event.fullDescription),
      supplies: suppliesRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      slotId: primarySlot?.id,
      slotStartTime: String(formData.get("slotStartTime") ?? primarySlot?.startTime ?? "09:00"),
      slotEndTime: String(formData.get("slotEndTime") ?? primarySlot?.endTime ?? "12:00"),
      peopleNeeded: Number(formData.get("peopleNeeded") ?? primarySlot?.peopleNeeded ?? 5),
    };

    const response = await fetch(`/api/admin/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setStatus(body.error ?? "Could not update event.");
      setIsSaving(false);
      return;
    }

    setStatus("Event updated.");
    setIsSaving(false);
    router.refresh();
  }

  async function onDelete() {
    const confirmed = window.confirm(`Delete \"${event.name}\"? This will remove registrations too.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setStatus("");

    const response = await fetch(`/api/admin/events/${event.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setStatus(body.error ?? "Could not delete event.");
      setIsDeleting(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  async function onCloseRegistration() {
    const confirmed = window.confirm(`Close registration for \"${event.name}\"?`);
    if (!confirmed) {
      return;
    }

    setIsClosingRegistration(true);
    setStatus("");

    const response = await fetch(`/api/admin/events/${event.id}/close-registration`, {
      method: "POST",
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setStatus(body.error ?? "Could not close registration.");
      setIsClosingRegistration(false);
      return;
    }

    setStatus("Registration closed.");
    setIsClosingRegistration(false);
    router.refresh();
  }

  async function onCancelEvent() {
    const confirmed = window.confirm(`Cancel event \"${event.name}\"?`);
    if (!confirmed) {
      return;
    }

    setIsCancellingEvent(true);
    setStatus("");

    const response = await fetch(`/api/admin/events/${event.id}/cancel`, {
      method: "POST",
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setStatus(body.error ?? "Could not cancel event.");
      setIsCancellingEvent(false);
      return;
    }

    setStatus("Event cancelled.");
    setIsCancellingEvent(false);
    router.refresh();
  }

  async function onAddSlot(formData: FormData) {
    setIsAddingSlot(true);
    setSlotStatus("");

    const payload = {
      slotDate: String(formData.get("slotDate") ?? event.startDate),
      startTime: String(formData.get("startTime") ?? "09:00"),
      endTime: String(formData.get("endTime") ?? "12:00"),
      roleName: String(formData.get("roleName") ?? "Volunteer"),
      peopleNeeded: Number(formData.get("peopleNeeded") ?? 5),
      meetingPoint: String(formData.get("meetingPoint") ?? ""),
      instructions: String(formData.get("instructions") ?? ""),
    };

    const response = await fetch(`/api/admin/events/${event.id}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setSlotStatus(body.error ?? "Could not add slot.");
      setIsAddingSlot(false);
      return;
    }

    setSlotStatus("Slot added.");
    setIsAddingSlot(false);
    router.refresh();
  }

  async function onUpdateSlot(slotId: string, formData: FormData) {
    setSlotStatus("");

    const payload = {
      slotDate: String(formData.get("slotDate") ?? ""),
      startTime: String(formData.get("startTime") ?? ""),
      endTime: String(formData.get("endTime") ?? ""),
      roleName: String(formData.get("roleName") ?? ""),
      peopleNeeded: Number(formData.get("peopleNeeded") ?? 0),
      meetingPoint: String(formData.get("meetingPoint") ?? ""),
      instructions: String(formData.get("instructions") ?? ""),
    };

    const response = await fetch(`/api/admin/slots/${slotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setSlotStatus(body.error ?? "Could not update slot.");
      return;
    }

    setSlotStatus("Slot updated.");
    setEditingSlotId(null);
    router.refresh();
  }

  async function onDeleteSlot(slotId: string) {
    const confirmed = window.confirm("Delete this slot?");
    if (!confirmed) {
      return;
    }

    setSlotStatus("");

    const response = await fetch(`/api/admin/slots/${slotId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setSlotStatus(body.error ?? "Could not delete slot.");
      return;
    }

    setSlotStatus("Slot deleted.");
    router.refresh();
  }

  return (
    <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Manage Event</h2>

      <form
        className="mt-4 grid gap-3 md:grid-cols-2"
        action={async (formData) => {
          await onSave(formData);
        }}
      >
        <input type="hidden" name="communityId" defaultValue={event.communityId} />

        <label className="text-sm text-slate-700">
          Event name
          <input name="name" defaultValue={event.name} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          Event type
          <select name="eventType" defaultValue={event.eventType} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2">
            <option value="volunteer">Volunteer</option>
            <option value="practice">Practice</option>
            <option value="tournament">Tournament</option>
            <option value="festival">Festival</option>
            <option value="workshop">Workshop</option>
          </select>
        </label>

        <label className="text-sm text-slate-700">
          Start date
          <input type="date" name="startDate" defaultValue={event.startDate} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          End date
          <input type="date" name="endDate" defaultValue={event.endDate} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          Registration deadline
          <input
            type="datetime-local"
            name="registrationDeadline"
            defaultValue={toDatetimeLocal(event.registrationDeadline)}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Time zone
          <select
            name="timezone"
            defaultValue={event.timezone}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          >
            {TIMEZONE_OPTIONS.map((timezoneOption) => (
              <option key={timezoneOption.value} value={timezoneOption.value}>
                {timezoneOption.label}
              </option>
            ))}
            {!hasExistingTimeZoneOption ? (
              <option value={event.timezone}>{`Current value (${event.timezone})`}</option>
            ) : null}
          </select>
        </label>

        <label className="text-sm text-slate-700 md:col-span-2">
          Banner image URL (optional)
          <input
            type="url"
            name="bannerImageUrl"
            defaultValue={event.bannerImageUrl ?? ""}
            placeholder="https://example.com/event-banner.jpg"
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Place
          <input name="place" defaultValue={event.venueName} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          Captain
          <input name="captainName" defaultValue={event.captainName ?? ""} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          Supplies (comma separated)
          <textarea
            name="supplies"
            rows={3}
            defaultValue={suppliesToText(event.supplies)}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700 md:col-span-2">
          Short description
          <textarea
            name="shortDescription"
            rows={2}
            defaultValue={event.shortDescription}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700 md:col-span-2">
          Full description
          <textarea
            name="fullDescription"
            rows={4}
            defaultValue={event.fullDescription}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Primary shift start time
          <input
            type="time"
            name="slotStartTime"
            defaultValue={primarySlot?.startTime ?? "09:00"}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Primary shift end time
          <input
            type="time"
            name="slotEndTime"
            defaultValue={primarySlot?.endTime ?? "12:00"}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Primary shift people needed
          <input
            type="number"
            min={1}
            name="peopleNeeded"
            defaultValue={primarySlot?.peopleNeeded ?? 5}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Status
          <select name="status" defaultValue={event.status} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="registration_closed">Registration Closed</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 md:col-span-2"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={`/c/uds/events/${event.id}`}
          className="rounded-full border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          View public page
        </a>

        <button
          type="button"
          onClick={onCloseRegistration}
          disabled={isClosingRegistration || event.status === "registration_closed"}
          className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 disabled:opacity-50"
        >
          {isClosingRegistration ? "Closing..." : "Close registration"}
        </button>

        <button
          type="button"
          onClick={onCancelEvent}
          disabled={isCancellingEvent || event.status === "cancelled"}
          className="rounded-full border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 disabled:opacity-50"
        >
          {isCancellingEvent ? "Cancelling..." : "Cancel event"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete event"}
        </button>
      </div>

      {status ? <p className="mt-4 text-sm text-slate-700">{status}</p> : null}

      <div className="mt-8 rounded-2xl border border-sky-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Shifts and Roles</h3>
            <p className="text-sm text-slate-600">Add, edit, or remove volunteer shifts for this event.</p>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700 ring-1 ring-sky-200">{slots.length} slots</span>
        </div>

        {slotStatus ? <p className="mt-3 text-sm text-slate-700">{slotStatus}</p> : null}

        <div className="mt-4 space-y-3">
          {slots.map((slot) => {
            const isEditing = editingSlotId === slot.id;
            return (
              <div key={slot.id} className="rounded-xl border border-sky-200 bg-sky-50/50 p-4">
                {isEditing ? (
                  <form
                    className="grid gap-3 md:grid-cols-2"
                    action={async (formData) => {
                      await onUpdateSlot(slot.id, formData);
                    }}
                  >
                    <label className="text-sm text-slate-700">
                      Slot date
                      <input type="date" name="slotDate" defaultValue={slot.slotDate} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700">
                      Role name
                      <input name="roleName" defaultValue={slot.roleName} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700">
                      Start time
                      <input type="time" name="startTime" defaultValue={slot.startTime} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700">
                      End time
                      <input type="time" name="endTime" defaultValue={slot.endTime} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700">
                      People needed
                      <input type="number" min={1} name="peopleNeeded" defaultValue={slot.peopleNeeded} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700">
                      Meeting point
                      <input name="meetingPoint" defaultValue={slot.meetingPoint ?? ""} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700 md:col-span-2">
                      Instructions
                      <textarea name="instructions" rows={2} defaultValue={slot.instructions ?? ""} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
                    </label>
                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button type="submit" className="rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white">
                        Save slot
                      </button>
                      <button type="button" onClick={() => setEditingSlotId(null)} className="rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-slate-700">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="text-sm text-slate-700">
                      <p className="text-base font-semibold text-slate-900">
                        {slot.slotDate} | {slot.startTime} - {slot.endTime} | {slot.roleName}
                      </p>
                      <p className="mt-1">Need {slot.peopleNeeded} volunteers</p>
                      {slot.meetingPoint ? <p className="mt-1">Meet at {slot.meetingPoint}</p> : null}
                      {slot.instructions ? <p className="mt-1">{slot.instructions}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingSlotId(slot.id)}
                        className="rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => await onDeleteSlot(slot.id)}
                        className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form
          className="mt-5 grid gap-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 p-4 md:grid-cols-2"
          action={async (formData) => {
            await onAddSlot(formData);
          }}
        >
          <p className="text-sm font-semibold text-slate-900 md:col-span-2">Add new shift</p>
          <label className="text-sm text-slate-700">
            Slot date
            <input type="date" name="slotDate" defaultValue={event.startDate} required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Role name
            <input name="roleName" defaultValue="Volunteer" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Start time
            <input type="time" name="startTime" defaultValue="09:00" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            End time
            <input type="time" name="endTime" defaultValue="12:00" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            People needed
            <input type="number" min={1} name="peopleNeeded" defaultValue={5} required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Meeting point (optional)
            <input name="meetingPoint" className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Instructions (optional)
            <textarea name="instructions" rows={2} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
          </label>
          <button
            type="submit"
            disabled={isAddingSlot}
            className="rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 md:col-span-2"
          >
            {isAddingSlot ? "Adding..." : "Add shift"}
          </button>
        </form>
      </div>
    </section>
  );
}