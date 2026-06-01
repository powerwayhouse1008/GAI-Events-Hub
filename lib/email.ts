type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

function getRecipients(to: string | string[]) {
  return (Array.isArray(to) ? to : [to])
    .map((email) => email.trim())
    .filter((email) => email.includes("@"));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function textToHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  const recipients = getRecipients(to);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!recipients.length) return { ok: true, skipped: true };

  if (!apiKey || !from) {
    console.warn("Email notification skipped: RESEND_API_KEY or EMAIL_FROM is not configured.");
    return { ok: true, skipped: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        text,
        html: html || textToHtml(text)
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Email notification failed:", detail);
      return { ok: false, message: detail };
    }

    return { ok: true };
  } catch (error) {
    console.error("Email notification failed:", error);
    return { ok: false, message: error instanceof Error ? error.message : "Unknown email error" };
  }
}
