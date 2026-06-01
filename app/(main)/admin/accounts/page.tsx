import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { AdminAccountsClient } from "./AdminAccountsClient";
import type { AccountRow } from "./AdminAccountsClient";

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
    const isOrganizer = user.user_metadata?.requested_role === "organizer";

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
      role: profile?.role || (isOrganizer ? "organizer" : "member"),
      organizer_status: profile?.organizer_status || (isOrganizer ? "approved" : "none")
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
      <AdminAccountsClient initialAccounts={accounts} currentAdminId={currentAdmin.id} />
    </main>
  );
}
