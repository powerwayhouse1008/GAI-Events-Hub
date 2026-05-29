import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Search } from "lucide-react";
import type { Event } from "@/lib/types";

export default async function EventsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; region?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("events").select("*").eq("status", "published").order("starts_at", { ascending: true });

  if (sp.q) query = query.ilike("title", `%${sp.q}%`);
  if (sp.category) query = query.eq("category", sp.category);
  if (sp.region) query = query.eq("region", sp.region);

  const { data: events = [] } = await query;
  const { data: featured = [] } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("starts_at", { ascending: true })
    .limit(6);

  const featuredEvents = (featured?.length ? featured : events?.slice(0, 6)) as Event[];
  const allEvents = (events || []) as Event[];

  const categories = ["AI", "Tech", "Startup", "Developer", "Seminar", "Networking", "Hackathon", "Web3", "Robotics"];
  const regions = ["Tokyo", "Osaka", "Kyoto", "Singapore", "Seoul", "Taipei", "Hong Kong", "Bangkok", "Online"];

  return (
    <main>
      <section className="relative min-h-[520px] bg-[linear-gradient(90deg,rgba(50,35,40,.68),rgba(50,35,40,.16)),url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center text-white">
        <div className="mx-auto max-w-[1800px] px-6 py-24">
          <div className="max-w-xl">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-pink-300/80">◌</div>
            <p className="mt-8 font-bold opacity-80">開催予定のイベント</p>
            <h1 className="mt-2 text-6xl font-black tracking-tight">東京</h1>
            <p className="mt-8 border-t border-white/30 pt-6 leading-8 opacity-90">
              AI、テクノロジー、スタートアップ、開発者コミュニティの注目イベントを探しましょう。
            </p>
            <Link href="/events/new" className="btn mt-8 bg-white text-gai-dark">
              ＋ イベントを申請
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-14">
        <h2 className="text-3xl font-black tracking-tight">イベントをさがす</h2>
        <p className="mt-2 text-slate-500">人気イベント、カテゴリー、地域から検索できます。</p>

        <form className="mt-6 grid gap-3 md:grid-cols-[1fr_200px_200px_auto]">
          <input className="input" name="q" defaultValue={sp.q} placeholder="イベント名、主催者、キーワード" />
          <select className="input" name="category" defaultValue={sp.category || ""}>
            <option value="">カテゴリー</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input" name="region" defaultValue={sp.region || ""}>
            <option value="">地域</option>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button className="btn btn-primary"><Search size={18} />検索</button>
        </form>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight">人気のイベント</h2>
            <p className="text-slate-400">東京</p>
          </div>
          <a href="#all-events" className="rounded-full bg-slate-100 px-4 py-2 font-bold">すべて見る →</a>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {featuredEvents.map((event) => <EventCard key={event.id} event={event} compact />)}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-10">
        <h2 className="text-3xl font-black tracking-tight">カテゴリーから探す</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {categories.map((c) => (
            <Link key={c} href={`/events?category=${c}`} className="card flex items-center gap-4 p-5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-xl">◎</span>
              <div>
                <strong>{c}</strong>
                <p className="text-sm text-slate-400">イベント</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-10">
        <h2 className="text-3xl font-black tracking-tight">地域のイベントをさがす</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {regions.map((r) => (
            <Link key={r} href={`/events?region=${r}`} className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-pink-300 text-white"><MapPin size={18} /></span>
              <div><strong>{r}</strong><p className="text-sm text-slate-400">イベント</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section id="all-events" className="mx-auto grid max-w-[1600px] gap-10 px-6 py-14 lg:grid-cols-[1fr_330px]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">イベント</h2>
            <Link href="/events/new" className="btn bg-slate-100">＋ イベントを申請</Link>
          </div>
          <div className="mt-8 grid gap-6 border-l-2 border-dashed border-slate-200 pl-6">
            {allEvents.map((event) => <EventCard key={event.id} event={event} />)}
            {!allEvents.length && <p className="text-slate-500">イベントがありません。</p>}
          </div>
        </div>

        <aside className="sticky top-24 h-fit">
          <div className="card p-6">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-pink-300 text-white">◌</div>
            <h3 className="mt-4 text-2xl font-black">東京</h3>
            <p className="mt-2 text-slate-500">東京の注目イベントをさがして通知を受け取りましょう。</p>
            <button className="btn btn-primary mt-5 w-full">フォロー</button>
            <div className="mt-6 grid h-56 place-items-center rounded-3xl bg-slate-100 text-4xl font-black text-slate-300">
              MAP
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
