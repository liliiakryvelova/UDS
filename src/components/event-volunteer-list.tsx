"use client";

import { useState } from "react";
import type { Registration, ShiftRoleSlot } from "@/lib/domain/types";

interface EventVolunteerListProps {
  registrations: Registration[];
  slots: ShiftRoleSlot[];
  isAdminLoggedIn: boolean;
}

function slotLabel(slot: ShiftRoleSlot | undefined) {
  if (!slot) {
    return "Volunteer shift assigned";
  }

  return `${slot.slotDate} | ${slot.startTime} - ${slot.endTime} | ${slot.roleName}`;
}

export default function EventVolunteerList({ registrations, slots, isAdminLoggedIn }: EventVolunteerListProps) {
  const [items, setItems] = useState(registrations);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  async function removeVolunteer(registrationId: string) {
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

    const removed = (await response.json()) as Registration;
    setItems((current) => current.filter((registration) => registration.id !== removed.id));
    setBusyId(null);
    setStatus("Volunteer removed.");
  }

  return (
    <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/50 p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Confirmed volunteers</h2>
          <p className="text-sm text-slate-600">People already signed up for this event.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm text-sky-700 ring-1 ring-sky-200">
          {items.length} signed up
        </span>
      </div>

      {status ? <p className="mt-4 text-sm text-slate-700">{status}</p> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.length > 0 ? (
          items.map((registration) => {
            const slot = slots.find((record) => record.id === registration.slotId);
            const isBusy = busyId === registration.id;

            return (
              <article key={registration.id} className="rounded-xl border border-sky-200 bg-white p-4">
                <p className="text-base font-semibold text-slate-950">{registration.fullName}</p>
                <p className="mt-1 text-sm text-slate-700">{slotLabel(slot)}</p>

                {isAdminLoggedIn ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={async () => await removeVolunteer(registration.id)}
                      disabled={isBusy}
                      className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
                    >
                      {isBusy ? "Removing..." : "Remove volunteer"}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            No volunteers have signed up yet.
          </p>
        )}
      </div>
    </section>
  );
}
