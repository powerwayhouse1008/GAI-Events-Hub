import { useRef, useState } from "react";
import { uploadDocument } from "@/app/(main)/events/[id]/eventManagerActions";
import { Upload, X } from "lucide-react";

interface DocumentUploadProps {
  eventId: string;
  onSuccess: () => void;
}

export function DocumentUpload({ eventId, onSuccess }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("ファイルサイズは50MB以下にしてください。");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("ファイルを選択してください。");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await uploadDocument(eventId, file, title || file.name);
      setTitle("");
      setFile(null);
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ファイルのアップロードに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-secondary gap-2" type="button">
        <Upload className="h-4 w-4" />
        ファイルをアップロード
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">ファイルをアップロード</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-bold">ファイルタイトル（任意）</span>
            </label>
            <input
              type="text"
              placeholder="ファイルタイトルを入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-bold">ファイルを選択</span>
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition-colors hover:border-purple-400 hover:bg-purple-50"
              disabled={isLoading}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-slate-400" />
                <div className="text-sm font-medium text-slate-600">
                  {file ? file.name : "クリックしてファイルを選択"}
                </div>
                <div className="text-xs text-slate-500">最大 50MB</div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
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
              disabled={isLoading || !file}
            >
              {isLoading ? "アップロード中..." : "アップロード"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
