import Link from "next/link";
import { Copy, Edit3, Eye, EyeOff, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { approveEvent, copyEvent, deleteEvent, unpublishEvent } from "./eventActions";
import type { Event } from "@/lib/types";

const statusLabel: Record<string, string> = {
  pending: "承認待ち",
  published: "公開中",
  rejected: "却下",
  draft: "下書き"
};

export default async function AdminEventsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: events = [] } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tight">イベント管理</h1>
          <p className="mt-3 text-slate-500">イベントの編集、公開、下書きへの移動、コピー、削除を管理できます。</p>
        </div>
        <Link href="/events/new" className="btn btn-primary">
          イベント作成
        </Link>
      </div>

      <div className="card mt-8 overflow-x-auto p-7">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">イベント名</th>
              <th className="p-3">主催者</th>
              <th className="p-3">日付</th>
              <th className="p-3">状態</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {(events as Event[]).map((event) => (
              <tr key={event.id} className="border-b align-top">
                <td className="p-3 font-bold">{event.title}</td>
                <td className="p-3">{event.organizer_name}</td>
                <td className="p-3">{new Date(event.starts_at).toLocaleDateString("ja-JP")}</td>
                <td className="p-3">
                  <span className={`status status-${event.status}`}>{statusLabel[event.status] || event.status}</span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/events/${event.id}/edit`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                      <Edit3 size={15} /> 修正
                    </Link>
                    <form action={approveEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700">
                        <Eye size={15} /> 公開
                      </button>
                    </form>
                    <form action={unpublishEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white hover:bg-amber-600">
                        <EyeOff size={15} /> 下書き
                      </button>
                    </form>
                    <form action={copyEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-sm font-bold text-white hover:bg-purple-700">
                        <Copy size={15} /> コピー
                      </button>
                    </form>
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700">
                        <Trash2 size={15} /> 削除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!events?.length && (
              <tr>
                <td colSpan={5} className="p-3 text-slate-500">
                  管理できるイベントはありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
