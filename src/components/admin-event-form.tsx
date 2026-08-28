"use client";

import { useState } from "react";

export default function AdminEventForm() {
  const [status, setStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsSaving(true);
    setStatus("");

    const suppliesRaw = String(formData.get("supplies") ?? "");

    const payload = {
      communityId: String(formData.get("communityId") ?? "com-uds"),
      name: String(formData.get("name") ?? ""),
      eventType: String(formData.get("eventType") ?? "volunteer"),
      status: String(formData.get("status") ?? "published"),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      registrationDeadline: String(formData.get("registrationDeadline") ?? ""),
      timezone: String(formData.get("timezone") ?? "Europe/Kyiv"),
      place: String(formData.get("place") ?? ""),
      captainName: String(formData.get("captainName") ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      fullDescription: String(formData.get("fullDescription") ?? ""),
      supplies: suppliesRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      slotStartTime: String(formData.get("slotStartTime") ?? "09:00"),
      slotEndTime: String(formData.get("slotEndTime") ?? "12:00"),
      peopleNeeded: Number(formData.get("peopleNeeded") ?? 5),
    };

    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setStatus(body.error ?? "Could not create event.");
      setIsSaving(false);
      return;
    }

    setStatus("Event created. Refreshing list...");
    setIsSaving(false);
    window.location.reload();
  }

  return (
    <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Create Event</h2>

      <form
        className="mt-4 grid gap-3 md:grid-cols-2"
        action={async (formData) => {
          await onSubmit(formData);
        }}
      >
        <input type="hidden" name="communityId" value="com-uds" />

        <label className="text-sm text-slate-700">
          Event name
          <input name="name" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          Event type
          <select name="eventType" className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2">
            <option value="volunteer">Volunteer</option>
            <option value="practice">Practice</option>
            <option value="tournament">Tournament</option>
            <option value="festival">Festival</option>
            <option value="workshop">Workshop</option>
          </select>
        </label>

        <label className="text-sm text-slate-700">
          Start date
          <input type="date" name="startDate" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          End date
          <input type="date" name="endDate" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          Registration deadline
          <input
            type="datetime-local"
            name="registrationDeadline"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Time zone (IANA)
          <input
            name="timezone"
            defaultValue="Europe/Kyiv"
            placeholder="Europe/Kyiv"
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Place
          <input name="place" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          Captain
          <input name="captainName" className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        <label className="text-sm text-slate-700">
          Supplies (comma separated)
          <textarea
            name="supplies"
            rows={3}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700 md:col-span-2">
          Short description
          <input
            name="shortDescription"
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700 md:col-span-2">
          Full description
          <textarea
            name="fullDescription"
            rows={3}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Shift start time
          <input
            type="time"
            name="slotStartTime"
            defaultValue="09:00"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Shift end time
          <input
            type="time"
            name="slotEndTime"
            defaultValue="12:00"
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          People needed
          <input
            type="number"
            min={1}
            name="peopleNeeded"
            defaultValue={5}
            required
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Status
          <select name="status" className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 md:col-span-2"
        >
          {isSaving ? "Creating..." : "Create event"}
        </button>

        {status ? <p className="text-sm text-slate-700 md:col-span-2">{status}</p> : null}
      </form>
    </section>
  );
}
