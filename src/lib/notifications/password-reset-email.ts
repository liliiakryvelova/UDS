interface PasswordResetEmailInput {
  to: string;
  fullName: string;
  resetUrl: string;
}

function hasEmailProviderConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESET_FROM_EMAIL);
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  if (!hasEmailProviderConfigured()) {
    console.info(`[password-reset] Reset link for ${input.to}: ${input.resetUrl}`);
    return;
  }

  const payload = {
    from: process.env.RESET_FROM_EMAIL,
    to: [input.to],
    subject: "Reset your UDS Events password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">Password reset request</h2>
        <p>Hello ${input.fullName || "volunteer"},</p>
        <p>We received a request to reset your UDS Events password.</p>
        <p>
          <a href="${input.resetUrl}" style="display: inline-block; margin: 10px 0; padding: 10px 16px; border-radius: 9999px; background: #0369a1; color: #ffffff; text-decoration: none;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 30 minutes and can be used only once.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  };

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
    console.error(`[password-reset] Failed to send reset email: ${response.status} ${body}`);
  }
}
