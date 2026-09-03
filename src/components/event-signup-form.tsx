"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShiftRoleSlot } from "@/lib/domain/types";

interface SignedInVolunteer {
  fullName: string;
  email: string;
  phone: string;
}

interface EventSignupFormProps {
  eventId: string;
  slots: ShiftRoleSlot[];
  slotConfirmedCountById: Record<string, number>;
  userRegisteredSlotIds?: string[];
  signedInVolunteer?: SignedInVolunteer | null;
}

export default function EventSignupForm({
  eventId,
  slots,
  slotConfirmedCountById,
  userRegisteredSlotIds = [],
  signedInVolunteer,
}: EventSignupFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const hasSlots = slots.length > 0;
  const isSignedInMode = Boolean(signedInVolunteer);
  const userRegisteredSet = new Set(userRegisteredSlotIds);

  const slotsWithStatus = slots.map((slot) => {
    const confirmedCount = slotConfirmedCountById[slot.id] ?? 0;
    const isFull = confirmedCount >= slot.peopleNeeded;
    const isRegisteredByUser = userRegisteredSet.has(slot.id);
    return { ...slot, confirmedCount, isFull, isRegisteredByUser };
  });

  const selectableSlots = slotsWithStatus.filter((slot) => !slot.isFull && !slot.isRegisteredByUser);
  const hasOpenSlots = selectableSlots.length > 0;

  async function onSubmit(formData: FormData) {
    const slotId = String(formData.get("slotId") ?? "");
    const selectedSlot = slotsWithStatus.find((slot) => slot.id === slotId);

    if (!selectedSlot) {
      setStatus("Please choose a valid shift.");
      return;
    }

    if (selectedSlot.isRegisteredByUser) {
      setStatus("You are already signed up for this shift.");
      return;
    }

    if (selectedSlot.isFull) {
      setStatus("This shift is full.");
      return;
    }

    setIsSaving(true);
    setStatus("");

    const payload = {
      slotId,
      fullName: String(formData.get("fullName") ?? signedInVolunteer?.fullName ?? ""),
      email: String(formData.get("email") ?? signedInVolunteer?.email ?? ""),
      phone: String(formData.get("phone") ?? signedInVolunteer?.phone ?? ""),
      notes: String(formData.get("notes") ?? ""),
      consentWaiverAccepted: isSignedInMode || formData.get("consentWaiverAccepted") === "on",
    };

    const response = await fetch(`/api/events/${eventId}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let body: { error?: string; manageUrl?: string } = {};

    if (responseText) {
      try {
        body = JSON.parse(responseText) as { error?: string; manageUrl?: string };
      } catch {
        body = {};
      }
    }

    if (!response.ok) {
      setStatus(body.error ?? "Could not register. Please try again.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    if (body.manageUrl) {
      router.push(body.manageUrl);
      return;
    }

    setStatus("Registration complete.");
  }

  return (
    <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Sign Up for This Event</h2>

      {isSignedInMode ? (
        <p className="mt-2 text-sm text-slate-600">
          Signed in as {signedInVolunteer?.fullName}. Your saved details will be used automatically.
        </p>
      ) : null}

      <form
        className="mt-4 space-y-3"
        action={async (formData) => {
          await onSubmit(formData);
        }}
      >
        <label className="block text-sm text-slate-700">
          Shift and role
          <select
            name="slotId"
            required
            disabled={!hasSlots}
            value={selectedSlotId}
            onChange={(event) => setSelectedSlotId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 disabled:bg-slate-100"
          >
            <option value="">Select shift</option>
            {slotsWithStatus.map((slot) => (
              <option key={slot.id} value={slot.id} disabled={slot.isFull || slot.isRegisteredByUser}>
                {slot.slotDate} | {slot.startTime}-{slot.endTime} | {slot.roleName}
                {slot.isRegisteredByUser ? " (Already registered)" : slot.isFull ? " (Full)" : ""}
              </option>
            ))}
          </select>
        </label>

        {isSignedInMode ? (
          <>
            <input type="hidden" name="fullName" value={signedInVolunteer?.fullName ?? ""} />
            <input type="hidden" name="email" value={signedInVolunteer?.email ?? ""} />
            <input type="hidden" name="phone" value={signedInVolunteer?.phone ?? ""} />
          </>
        ) : (
          <>
            <label className="block text-sm text-slate-700">
              Full name
              <input name="fullName" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
            </label>

            <label className="block text-sm text-slate-700">
              Email
              <input type="email" name="email" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
            </label>

            <label className="block text-sm text-slate-700">
              Phone
              <input name="phone" required className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
            </label>
          </>
        )}

        <label className="block text-sm text-slate-700">
          Notes (optional)
          <textarea name="notes" rows={3} className="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2" />
        </label>

        {isSignedInMode ? null : (
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" name="consentWaiverAccepted" required className="mt-1" />
            I agree to event participation and waiver terms.
          </label>
        )}

        {!hasSlots ? (
          <p className="text-sm text-slate-600">Volunteer sign-up will open once shifts are added.</p>
        ) : !hasOpenSlots ? (
          <p className="text-sm text-rose-700">All available shifts are full right now.</p>
        ) : null}

        {isSignedInMode && userRegisteredSlotIds.length > 0 ? (
          <p className="text-sm text-emerald-700">
            You are already registered for {userRegisteredSlotIds.length} shift{userRegisteredSlotIds.length === 1 ? "" : "s"} in this event.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving || !hasOpenSlots}
          className="rounded-full bg-sky-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSaving ? "Submitting..." : isSignedInMode ? "Sign Me Up" : "Register"}
        </button>

        {status ? <p className="text-sm text-slate-700">{status}</p> : null}
      </form>
    </section>
  );
}
