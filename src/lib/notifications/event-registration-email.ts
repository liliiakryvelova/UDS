interface EventRegistrationEmailInput {
  to: string;
  fullName: string;
  eventName: string;
  communityName?: string;
  eventDateRange: string;
  timezone: string;
  venueName: string;
  shiftLabel: string;
  notes?: string;
  manageUrl: string;
}

function hasEmailProviderConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESET_FROM_EMAIL);
}

export async function sendEventRegistrationEmail(input: EventRegistrationEmailInput) {
  if (!hasEmailProviderConfigured()) {
    console.info(`[registration-email] Confirmation for ${input.to}: ${input.manageUrl}`);
    return;
  }

  const payload = {
    from: process.env.RESET_FROM_EMAIL,
    to: [input.to],
    subject: `You are signed up: ${input.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">Event registration confirmed</h2>
        <p>Hello ${input.fullName || "volunteer"},</p>
        <p>Your registration has been confirmed. Here are your event details:</p>
        <ul style="padding-left: 20px;">
          <li><strong>Event:</strong> ${input.eventName}</li>
          <li><strong>Community:</strong> ${input.communityName || "UDS"}</li>
          <li><strong>Dates:</strong> ${input.eventDateRange}</li>
          <li><strong>Timezone:</strong> ${input.timezone}</li>
          <li><strong>Location:</strong> ${input.venueName}</li>
          <li><strong>Shift:</strong> ${input.shiftLabel}</li>
          ${input.notes ? `<li><strong>Notes:</strong> ${input.notes}</li>` : ""}
        </ul>
        <p>
          <a href="${input.manageUrl}" style="display: inline-block; margin: 10px 0; padding: 10px 16px; border-radius: 9999px; background: #0369a1; color: #ffffff; text-decoration: none;">
            View or manage my registration
          </a>
        </p>
      </div>
    `,
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[registration-email] Failed to send: ${response.status} ${body}`);
    }
  } catch (error) {
    console.error("[registration-email] Unexpected error while sending registration email", error);
  }
}
