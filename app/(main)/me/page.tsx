import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function MePage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: registrations = [] } = await supabase
    .from("registrations")
    .select("*, events(title, starts_at)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="text-5xl font-black tracking-tight">My Page</h1>
      <section className="card mt-8 p-7">
        <h2 className="text-2xl font-black">{profile.display_name || profile.email}</h2>
        <p className="mt-2 text-slate-500">Role: {profile.role} / Organizer: {profile.organizer_status}</p>
      </section>

      <section className="card mt-8 overflow-x-auto p-7">
        <h2 className="text-3xl font-black">My Event Registrations</h2>
        <table className="mt-6 w-full text-left">
          <thead><tr className="border-b"><th className="p-3">Event</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {(registrations as any[]).map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.events?.title}</td>
                <td className="p-3">{r.events?.starts_at ? new Date(r.events.starts_at).toLocaleDateString("ja-JP") : ""}</td>
                <td className="p-3"><span className={`status status-${r.status}`}>{r.status}</span></td>
              </tr>
            ))}
            {!registrations?.length && <tr><td colSpan={3} className="p-3 text-slate-500">No registrations.</td></tr>}
          </tbody>
        </table>
      </section>
    </main>
  );
}
