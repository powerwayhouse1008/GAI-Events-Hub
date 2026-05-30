import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ count: pendingOrganizers = 0 }, { count: pendingEvents = 0 }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("organizer_status", "pending"),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
    ]);

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="text-5xl font-black tracking-tight">Admin Dashboard</h1>
      <p className="mt-3 text-slate-500">
        Review organizer requests, approve events, and manage account permissions.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Link href="/admin/organizers" className="card p-7 hover:bg-purple-50">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
            Organizer Requests
          </p>
          <p className="mt-4 text-4xl font-black">{pendingOrganizers}</p>
          <p className="mt-2 text-slate-500">Pending organizer accounts</p>
        </Link>

        <Link href="/admin/events" className="card p-7 hover:bg-purple-50">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
            Event Approval
          </p>
          <p className="mt-4 text-4xl font-black">{pendingEvents}</p>
          <p className="mt-2 text-slate-500">Pending events</p>
        </Link>

        <Link href="/admin/accounts" className="card p-7 hover:bg-purple-50">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
            Accounts
          </p>
          <p className="mt-4 text-4xl font-black">Admin</p>
          <p className="mt-2 text-slate-500">Grant or remove admin access</p>
        </Link>
      </div>
    </main>
  );
}
