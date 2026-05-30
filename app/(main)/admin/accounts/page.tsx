import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { createDefaultAdmin, grantAdmin, revokeAdmin } from "./accountActions";

export default async function AdminAccountsPage() {
  const currentAdmin = await requireAdmin();
  const supabase = createAdminClient();

  const { data: profiles = [] } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tight">アカウント権限</h1>
          <p className="mt-3 text-slate-500">
            登録済みアカウントに管理者権限を付与または解除できます。
          </p>
        </div>
        <form action={createDefaultAdmin}>
          <button className="rounded-xl bg-purple-700 px-5 py-3 font-bold text-white hover:bg-purple-800">
            mai@powerway.jp を管理者に設定
          </button>
        </form>
      </div>

      <section className="card mt-8 overflow-x-auto p-7">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">名前</th>
              <th className="p-3">メール</th>
              <th className="p-3">会社・コミュニティ</th>
              <th className="p-3">権限</th>
              <th className="p-3">主催者状態</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {(profiles as Profile[]).map((profile) => (
              <tr key={profile.id} className="border-b">
                <td className="p-3 font-bold">{profile.display_name || "-"}</td>
                <td className="p-3">{profile.email || "-"}</td>
                <td className="p-3">{profile.company_name || "-"}</td>
                <td className="p-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {profile.role}
                  </span>
                </td>
                <td className="p-3">{profile.organizer_status}</td>
                <td className="p-3">
                  {profile.role === "admin" ? (
                    <form action={revokeAdmin}>
                      <input type="hidden" name="id" value={profile.id} />
                      <button
                        disabled={profile.id === currentAdmin.id}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        管理者解除
                      </button>
                    </form>
                  ) : (
                    <form action={grantAdmin}>
                      <input type="hidden" name="id" value={profile.id} />
                      <button className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">
                        管理者にする
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {!profiles?.length && (
              <tr>
                <td colSpan={6} className="p-3 text-slate-500">
                  アカウントがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
