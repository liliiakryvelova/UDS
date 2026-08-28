"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventItem, ShiftRoleSlot } from "@/lib/domain/types";

interface AdminEventEditorProps {
  event: EventItem;
  slot: ShiftRoleSlot | null;
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offsetMinutes = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offsetMinutes * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function suppliesToText(supplies: string[]) {
  return supplies.join(", ");
}

export default function AdminEventEditor({ event, slot }: AdminEventEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      place: String(formData.get("place") ?? event.venueName),
      captainName: String(formData.get("captainName") ?? event.captainName ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? event.shortDescription),
      fullDescription: String(formData.get("fullDescription") ?? event.fullDescription),
      supplies: suppliesRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      slotId: slot?.id,
      slotStartTime: String(formData.get("slotStartTime") ?? slot?.startTime ?? "09:00"),
      slotEndTime: String(formData.get("slotEndTime") ?? slot?.endTime ?? "12:00"),
      peopleNeeded: Number(formData.get("peopleNeeded") ?? slot?.peopleNeeded ?? 5),
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
          Shift start time
          <input
            type="time"
            name="slotStartTime"
            defaultValue={slot?.startTime ?? "09:00"}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Shift end time
          <input
            type="time"
            name="slotEndTime"
            defaultValue={slot?.endTime ?? "12:00"}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          People needed
          <input
            type="number"
            min={1}
            name="peopleNeeded"
            defaultValue={slot?.peopleNeeded ?? 5}
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

      <div className="mt-4 flex items-center justify-between gap-3">
        <a
          href={`/c/uds/events/${event.id}`}
          className="rounded-full border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          View public page
        </a>

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
    </section>
  );
}
