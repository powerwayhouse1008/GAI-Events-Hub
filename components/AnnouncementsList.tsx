import { useState } from "react";
import { deleteAnnouncement } from "@/app/(main)/events/[id]/eventManagerActions";
import { Trash2, Bell } from "lucide-react";
import type { Announcement } from "@/lib/types";

interface AnnouncementsListProps {
  announcements: Announcement[];
  onDelete: () => void;
  isOrganizerView: boolean;
}

export function AnnouncementsList({
  announcements,
  onDelete,
  isOrganizerView,
}: AnnouncementsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (announcementId: string, eventId: string) => {
    if (!window.confirm("この通知を削除しますか？")) return;

    setDeletingId(announcementId);
    try {
      await deleteAnnouncement(announcementId, eventId);
      onDelete();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  if (announcements.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p className="text-slate-500">まだ通知がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">{announcement.title}</h4>
              <p className="mt-2 whitespace-pre-wrap text-slate-600 text-sm">
                {announcement.content}
              </p>
              <div className="mt-3 text-xs text-slate-400">
                {new Date(announcement.created_at).toLocaleString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                })}
              </div>
            </div>
            {isOrganizerView && (
              <button
                onClick={() =>
                  handleDelete(announcement.id, announcement.event_id)
                }
                disabled={deletingId === announcement.id}
                className="text-slate-400 hover:text-red-600 transition-colors mt-1"
                title="削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
