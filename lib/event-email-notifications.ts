import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, textToHtml } from "@/lib/email";

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

function getEventUrl(eventId: string) {
  const siteUrl = getSiteUrl();
  return siteUrl ? `${siteUrl}/events/${eventId}` : `/events/${eventId}`;
}

async function getProfileEmails(userIds: string[]) {
  if (!userIds.length) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .in("id", userIds);

  if (error) {
    console.error("Could not load email recipients:", error.message);
    return [];
  }

  return [...new Set((data || []).map((profile) => profile.email).filter(Boolean) as string[])];
}

export async function sendEventEmailToUsers({
  userIds,
  eventId,
  subject,
  message
}: {
  userIds: string[];
  eventId: string;
  subject: string;
  message: string;
}) {
  const emails = await getProfileEmails(userIds);
  if (!emails.length) return;

  const eventUrl = getEventUrl(eventId);
  const text = `${message}\n\nイベントを見る: ${eventUrl}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827">
      <p>${textToHtml(message)}</p>
      <p>
        <a href="${eventUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
          イベントを見る
        </a>
      </p>
    </div>
  `;

  await sendEmail({ to: emails, subject, text, html });
}

export async function sendRegistrationStatusEmail(registrationId: string, status: "approved" | "rejected") {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("event_id, user_id, events(title)")
    .eq("id", registrationId)
    .single();

  if (error || !data) {
    if (error) console.error("Could not load registration for email:", error.message);
    return;
  }

  const eventData = Array.isArray(data.events) ? data.events[0] : data.events;
  const eventTitle = eventData?.title || "イベント";
  const subject =
    status === "approved"
      ? `参加申込が承認されました: ${eventTitle}`
      : `参加申込が却下されました: ${eventTitle}`;
  const message =
    status === "approved"
      ? `「${eventTitle}」への参加申込が主催者により承認されました。`
      : `「${eventTitle}」への参加申込が主催者により却下されました。`;

  await sendEventEmailToUsers({
    userIds: [data.user_id],
    eventId: data.event_id,
    subject,
    message
  });
}
