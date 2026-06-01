import { createAdminClient } from "@/lib/supabase/admin";
import { sendEventEmailToUsers } from "@/lib/event-email-notifications";

type NotificationType = "announcement" | "document" | "event_update";

export async function notifyEventParticipants({
  eventId,
  actorId,
  type,
  title,
  message
}: {
  eventId: string;
  actorId: string | null;
  type: NotificationType;
  title: string;
  message?: string | null;
}) {
  const supabase = createAdminClient();
  const { data: registrations, error } = await supabase
    .from("registrations")
    .select("user_id")
    .eq("event_id", eventId)
    .in("status", ["pending", "approved"]);

  if (error || !registrations?.length) return;

  const uniqueUserIds = [...new Set(registrations.map((registration) => registration.user_id))].filter(
    (userId) => userId && userId !== actorId
  );

  if (!uniqueUserIds.length) return;

  await Promise.all([
    supabase.from("event_notifications").insert(
      uniqueUserIds.map((userId) => ({
        event_id: eventId,
        user_id: userId,
        actor_id: actorId,
        type,
        title,
        message: message || null
      }))
    ),
    sendEventEmailToUsers({
      userIds: uniqueUserIds,
      eventId,
      subject: title,
      message: message || title
    })
  ]);
}
