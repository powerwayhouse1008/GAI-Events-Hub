import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";
import Link from "next/link";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: events = [] } = await supabase.from("events").select("*").eq("status", "published").order("starts_at");

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-5xl font-black tracking-tight">カレンダー</h1>
      <div className="mt-8 grid gap-4">
        {(events as Event[]).map((e) => (
          <Link key={e.id} href={`/events/${e.id}`} className="card flex items-center justify-between p-5">
            <div>
              <p className="font-black">{e.title}</p>
              <p className="text-slate-500">{new Date(e.starts_at).toLocaleString("ja-JP")}</p>
            </div>
            <span className="status status-approved">{e.category}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
