"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminEventQuickActionsProps {
  eventId: string;
  eventName: string;
}

export default function AdminEventQuickActions({ eventId, eventName }: AdminEventQuickActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState("");

  async function onDelete() {
    const confirmed = window.confirm(`Delete \"${eventName}\"? This will remove registrations too.`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setStatus("");

    const response = await fetch(`/api/admin/events/${eventId}`, {
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
    <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Admin controls</p>
          <p className="mt-1 text-sm text-slate-700">You are logged in as admin for this event.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/events/${eventId}`}
            className="rounded-full border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Modify Event
          </Link>

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Removing..." : "Remove Event"}
          </button>
        </div>
      </div>

      {status ? <p className="mt-3 text-sm text-red-700">{status}</p> : null}
    </section>
  );
}
