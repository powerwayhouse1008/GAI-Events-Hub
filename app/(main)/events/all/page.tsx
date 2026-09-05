import Link from "next/link";
import { CalendarDays, ChevronLeft, MapPin, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

const categories = ["AI", "Tech", "Startup", "Developer", "Seminar", "Networking", "Hackathon", "Web3", "Robotics"];
const regions = ["Tokyo", "Osaka", "Kyoto", "Singapore", "Seoul", "Taipei", "Hong Kong", "Bangkok", "Online"];
const archiveEventColumns = "id,title,description,category,region,location,cover_url,starts_at,ends_at";

function formatDate(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
  });
}

function isPastEvent(event: Event) {
  const end = event.ends_at || event.starts_at;
  return new Date(end).getTime() < Date.now();
}

function EventArchiveCard({ event }: { event: Event }) {
  const isPast = isPastEvent(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group grid overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.1] md:grid-cols-[280px_1fr]"
    >
      <div className="h-56 overflow-hidden bg-slate-900 md:h-full">
        {event.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-violet-600 to-cyan-400 text-6xl font-black text-white">
            AI
          </div>
        )}
      </div>
      <div className="grid gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-black ${isPast ? "bg-slate-200 text-slate-700" : "bg-emerald-200 text-emerald-800"}`}>
            {isPast ? "Past Event" : "Upcoming"}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-cyan-200">{event.category || "AI"}</span>
        </div>
        <h2 className="text-2xl font-black leading-tight text-white">{event.title}</h2>
        <p className="line-clamp-3 leading-7 text-slate-300">{event.description || "AI community event"}</p>
        <div className="grid gap-2 text-sm font-bold text-slate-300 md:grid-cols-2">
          <p className="flex items-center gap-2">
            <CalendarDays size={16} /> {formatDate(event.starts_at)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={16} /> {event.location || event.region || "Online"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function AllEventsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; region?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select(archiveEventColumns)
    .eq("status", "published")
    .order("starts_at", { ascending: false });

  if (sp.q) query = query.ilike("title", `%${sp.q}%`);
  if (sp.category) query = query.eq("category", sp.category);
  if (sp.region) query = query.eq("region", sp.region);

  const { data: events = [] } = await query;

  return (
    <main className="min-h-screen bg-[#070817] px-6 py-10 text-white">
      <div className="mx-auto max-w-[1400px]">
        <Link href="/events" className="inline-flex items-center gap-2 font-bold text-cyan-200 hover:text-white">
          <ChevronLeft size={18} /> Events
        </Link>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">Event Archive</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight">All Events</h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              これまでに公開されたすべてのイベントを、過去の開催分から今後の予定まで確認できます。
            </p>
          </div>
          <Link href="/events/new" className="btn bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
            Create Event
          </Link>
        </div>

        <form className="mt-8 grid gap-3 rounded-[28px] border border-white/15 bg-white/10 p-2 backdrop-blur md:grid-cols-[1fr_180px_180px_auto]">
          <input
            className="rounded-full bg-transparent px-5 py-3 text-white outline-none placeholder:text-slate-400"
            name="q"
            defaultValue={sp.q}
            placeholder="Search all events..."
          />
          <select className="rounded-full bg-[#121429] px-4 py-3 text-white outline-none" name="category" defaultValue={sp.category || ""}>
            <option value="">Category</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select className="rounded-full bg-[#121429] px-4 py-3 text-white outline-none" name="region" defaultValue={sp.region || ""}>
            <option value="">Region</option>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
          <button className="btn bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
            <Search size={18} /> Search
          </button>
        </form>

        <div className="mt-8 grid gap-5">
          {((events || []) as Event[]).map((event) => (
            <EventArchiveCard key={event.id} event={event} />
          ))}
          {!events?.length && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-10 text-center text-slate-300">
              No events found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
