import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { approveOrganizer, rejectOrganizer } from "./organizerActions";
import type { Profile } from "@/lib/types";

export default async function AdminOrganizersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: pending = [] } = await supabase.from("profiles").select("*").eq("organizer_status", "pending");
  const { data: approved = [] } = await supabase.from("profiles").select("*").eq("organizer_status", "approved");

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-[1600px]">
        <h1 className="text-5xl font-black tracking-tight">Organizer Approval</h1>
        <p className="mt-3 text-slate-500">主催者アカウント申請を承認・拒否できます。</p>

        <section className="card mt-8 overflow-x-auto p-7">
          <h2 className="text-3xl font-black">承認待ち</h2>
          <table className="mt-6 w-full text-left">
            <thead><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Company</th><th className="p-3">Action</th></tr></thead>
            <tbody>
              {(pending as Profile[]).map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3">{p.display_name}</td>
                  <td className="p-3">{p.email}</td>
                  <td className="p-3">{p.company_name}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <form action={approveOrganizer}><input type="hidden" name="id" value={p.id} /><button className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white">Approve</button></form>
                      <form action={rejectOrganizer}><input type="hidden" name="id" value={p.id} /><button className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white">Reject</button></form>
                    </div>
                  </td>
                </tr>
              ))}
              {!pending?.length && <tr><td colSpan={4} className="p-3 text-slate-500">承認待ちの申請はありません。</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="card mt-8 overflow-x-auto p-7">
          <h2 className="text-3xl font-black">承認済み Organizer</h2>
          <table className="mt-6 w-full text-left">
            <thead><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Company</th></tr></thead>
            <tbody>
              {(approved as Profile[]).map((p) => (
                <tr key={p.id} className="border-b"><td className="p-3">{p.display_name}</td><td className="p-3">{p.email}</td><td className="p-3">{p.company_name}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
