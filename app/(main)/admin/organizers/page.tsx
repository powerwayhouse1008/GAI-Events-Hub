import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { approveOrganizer, rejectOrganizer, syncOrganizerRequests } from "./organizerActions";

export default async function AdminOrganizersPage() {
  await requireAdmin();
  await syncOrganizerRequests();

  const supabase = createAdminClient();

  const { data: pending = [] } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "member")
    .eq("organizer_status", "pending")
    .order("created_at", { ascending: false });

  const { data: approved = [] } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "organizer")
    .eq("organizer_status", "approved")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-[1600px]">
        <h1 className="text-5xl font-black tracking-tight">主催者アカウント承認</h1>
        <p className="mt-3 text-slate-500">
          主催者としてイベントを作成したいアカウントを承認または却下できます。
        </p>

        <section className="card mt-8 overflow-x-auto p-7">
          <h2 className="text-3xl font-black">承認待ち</h2>
          <table className="mt-6 w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">名前</th>
                <th className="p-3">メール</th>
                <th className="p-3">会社・コミュニティ</th>
                <th className="p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {((pending ?? []) as Profile[]).map((profile) => (
                <tr key={profile.id} className="border-b">
                  <td className="p-3">{profile.display_name || "-"}</td>
                  <td className="p-3">{profile.email || "-"}</td>
                  <td className="p-3">{profile.company_name || "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <form action={approveOrganizer}>
                        <input type="hidden" name="id" value={profile.id} />
                        <button className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700">
                          承認
                        </button>
                      </form>
                      <form action={rejectOrganizer}>
                        <input type="hidden" name="id" value={profile.id} />
                        <button className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700">
                          却下
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {!pending?.length && (
                <tr>
                  <td colSpan={4} className="p-3 text-slate-500">
                    承認待ちの主催者申請はありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="card mt-8 overflow-x-auto p-7">
          <h2 className="text-3xl font-black">承認済み主催者</h2>
          <table className="mt-6 w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">名前</th>
                <th className="p-3">メール</th>
                <th className="p-3">会社・コミュニティ</th>
              </tr>
            </thead>
            <tbody>
              {((approved ?? []) as Profile[]).map((profile) => (
                <tr key={profile.id} className="border-b">
                  <td className="p-3">{profile.display_name || "-"}</td>
                  <td className="p-3">{profile.email || "-"}</td>
                  <td className="p-3">{profile.company_name || "-"}</td>
                </tr>
              ))}
              {!approved?.length && (
                <tr>
                  <td colSpan={3} className="p-3 text-slate-500">
                    承認済み主催者はまだいません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
