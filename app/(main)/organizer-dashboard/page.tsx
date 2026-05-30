import Link from "next/link";
import { requireOrganizer } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveRegistration, rejectRegistration } from "./registrationActions";
import type { Event } from "@/lib/types";

const statusLabel: Record<string, string> = {
  pending: "承認待ち",
  published: "公開中",
  rejected: "却下",
  draft: "下書き",
  approved: "承認済み"
};

export default async function OrganizerDashboard() {
  const profile = await requireOrganizer();
  const supabase = createAdminClient();

  const query = supabase.from("events").select("*").order("created_at", { ascending: false });
  const { data: events = [] } =
    profile.role === "admin" ? await query : await query.eq("organizer_id", profile.id);

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-5xl font-black tracking-tight">主催者ダッシュボード</h1>
        <Link href="/events/new" className="btn btn-primary">
          イベント作成
        </Link>
      </div>

      <div className="mt-8 grid gap-6">
        {(events as Event[]).map(async (event) => {
          const { data: registrations = [] } = await supabase
            .from("registrations")
            .select("id, status, message, created_at, profiles:user_id(display_name,email)")
            .eq("event_id", event.id)
            .order("created_at", { ascending: false });

          return (
            <section key={event.id} className="card p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black">
                    {event.title}{" "}
                    <span className={`status status-${event.status}`}>
                      {statusLabel[event.status] || event.status}
                    </span>
                  </h2>
                  <p className="mt-2 text-slate-500">
                    {new Date(event.starts_at).toLocaleDateString("ja-JP")} /{" "}
                    {event.approval_mode === "auto" ? "参加者自動承認" : "参加者手動承認"}
                  </p>
                  {event.status === "pending" && (
                    <p className="mt-2 text-sm font-bold text-amber-600">
                      管理者の公開承認待ちです。承認後に参加申込が可能になります。
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                  >
                    管理
                  </Link>
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-bold text-white"
                  >
                    編集
                  </Link>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3">申込者</th>
                      <th className="p-3">メール</th>
                      <th className="p-3">状態</th>
                      <th className="p-3">メッセージ</th>
                      <th className="p-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(registrations as any[]).map((registration) => {
                      const profileRow = Array.isArray(registration.profiles)
                        ? registration.profiles[0]
                        : registration.profiles;

                      return (
                        <tr key={registration.id} className="border-b">
                          <td className="p-3">{profileRow?.display_name || "-"}</td>
                          <td className="p-3">{profileRow?.email || "-"}</td>
                          <td className="p-3">
                            <span className={`status status-${registration.status}`}>
                              {statusLabel[registration.status] || registration.status}
                            </span>
                          </td>
                          <td className="p-3">{registration.message || "-"}</td>
                          <td className="p-3">
                            {event.approval_mode === "manual" && registration.status === "pending" ? (
                              <div className="flex gap-2">
                                <form action={approveRegistration}>
                                  <input type="hidden" name="id" value={registration.id} />
                                  <button className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white">
                                    承認
                                  </button>
                                </form>
                                <form action={rejectRegistration}>
                                  <input type="hidden" name="id" value={registration.id} />
                                  <button className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white">
                                    却下
                                  </button>
                                </form>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-500">
                                {event.approval_mode === "auto" ? "自動承認済み" : "操作不要"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {!registrations?.length && (
                      <tr>
                        <td className="p-3 text-slate-500" colSpan={5}>
                          参加申込はまだありません。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
