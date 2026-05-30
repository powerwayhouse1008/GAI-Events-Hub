import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { count: pendingEvents = 0 } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="text-5xl font-black tracking-tight">管理画面</h1>
      <p className="mt-3 text-slate-500">
        イベント公開承認とアカウント権限を管理できます。主催者アカウントの承認は不要です。
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Link href="/admin/events" className="card p-7 hover:bg-purple-50">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
            イベント承認
          </p>
          <p className="mt-4 text-4xl font-black">{pendingEvents}</p>
          <p className="mt-2 text-slate-500">公開承認待ちのイベント</p>
        </Link>

        <Link href="/admin/accounts" className="card p-7 hover:bg-purple-50">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
            アカウント権限
          </p>
          <p className="mt-4 text-4xl font-black">Admin</p>
          <p className="mt-2 text-slate-500">管理者権限の付与と解除</p>
        </Link>
      </div>
    </main>
  );
}
