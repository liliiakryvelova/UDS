import { NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/auth/password-reset";
import { findVolunteerAccountByEmail, issuePasswordResetToken } from "@/lib/domain/store";
import { sendPasswordResetEmail } from "@/lib/notifications/password-reset-email";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (email) {
    const volunteer = await findVolunteerAccountByEmail(email);

    if (volunteer) {
      const { token } = await issuePasswordResetToken(volunteer.id);
      const appOrigin = getAppOrigin(request);
      const resetUrl = `${appOrigin}/reset-password/${encodeURIComponent(token)}`;

      await sendPasswordResetEmail({
        to: volunteer.email,
        fullName: `${volunteer.firstName} ${volunteer.lastName}`.trim(),
        resetUrl,
      });
    }
  }

  return NextResponse.redirect(new URL("/forgot-password?sent=1", request.url));
}
