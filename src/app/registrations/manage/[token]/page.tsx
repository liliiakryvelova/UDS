import { getRegistrationByManageToken } from "@/lib/domain/store";

export const dynamic = "force-dynamic";

export default async function ManageRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const registration = await getRegistrationByManageToken(token);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Manage Registration</h1>
      <p className="mt-2 text-sm text-slate-600">Secure token-based self-service registration management.</p>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!registration ? (
          <p className="text-sm text-red-600">Registration not found for this token.</p>
        ) : (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Name:</span> {registration.fullName}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Email:</span> {registration.email}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Phone:</span> {registration.phone}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Status:</span> {registration.status}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
