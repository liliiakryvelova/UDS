interface VolunteerReminderEmailInput {
  to: string;
  fullName: string;
  eventName: string;
  communityName?: string;
  eventDateRange: string;
  timezone: string;
  venueName: string;
  shiftLabel: string;
  bannerImageUrl?: string;
  eventUrl?: string;
  notes?: string;
}

type InlineImageAttachment = {
  filename: string;
  contentId: string;
  content?: string;
  path?: string;
};

function prepareBannerImage(bannerImageUrl?: string, eventUrl?: string) {
  const value = bannerImageUrl?.trim();
  if (!value) return undefined;

  const dataUrlMatch = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/i.exec(value);
  if (dataUrlMatch) {
    const mimeType = dataUrlMatch[1].toLowerCase();
    const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.slice("image/".length);
    return {
      src: "cid:event-banner",
      attachment: {
        filename: `event-banner.${extension}`,
        content: dataUrlMatch[2],
        contentId: "event-banner",
      } satisfies InlineImageAttachment,
    };
  }

  try {
    const baseUrl = eventUrl ? new URL(eventUrl) : undefined;
    const imageUrl = baseUrl ? new URL(value, baseUrl.origin) : new URL(value);
    if (imageUrl.protocol !== "https:" && imageUrl.protocol !== "http:") return undefined;

    const extension = imageUrl.pathname.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase() || "jpg";
    return {
      src: "cid:event-banner",
      attachment: {
        filename: `event-banner.${extension}`,
        path: imageUrl.toString(),
        contentId: "event-banner",
      } satisfies InlineImageAttachment,
    };
  } catch {
    return undefined;
  }
}

function hasEmailProviderConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESET_FROM_EMAIL);
}

function isResendTestingModeError(body: string) {
  return body.includes("testing email address") || body.includes("Please use our testing email address");
}

function isBlockedTestDomain(email: string) {
  return /@example\.(com|org|net)$/i.test(email) || /@test\.com$/i.test(email);
}

export async function sendVolunteerReminderEmail(input: VolunteerReminderEmailInput) {
  if (!hasEmailProviderConfigured()) {
    console.info(`[volunteer-reminder] Reminder for ${input.to}: ${input.eventName} at ${input.shiftLabel}`);
    return;
  }

  if (isBlockedTestDomain(input.to)) {
    console.warn(
      `[volunteer-reminder] Skipping send to blocked test domain ${input.to}. ` +
      `Resend rejects example.com/test.com in testing mode. ` +
      `Use a real email or Resend's test inbox (delivered@resend.dev).`,
    );
    return;
  }

  const bannerImage = prepareBannerImage(input.bannerImageUrl, input.eventUrl);

  const payload = {
    from: process.env.RESET_FROM_EMAIL,
    to: [input.to],
    subject: `Reminder: ${input.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        ${bannerImage ? `<p style="margin: 0 0 20px;"><img src="${bannerImage.src}" alt="Event banner" width="640" style="display: block; width: 100%; max-width: 640px; height: auto; border: 0; border-radius: 12px;" /></p>` : ""}
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
          <p style="margin-top: 0; font-size: 13px; color: #475569;">
            Event link: <a href="${input.eventUrl}" style="color: #0369a1;">${input.eventUrl}</a>
          </p>
        ` : ""}
        <p>Thank you for helping with the event.</p>
      </div>
    `,
    ...(bannerImage ? { attachments: [bannerImage.attachment] } : {}),
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

      if (isResendTestingModeError(body)) {
        console.warn(
          `[volunteer-reminder] Resend is in testing mode. ` +
          `To deliver to real inboxes: (1) verify a domain in Resend dashboard, ` +
          `(2) set RESET_FROM_EMAIL to an address on that domain (e.g. events@yourdomain.org), ` +
          `(3) add recipient emails to Resend's "Test Email Addresses" or use delivered@resend.dev.`,
        );
      }
    }
  } catch (error) {
    console.error("[volunteer-reminder] Unexpected error while sending reminder email", error);
  }
}
