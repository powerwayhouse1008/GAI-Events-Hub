import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { approveEvent, rejectEvent, deleteEvent, featureEvent } from "./eventActions";
import type { Event } from "@/lib/types";

export default async function AdminEventsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: events = [] } = await supabase.from("events").select("*").order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <h1 className="text-5xl font-black tracking-tight">Event Approval</h1>
      <div className="card mt-8 overflow-x-auto p-7">
        <table className="w-full text-left">
          <thead><tr className="border-b"><th className="p-3">Title</th><th className="p-3">Organizer</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {(events as Event[]).map((event) => (
              <tr key={event.id} className="border-b">
                <td className="p-3 font-bold">{event.title}</td>
                <td className="p-3">{event.organizer_name}</td>
                <td className="p-3">{new Date(event.starts_at).toLocaleDateString("ja-JP")}</td>
                <td className="p-3"><span className={`status status-${event.status}`}>{event.status}</span></td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={approveEvent}><input type="hidden" name="id" value={event.id} /><button className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white">承認</button></form>
                    <form action={rejectEvent}><input type="hidden" name="id" value={event.id} /><button className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white">拒否</button></form>
                    <form action={featureEvent}><input type="hidden" name="id" value={event.id} /><button className="rounded-xl bg-purple-600 px-3 py-2 text-sm font-bold text-white">Featured</button></form>
                    <form action={deleteEvent}><input type="hidden" name="id" value={event.id} /><button className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white">削除</button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
