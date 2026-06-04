import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, textToHtml } from "@/lib/email";

const CANONICAL_SITE_URL = "https://www.gaia2016.com";

function getSiteUrl() {
  const configuredUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").replace(/\/$/, "");
  if (!configuredUrl) return CANONICAL_SITE_URL;
  if (configuredUrl.includes(".vercel.app")) return CANONICAL_SITE_URL;
  return configuredUrl;
}

function getEventUrl(eventId: string) {
  const siteUrl = getSiteUrl();
  return siteUrl ? `${siteUrl}/events/${eventId}` : `/events/${eventId}`;
}

async function getProfileEmails(userIds: string[]) {
  if (!userIds.length) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("profiles").select("id, email").in("id", userIds);

  if (error) {
    console.error("Could not load email recipients:", error.message);
  }

  const emailsByUserId = new Map<string, string>();

  for (const profile of data || []) {
    if (profile.email) emailsByUserId.set(profile.id, profile.email);
  }

  const missingUserIds = userIds.filter((userId) => !emailsByUserId.has(userId));

  await Promise.all(
    missingUserIds.map(async (userId) => {
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      if (authError) {
        console.error("Could not load auth email recipient:", authError.message);
        return;
      }

      const email = authData.user?.email;
      if (email) emailsByUserId.set(userId, email);
    })
  );

  return [...new Set([...emailsByUserId.values()].filter(Boolean))];
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

  const result = await sendEmail({ to: emails, subject, text, html });
  if (!result.ok) {
    console.error("Could not send event email notification:", result.message);
  }
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
    status === "approved" ? `参加申込が承認されました: ${eventTitle}` : `参加申込が却下されました: ${eventTitle}`;
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

export async function sendRegistrationSubmittedEmail(registrationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("event_id, user_id, status, events(title, organizer_id, approval_mode)")
    .eq("id", registrationId)
    .single();

  if (error || !data) {
    if (error) console.error("Could not load registration submission for email:", error.message);
    return;
  }

  const eventData = Array.isArray(data.events) ? data.events[0] : data.events;
  const organizerId = eventData?.organizer_id;
  if (!organizerId || organizerId === data.user_id) return;

  const { data: participant, error: participantError } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", data.user_id)
    .maybeSingle();

  if (participantError) {
    console.error("Could not load registration participant for email:", participantError.message);
  }

  const participantName = participant?.display_name || participant?.email || "参加者";
  const eventTitle = eventData?.title || "イベント";
  const isAutoApproval = eventData?.approval_mode === "auto" || data.status === "approved";
  const subject = isAutoApproval
    ? `新しい参加者が参加しました: ${eventTitle}`
    : `参加申込の承認が必要です: ${eventTitle}`;
  const message = isAutoApproval
    ? `${participantName}さんが「${eventTitle}」に参加しました。`
    : `${participantName}さんが「${eventTitle}」への参加を申し込みました。主催者ダッシュボードで承認または却下してください。`;

  await sendEventEmailToUsers({
    userIds: [organizerId],
    eventId: data.event_id,
    subject,
    message
  });
}

export async function sendCommentNotificationEmail(eventId: string, commenterId: string, comment: string) {
  const supabase = createAdminClient();
  const [{ data: event, error: eventError }, { data: commenter, error: commenterError }] = await Promise.all([
    supabase.from("events").select("id, title, organizer_id").eq("id", eventId).single(),
    supabase.from("profiles").select("display_name, email").eq("id", commenterId).maybeSingle()
  ]);

  if (eventError || !event) {
    if (eventError) console.error("Could not load event for comment email:", eventError.message);
    return;
  }

  if (event.organizer_id === commenterId) return;

  if (commenterError) {
    console.error("Could not load commenter profile for email:", commenterError.message);
  }

  const commenterName = commenter?.display_name || commenter?.email || "A participant";
  const eventTitle = event.title || "Event";
  const message = `${commenterName} commented on your event "${eventTitle}".\n\nComment:\n${comment}`;

  await sendEventEmailToUsers({
    userIds: [event.organizer_id],
    eventId,
    subject: `New comment on your event: ${eventTitle}`,
    message
  });
}
