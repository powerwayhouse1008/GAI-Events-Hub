import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { approveEvent, deleteEvent, featureEvent, rejectEvent } from "./eventActions";
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
      <h1 className="text-5xl font-black tracking-tight">イベント承認</h1>
      <p className="mt-3 text-slate-500">
        主催者が作成・更新したイベントを確認し、公開可否を決定します。
      </p>

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
              <tr key={event.id} className="border-b">
                <td className="p-3 font-bold">{event.title}</td>
                <td className="p-3">{event.organizer_name}</td>
                <td className="p-3">{new Date(event.starts_at).toLocaleDateString("ja-JP")}</td>
                <td className="p-3">
                  <span className={`status status-${event.status}`}>
                    {statusLabel[event.status] || event.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={approveEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white">
                        公開承認
                      </button>
                    </form>
                    <form action={rejectEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white">
                        却下
                      </button>
                    </form>
                    <form action={featureEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="rounded-xl bg-purple-600 px-3 py-2 text-sm font-bold text-white">
                        注目切替
                      </button>
                    </form>
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white">
                        削除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!events?.length && (
              <tr>
                <td colSpan={5} className="p-3 text-slate-500">
                  確認できるイベントはありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
