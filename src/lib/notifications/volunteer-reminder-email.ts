interface VolunteerReminderEmailInput {
  to: string;
  fullName: string;
  eventName: string;
  communityName?: string;
  eventDateRange: string;
  timezone: string;
  venueName: string;
  shiftLabel: string;
  eventUrl?: string;
  notes?: string;
}

function hasEmailProviderConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESET_FROM_EMAIL);
}

export async function sendVolunteerReminderEmail(input: VolunteerReminderEmailInput) {
  if (!hasEmailProviderConfigured()) {
    console.info(`[volunteer-reminder] Reminder for ${input.to}: ${input.eventName} at ${input.shiftLabel}`);
    return;
  }

  const payload = {
    from: process.env.RESET_FROM_EMAIL,
    to: [input.to],
    subject: `Reminder: ${input.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">Volunteer reminder</h2>
        <p>Hello ${input.fullName || "volunteer"},</p>
        <p>This is a reminder for your upcoming volunteer shift.</p>
        <ul style="padding-left: 20px;">
          <li><strong>Event:</strong> ${input.eventName}</li>
          <li><strong>Community:</strong> ${input.communityName || "UDS"}</li>
          <li><strong>Dates:</strong> ${input.eventDateRange}</li>
          <li><strong>Timezone:</strong> ${input.timezone}</li>
          <li><strong>Location:</strong> ${input.venueName}</li>
          <li><strong>Shift:</strong> ${input.shiftLabel}</li>
          ${input.notes ? `<li><strong>Notes:</strong> ${input.notes}</li>` : ""}
        </ul>
        ${input.eventUrl ? `
          <p>
            <a href="${input.eventUrl}" style="display: inline-block; margin: 10px 0; padding: 10px 16px; border-radius: 9999px; background: #0369a1; color: #ffffff; text-decoration: none;">
              View event details
            </a>
          </p>
        ` : ""}
        <p>Thank you for helping with the event.</p>
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
      console.error(`[volunteer-reminder] Failed to send: ${response.status} ${body}`);
    }
  } catch (error) {
    console.error("[volunteer-reminder] Unexpected error while sending reminder email", error);
  }
}
