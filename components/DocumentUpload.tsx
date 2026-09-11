import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uploadDocument } from "@/app/(main)/events/[id]/eventManagerActions";
import { useLanguage } from "@/components/LanguageProvider";
import { Upload, X } from "lucide-react";

interface DocumentUploadProps {
  eventId: string;
  onSuccess: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentUpload({ eventId, onSuccess, isOpen, onOpenChange }: DocumentUploadProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    if (!isLoading) onOpenChange(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError(t("ファイルサイズは50MB以下にしてください。"));
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError(t("ファイルを選択してください。"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await uploadDocument(eventId, file, title || file.name);
      setTitle("");
      setFile(null);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? t(err.message) : t("ファイルのアップロードに失敗しました。"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => onOpenChange(true)} className="btn btn-secondary gap-2 text-white" type="button">
        <Upload className="h-4 w-4" />
        {t("ファイルをアップロード")}
      </button>
    );
  }

  return createPortal(
    <div className="fixed inset-0 grid place-items-center bg-black/60 p-4 sm:p-6" style={{ zIndex: 2147483647 }}>
      <div className="flex max-h-[min(620px,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-6">
          <h3 className="text-xl font-bold">{t("ファイルをアップロード")}</h3>
          <button onClick={close} className="text-slate-400 hover:text-slate-600" type="button" aria-label={t("閉じる")}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <label className="grid gap-2">
              <span className="label-text font-bold">{t("ファイルタイトル（任意）")}</span>
              <input type="text" placeholder={t("ファイルタイトルを入力")} value={title} onChange={(event) => setTitle(event.target.value)} className="input input-bordered w-full" disabled={isLoading} />
            </label>

            <label className="grid gap-2">
              <span className="label-text font-bold">{t("ファイルを選択")}</span>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition-colors hover:border-purple-400 hover:bg-purple-50" disabled={isLoading}>
                <span className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="max-w-full truncate text-sm font-medium text-slate-600">{file ? file.name : t("クリックしてファイルを選択")}</span>
                  <span className="text-xs text-slate-500">{t("最大 50MB")}</span>
                </span>
              </button>
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" disabled={isLoading} />
            </label>

            {error && <div className="rounded-lg bg-red-100 p-3 text-sm font-bold text-red-700">{error}</div>}
          </div>

          <div className="flex shrink-0 gap-2 border-t border-slate-100 bg-white px-6 py-4">
            <button type="button" onClick={close} className="btn btn-ghost flex-1" disabled={isLoading}>
              {t("キャンセル")}
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={isLoading || !file}>
              {isLoading ? t("アップロード中...") : t("アップロード")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
