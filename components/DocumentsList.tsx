import { useState } from "react";
import { deleteDocument } from "@/app/(main)/events/[id]/eventManagerActions";
import { Download, ExternalLink, File, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import type { EventDocument } from "@/lib/types";

interface DocumentsListProps {
  documents: EventDocument[];
  onDelete: () => void;
  isOrganizerView: boolean;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileKind(fileType: string | null) {
  if (!fileType) return "file";
  if (fileType.startsWith("image/")) return "image";
  if (fileType === "application/pdf") return "pdf";
  if (fileType.startsWith("video/")) return "video";
  if (fileType.startsWith("audio/")) return "audio";
  if (fileType.startsWith("text/")) return "text";
  return "file";
}

function FileIcon({ fileType }: { fileType: string | null }) {
  const kind = getFileKind(fileType);
  if (kind === "image") return <ImageIcon className="h-5 w-5" />;
  if (kind === "pdf" || kind === "text") return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

function DocumentPreview({ doc }: { doc: EventDocument }) {
  const kind = getFileKind(doc.file_type);

  if (kind === "image") {
    return (
      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={doc.file_url} alt={doc.title} className="max-h-[720px] w-full object-contain" />
      </a>
    );
  }

  if (kind === "pdf") {
    return (
      <iframe
        title={doc.title}
        src={doc.file_url}
        className="h-[620px] w-full rounded-xl border border-slate-200 bg-white"
      />
    );
  }

  if (kind === "video") {
    return <video src={doc.file_url} controls className="max-h-[620px] w-full rounded-xl bg-black" />;
  }

  if (kind === "audio") {
    return <audio src={doc.file_url} controls className="w-full" />;
  }

  if (kind === "text") {
    return (
      <iframe
        title={doc.title}
        src={doc.file_url}
        className="h-[420px] w-full rounded-xl border border-slate-200 bg-white"
      />
    );
  }

  return (
    <a
      href={doc.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 font-bold text-slate-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
    >
      <FileIcon fileType={doc.file_type} />
      ブラウザで開いて表示
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

export function DocumentsList({ documents, onDelete, isOrganizerView }: DocumentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (documentId: string, eventId: string) => {
    if (!window.confirm("このファイルを削除しますか？")) return;

    setDeletingId(documentId);
    try {
      await deleteDocument(documentId, eventId);
      onDelete();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました。");
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <File className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-slate-500">資料・画像はまだアップロードされていません。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {documents.map((doc) => (
        <section key={doc.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-1 text-slate-400">
                <FileIcon fileType={doc.file_type} />
              </div>
              <div className="min-w-0">
                <h4 className="break-words text-lg font-black text-slate-950">{doc.title}</h4>
                <p className="mt-1 text-xs text-slate-500">
                  {formatFileSize(doc.file_size)} /{" "}
                  {new Date(doc.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                <Download className="h-4 w-4" />
                開く
              </a>
              {isOrganizerView && (
                <button
                  onClick={() => handleDelete(doc.id, doc.event_id)}
                  disabled={deletingId === doc.id}
                  className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  title="削除"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  削除
                </button>
              )}
            </div>
          </div>

          <DocumentPreview doc={doc} />
        </section>
      ))}
    </div>
  );
}
