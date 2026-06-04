import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export default async function MePage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: registrations = [] } = await supabase
    .from("registrations")
    .select("*, events(title, starts_at)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: notifications = [] } = await supabase
    .from("event_notifications")
    .select("*, events(title)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="text-5xl font-black tracking-tight">My Page</h1>
      <ProfileForm profile={profile} />

      <section className="card mt-8 p-7">
        <h2 className="text-3xl font-black">Notifications</h2>
        <div className="mt-5 grid gap-3">
          {(notifications as any[]).map((notification) => (
            <a
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-purple-200 hover:bg-purple-50"
              href={`/events/${notification.event_id}`}
              key={notification.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-black text-slate-950">{notification.title}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                  {notification.type}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-500">{notification.events?.title}</p>
              {notification.message && <p className="mt-2 text-sm text-slate-600">{notification.message}</p>}
              <p className="mt-2 text-xs font-bold text-slate-400">
                {new Date(notification.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
              </p>
            </a>
          ))}
          {!notifications?.length && <p className="text-slate-500">No notifications.</p>}
        </div>
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
