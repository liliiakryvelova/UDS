"use client";

import { useMemo, useState } from "react";
import type { Registration, ShiftRoleSlot } from "@/lib/domain/types";

interface AdminVolunteerListProps {
  registrations: Registration[];
  slots: ShiftRoleSlot[];
}

export default function AdminVolunteerList({ registrations, slots }: AdminVolunteerListProps) {
  const [items, setItems] = useState(registrations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);

  function getSlotLabel(slotId: string) {
    const slot = slots.find((record) => record.id === slotId);
    if (!slot) {
      return slotId;
    }

    return `${slot.slotDate} | ${slot.startTime}-${slot.endTime} | ${slot.roleName}`;
  }

  const editingRegistration = useMemo(
    () => items.find((registration) => registration.id === editingId) ?? null,
    [editingId, items],
  );

  const editable = editingRegistration
    ? {
        id: editingRegistration.id,
        fullName: editingRegistration.fullName,
        email: editingRegistration.email,
        phone: editingRegistration.phone,
        notes: editingRegistration.notes ?? "",
        slotId: editingRegistration.slotId,
      }
    : null;

  async function updateRegistration(registrationId: string, formData: FormData) {
    setBusyId(registrationId);
    setStatus("");

    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      slotId: String(formData.get("slotId") ?? ""),
    };

    const response = await fetch(`/api/admin/registrations/${registrationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setStatus(body.error ?? "Could not update volunteer.");
      setBusyId(null);
      return;
    }

    const updated = (await response.json()) as Registration;
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setEditingId(null);
    setStatus("Volunteer updated.");
    setBusyId(null);
  }

  async function removeRegistration(registrationId: string) {
    const confirmed = window.confirm("Remove this volunteer from the event?");
    if (!confirmed) {
      return;
    }

    setBusyId(registrationId);
    setStatus("");

    const response = await fetch(`/api/admin/registrations/${registrationId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setStatus(body.error ?? "Could not remove volunteer.");
      setBusyId(null);
      return;
    }

    const updated = (await response.json()) as Registration;
    setItems((current) => current.filter((item) => item.id !== updated.id));
    setEditingId(null);
    setStatus("Volunteer removed.");
    setBusyId(null);
  }

  async function sendReminder(registration: Registration) {
    const confirmed = window.confirm(`Send a reminder to ${registration.fullName}?`);
    if (!confirmed) {
      return;
    }

    setBusyId(registration.id);
    setStatus("");

    const response = await fetch(`/api/admin/registrations/${registration.id}/reminder`, {
      method: "POST",
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setStatus(body.error ?? "Could not send reminder.");
      setBusyId(null);
      return;
    }

    setStatus("Reminder email sent.");
    setBusyId(null);
  }

  return (
    <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Volunteers</h2>
          <p className="text-sm text-slate-600">Edit volunteer details or remove them from this event.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm text-sky-700 ring-1 ring-sky-200">{items.length} total</span>
      </div>

      {status ? <p className="mt-4 text-sm text-slate-700">{status}</p> : null}

      <div className="mt-5 space-y-4">
        {items.length > 0 ? (
          items.map((registration) => {
            const isEditing = editingId === registration.id;
            const isBusy = busyId === registration.id;
            return (
              <article key={registration.id} className="rounded-2xl border border-sky-200 bg-white p-4">
                {isEditing && editable ? (
                  <form
                    className="grid gap-3 md:grid-cols-2"
                    action={async (formData) => {
                      await updateRegistration(registration.id, formData);
                    }}
                  >
                    <label className="text-sm text-slate-700">
                      Full name
                      <input name="fullName" defaultValue={editable.fullName} className="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700">
                      Email
                      <input name="email" type="email" defaultValue={editable.email} className="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700">
                      Phone
                      <input name="phone" defaultValue={editable.phone} className="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2" />
                    </label>
                    <label className="text-sm text-slate-700">
                      Shift
                      <select name="slotId" defaultValue={editable.slotId} className="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2">
                        {slots.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {slot.slotDate} | {slot.startTime}-{slot.endTime} | {slot.roleName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm text-slate-700 md:col-span-2">
                      Notes
                      <textarea name="notes" rows={3} defaultValue={editable.notes} className="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2" />
                    </label>
                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {isBusy ? "Saving..." : "Save volunteer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1 text-sm text-slate-700">
                      <p className="text-base font-semibold text-slate-950">{registration.fullName}</p>
                      <p>{registration.email}</p>
                      <p>{registration.phone}</p>
                      <p>
                        <span className="font-semibold text-slate-900">Shift:</span> {getSlotLabel(registration.slotId)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Status:</span> {registration.status}
                      </p>
                      {registration.notes ? (
                        <p>
                          <span className="font-semibold text-slate-900">Notes:</span> {registration.notes}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(registration.id)}
                        className="rounded-full border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => await sendReminder(registration)}
                        disabled={isBusy}
                        className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 disabled:opacity-50"
                      >
                        {isBusy ? "Sending..." : "Send reminder"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => await removeRegistration(registration.id)}
                        disabled={isBusy}
                        className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
                      >
                        {isBusy ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">
            No volunteers have signed up yet.
          </p>
        )}
      </div>
    </section>
  );
}
