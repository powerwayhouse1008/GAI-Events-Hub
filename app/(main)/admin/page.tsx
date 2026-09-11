import Link from "next/link";
import { AdminLinkPanel } from "./AdminLinkPanel";
import { LocalizedText } from "@/components/LocalizedText";
import { requireAdmin } from "@/lib/auth";
import { getFooterLinks } from "@/lib/footer-link-settings";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { count: pendingEvents = 0 } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const footerLinks = await getFooterLinks();

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="text-5xl font-black tracking-tight">
        <LocalizedText text="管理者" />
      </h1>
      <p className="mt-3 text-slate-500">
        <LocalizedText text="イベント管理、アカウント権限、サイトリンクを管理できます。" />
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Link href="/admin/events" className="card p-7 hover:bg-purple-50">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
            <LocalizedText text="イベント管理" />
          </p>
          <p className="mt-4 text-4xl font-black">{pendingEvents}</p>
          <p className="mt-2 text-slate-500">
            <LocalizedText text="承認待ちを含むすべてのイベント" />
          </p>
        </Link>

        <Link href="/admin/accounts" className="card p-7 hover:bg-purple-50">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
            <LocalizedText text="アカウント権限" />
          </p>
          <p className="mt-4 text-4xl font-black">Admin</p>
          <p className="mt-2 text-slate-500">
            <LocalizedText text="管理者権限の付与と解除" />
          </p>
        </Link>
      </div>

      <AdminLinkPanel initialLinks={footerLinks} />
    </main>
  );
}
