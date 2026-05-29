import { useState } from "react";
import { deleteDocument } from "@/app/(main)/events/[id]/eventManagerActions";
import { Trash2, Download, File, FileText, Image } from "lucide-react";
import type { EventDocument } from "@/lib/types";

interface DocumentsListProps {
  documents: EventDocument[];
  onDelete: () => void;
  isOrganizerView: boolean;
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return <File className="h-5 w-5" />;
  if (fileType.startsWith("image/")) return <Image className="h-5 w-5" />;
  if (fileType.includes("pdf") || fileType.includes("document") || fileType.includes("word")) {
    return <FileText className="h-5 w-5" />;
  }
  return <File className="h-5 w-5" />;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DocumentsList({
  documents,
  onDelete,
  isOrganizerView,
}: DocumentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (documentId: string, eventId: string) => {
    if (!window.confirm("このファイルを削除しますか？")) return;

    setDeletingId(documentId);
    try {
      await deleteDocument(documentId, eventId);
      onDelete();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <File className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p className="text-slate-500">ファイルがアップロードされていません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 hover:bg-blue-50 transition-colors group"
        >
          <div className="flex-shrink-0 text-slate-400 group-hover:text-blue-600">
            {getFileIcon(doc.file_type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600">
              {doc.title}
            </p>
            <p className="text-xs text-slate-500">
              {formatFileSize(doc.file_size)} • 
              {new Date(doc.created_at).toLocaleString("ja-JP", {
                timeZone: "Asia/Tokyo",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
            {isOrganizerView && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(doc.id, doc.event_id);
                }}
                disabled={deletingId === doc.id}
                className="text-slate-400 hover:text-red-600 transition-colors"
                title="削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
