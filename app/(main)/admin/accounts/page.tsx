import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApprovalStatus, Profile, UserRole } from "@/lib/types";
import { createDefaultAdmin, grantAdmin, revokeAdmin } from "./accountActions";

type AccountRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  company_name: string | null;
  role: UserRole;
  organizer_status: ApprovalStatus;
};

async function listAllAuthUsers() {
  const supabase = createAdminClient();
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error("アカウント一覧を読み込めませんでした。");

    users.push(...data.users);
    if (data.users.length < 100) break;
    page += 1;
  }

  return users;
}

function toAccountRows(profiles: Profile[], authUsers: Awaited<ReturnType<typeof listAllAuthUsers>>) {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const rows = new Map<string, AccountRow>();

  for (const user of authUsers) {
    const profile = profileById.get(user.id);
    rows.set(user.id, {
      id: user.id,
      email: profile?.email || user.email || null,
      display_name:
        profile?.display_name ||
        String(user.user_metadata?.display_name || user.user_metadata?.full_name || "") ||
        null,
      company_name:
        profile?.company_name ||
        (typeof user.user_metadata?.company_name === "string" ? user.user_metadata.company_name : null),
      role: profile?.role || "member",
      organizer_status:
        profile?.organizer_status ||
        (user.user_metadata?.requested_role === "organizer" ? "pending" : "none")
    });
  }

  for (const profile of profiles) {
    if (!rows.has(profile.id)) {
      rows.set(profile.id, {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        company_name: profile.company_name,
        role: profile.role,
        organizer_status: profile.organizer_status
      });
    }
  }

  const uniqueByEmail = new Map<string, AccountRow>();
  for (const row of rows.values()) {
    const key = (row.email || row.id).toLowerCase();
    if (!uniqueByEmail.has(key)) uniqueByEmail.set(key, row);
  }

  return Array.from(uniqueByEmail.values()).sort((a, b) =>
    (a.email || "").localeCompare(b.email || "")
  );
}

export default async function AdminAccountsPage() {
  const currentAdmin = await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: rawProfiles = [] }, authUsers] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    listAllAuthUsers()
  ]);

  const accounts = toAccountRows((rawProfiles ?? []) as Profile[], authUsers);

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
            {accounts.map((account) => (
              <tr key={account.id} className="border-b">
                <td className="p-3 font-bold">{account.display_name || "-"}</td>
                <td className="p-3">{account.email || "-"}</td>
                <td className="p-3">{account.company_name || "-"}</td>
                <td className="p-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {account.role}
                  </span>
                </td>
                <td className="p-3">{account.organizer_status}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={grantAdmin}>
                      <input type="hidden" name="id" value={account.id} />
                      <button
                        disabled={account.role === "admin"}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        管理者にする
                      </button>
                    </form>
                    <form action={revokeAdmin}>
                      <input type="hidden" name="id" value={account.id} />
                      <button
                        disabled={account.role !== "admin" || account.id === currentAdmin.id}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        管理者解除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!accounts.length && (
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
