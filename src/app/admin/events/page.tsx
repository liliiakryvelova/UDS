import { getAdminEvents } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await getAdminEvents();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard: Events</h1>
      <p className="mt-2 text-sm text-slate-600">V1 management table wired to mock data.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Community</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{event.name}</td>
                <td className="px-4 py-3 uppercase text-slate-700">{event.status}</td>
                <td className="px-4 py-3 text-slate-700">{event.eventType}</td>
                <td className="px-4 py-3 text-slate-700">
                  {event.startDate} - {event.endDate}
                </td>
                <td className="px-4 py-3 text-slate-700">{event.communityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
