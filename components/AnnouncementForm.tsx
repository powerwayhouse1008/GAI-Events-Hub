import { useState } from "react";
import { createAnnouncement } from "@/app/(main)/events/[id]/eventManagerActions";
import { Bell, X } from "lucide-react";

interface AnnouncementFormProps {
  eventId: string;
  onSuccess: () => void;
}

export function AnnouncementForm({ eventId, onSuccess }: AnnouncementFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("タイトルと内容を入力してください。");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await createAnnouncement(eventId, title, content);
      setTitle("");
      setContent("");
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "通知を送信できませんでした。");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary gap-2"
      >
        <Bell className="h-4 w-4" />
        新しい通知
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center overflow-y-auto bg-black/60 p-4 sm:p-6">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-6">
          <h3 className="text-xl font-bold">通知を送信</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4">
            <div>
              <label className="label">
                <span className="label-text font-bold">タイトル</span>
              </label>
              <input
                type="text"
                placeholder="通知タイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-bold">内容</span>
              </label>
              <textarea
                placeholder="通知内容を入力"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="textarea textarea-bordered max-h-36 min-h-28 w-full"
                rows={4}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-100 p-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-2 border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost flex-1"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? "送信中..." : "送信"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
