import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin, Plus, Search, Sparkles, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

type EventWithCount = Event & {
  attendeeCount: number;
};

const categories = ["AI", "Tech", "Startup", "Developer", "Seminar", "Networking", "Hackathon", "Web3", "Robotics"];
const regions = ["Tokyo", "Osaka", "Kyoto", "Singapore", "Seoul", "Taipei", "Hong Kong", "Bangkok", "Online"];

const themeStyles: Record<string, { border: string; badge: string; glow: string; gradient: string; soft: string }> = {
  purple: {
    border: "border-violet-300/25",
    badge: "text-violet-200",
    glow: "shadow-violet-950/20",
    gradient: "from-violet-500 to-fuchsia-500",
    soft: "from-violet-400/18 to-fuchsia-400/10"
  },
  blue: {
    border: "border-cyan-300/25",
    badge: "text-cyan-200",
    glow: "shadow-cyan-950/20",
    gradient: "from-blue-500 to-cyan-400",
    soft: "from-blue-400/18 to-cyan-300/10"
  },
  green: {
    border: "border-emerald-300/25",
    badge: "text-emerald-200",
    glow: "shadow-emerald-950/20",
    gradient: "from-emerald-500 to-teal-400",
    soft: "from-emerald-400/18 to-teal-300/10"
  },
  amber: {
    border: "border-amber-300/25",
    badge: "text-amber-200",
    glow: "shadow-amber-950/20",
    gradient: "from-amber-400 to-orange-500",
    soft: "from-amber-300/18 to-orange-400/10"
  },
  rose: {
    border: "border-rose-300/25",
    badge: "text-rose-200",
    glow: "shadow-rose-950/20",
    gradient: "from-rose-500 to-pink-500",
    soft: "from-rose-400/18 to-pink-300/10"
  }
};

function getTheme(event?: Event | null) {
  return themeStyles[event?.theme_color || "purple"] || themeStyles.purple;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    timeZone: "Asia/Tokyo"
  });
}

function formatTimeRange(event: Event) {
  const start = new Date(event.starts_at).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
  });
  const end = event.ends_at
    ? new Date(event.ends_at).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Tokyo"
      })
    : "";

  return end ? `${start} - ${end}` : start;
}

function dateParts(value: string) {
  const date = new Date(value);

  return {
    month: date.toLocaleDateString("en-US", { month: "short", timeZone: "Asia/Tokyo" }).toUpperCase(),
    day: date.toLocaleDateString("ja-JP", { day: "2-digit", timeZone: "Asia/Tokyo" }),
    weekday: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "Asia/Tokyo" }).toUpperCase()
  };
}

async function withAttendeeCounts(events: Event[]) {
  if (!events.length) return [] as EventWithCount[];

  try {
    const admin = createAdminClient();
    const { data: registrations = [] } = await admin
      .from("registrations")
      .select("event_id, status")
      .in(
        "event_id",
        events.map((event) => event.id)
      )
      .eq("status", "approved");

    const counts = new Map<string, number>();
    registrations?.forEach((registration) => {
      counts.set(registration.event_id, (counts.get(registration.event_id) || 0) + 1);
    });

    return events.map((event) => ({
      ...event,
      attendeeCount: counts.get(event.id) || 0
    }));
  } catch {
    return events.map((event) => ({ ...event, attendeeCount: 0 }));
  }
}

function TimelineCard({ event, side }: { event: EventWithCount; side: "left" | "right" }) {
  const theme = getTheme(event);
  const parts = dateParts(event.starts_at);
  const isRight = side === "right";

  return (
    <div className="relative grid gap-5 md:grid-cols-[1fr_84px_1fr]">
      <div className={isRight ? "hidden md:block" : ""}>{!isRight && <TimelineEventBody event={event} />}</div>

      <div className="hidden flex-col items-center md:flex">
        <div className="grid h-3.5 w-3.5 rounded-full bg-cyan-200 shadow-[0_0_24px_rgba(103,232,249,.75)]" />
        <div className="h-full min-h-52 w-px bg-gradient-to-b from-cyan-200/70 via-white/25 to-transparent" />
      </div>

      <div className={`flex items-center ${isRight ? "md:justify-start" : "md:justify-end"} text-slate-300`}>
        <div className="w-24 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center">
          <p className="text-xs font-bold">{parts.month}</p>
          <p className="text-4xl font-black text-white">{parts.day}</p>
          <p className="text-xs font-bold">{parts.weekday}</p>
        </div>
      </div>

      <div className={isRight ? "md:col-start-3 md:row-start-1" : "md:hidden"}>{isRight && <TimelineEventBody event={event} />}</div>
      <div className={`pointer-events-none absolute inset-x-0 top-8 -z-10 h-32 bg-gradient-to-r ${theme.soft} blur-3xl`} />
    </div>
  );
}

function TimelineEventBody({ event }: { event: EventWithCount }) {
  const theme = getTheme(event);

  return (
    <article className={`rounded-2xl border ${theme.border} bg-white/[0.07] p-6 shadow-xl ${theme.glow} backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-white/[0.09]`}>
      <div className="flex items-start gap-4">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}>
          <Sparkles size={22} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase ${theme.badge}`}>{event.category || "AI Event"}</p>
          <h3 className="mt-2 text-2xl font-black text-white">{event.title}</h3>
          <div className="mt-4 grid gap-2 text-sm text-slate-300">
            <p className="flex items-center gap-2">
              <CalendarDays size={16} /> {formatDate(event.starts_at)} {formatTimeRange(event)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} /> {event.location || event.region || "Online"}
            </p>
            <p className="flex items-center gap-2">
              <Users size={16} /> {event.attendeeCount} Participants
            </p>
          </div>
          <Link href={`/events/${event.id}`} className={`mt-5 inline-flex items-center gap-2 font-bold ${theme.badge}`}>
            詳細を見る <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EventGridCard({ event }: { event: EventWithCount }) {
  const theme = getTheme(event);

  return (
    <Link href={`/events/${event.id}`} className={`group overflow-hidden rounded-2xl border ${theme.border} bg-white/[0.07] shadow-lg ${theme.glow} backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-white/[0.1]`}>
      <div className="aspect-[16/10] overflow-hidden bg-slate-900">
        {event.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className={`grid h-full place-items-center bg-gradient-to-br ${theme.gradient} text-5xl font-black text-white`}>AI</div>
        )}
      </div>
      <div className="p-5">
        <p className={`text-xs font-black uppercase ${theme.badge}`}>{event.category || "AI"}</p>
        <h3 className="mt-3 line-clamp-2 text-xl font-black text-white">{event.title}</h3>
        <div className="mt-4 grid gap-2 text-sm text-slate-300">
          <p className="flex items-center gap-2">
            <CalendarDays size={15} /> {formatDate(event.starts_at)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={15} /> {event.location || event.region || "Online"}
          </p>
          <p className="flex items-center gap-2">
            <Users size={15} /> {event.attendeeCount} Participants
          </p>
        </div>
        <p className={`mt-5 inline-flex items-center gap-2 font-bold ${theme.badge}`}>
          詳細を見る <ChevronRight size={18} />
        </p>
      </div>
    </Link>
  );
}

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

  const { data: rawEvents = [] } = await query;
  const allEvents = await withAttendeeCounts((rawEvents || []) as Event[]);
  const timelineEvents = allEvents.slice(0, 2);
  const featuredEvent = allEvents.find((event) => event.featured) || allEvents[0];
  const featuredTheme = getTheme(featuredEvent);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080a14] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,10,20,.35),rgba(8,10,20,.92)_62%),linear-gradient(90deg,rgba(14,165,233,.2),transparent_36%,rgba(217,70,239,.12))]" />
        <div className="relative mx-auto grid max-w-[1500px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_480px] lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase text-cyan-200">AI Event Hub</p>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Discover Amazing <span className="text-cyan-200">AI Events</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              世界中のAIコミュニティとつながり、学び、イベントに参加できます。主催者はイベントを作成し、画像や資料も公開できます。
            </p>

            <form className="mt-8 grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-[1fr_150px_150px_auto]">
              <input className="rounded-xl bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400" name="q" defaultValue={sp.q} placeholder="Search events..." />
              <select className="rounded-xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none" name="category" defaultValue={sp.category || ""}>
                <option value="">Category</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <select className="rounded-xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none" name="region" defaultValue={sp.region || ""}>
                <option value="">Region</option>
                {regions.map((region) => (
                  <option key={region}>{region}</option>
                ))}
              </select>
              <button className="btn bg-cyan-200 text-slate-950 hover:bg-white">
                <Search size={18} /> Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#all-events" className="btn bg-white text-slate-950 hover:bg-cyan-100">
                Browse Events <ChevronRight size={18} />
              </a>
              <Link href="/events/new" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Plus size={18} /> Create Event
              </Link>
            </div>
          </div>

          <div className="hidden min-h-[380px] items-center lg:flex">
            <div className="w-full rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="aspect-square rounded-xl border border-cyan-200/25 bg-[linear-gradient(135deg,rgba(34,211,238,.22),rgba(139,92,246,.2)),linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.03))] p-6">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-200">
                    <span>GLOBAL</span>
                    <span>GMT+9</span>
                  </div>
                  <div>
                    <p className="text-7xl font-black">AI</p>
                    <p className="mt-3 text-lg font-bold text-cyan-100">Community events, documents and registration in one place.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold text-slate-300">
                    <span className="rounded-lg bg-white/10 py-3">Talks</span>
                    <span className="rounded-lg bg-white/10 py-3">Meetups</span>
                    <span className="rounded-lg bg-white/10 py-3">Labs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-black uppercase text-cyan-200">Upcoming Events</p>
          <h2 className="mt-3 text-4xl font-black">Event Timeline</h2>
          <p className="mt-3 text-slate-400">日付ごとに注目イベントをタイムライン表示します。</p>
        </div>

        <div className="mt-8 grid gap-8">
          {timelineEvents.map((event, index) => (
            <TimelineCard key={event.id} event={event} side={index % 2 === 0 ? "left" : "right"} />
          ))}
          {!timelineEvents.length && <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-10 text-center text-slate-300">公開中のイベントはまだありません。</div>}
        </div>
      </section>

      {featuredEvent && (
        <section className="mx-auto grid max-w-[1400px] gap-0 px-4 pb-14 sm:px-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="min-h-[340px] overflow-hidden rounded-t-2xl bg-slate-900 lg:rounded-l-2xl lg:rounded-tr-none">
            {featuredEvent.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredEvent.cover_url} alt="" className="h-full min-h-[340px] w-full object-cover" />
            ) : (
              <div className={`grid h-full min-h-[340px] place-items-center bg-gradient-to-br ${featuredTheme.gradient} text-7xl font-black`}>AI</div>
            )}
          </div>
          <div className="rounded-b-2xl border border-white/10 bg-white/[0.08] p-8 shadow-xl backdrop-blur lg:rounded-r-2xl lg:rounded-bl-none">
            <p className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase text-amber-200">Featured Poster</p>
            <h2 className="mt-5 text-4xl font-black">{featuredEvent.title}</h2>
            <p className="mt-5 line-clamp-4 leading-8 text-slate-300">{featuredEvent.description || "AI community event"}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-xl bg-white/10 px-3 py-2">
                <CalendarDays className="mr-1 inline h-4 w-4" /> {formatDate(featuredEvent.starts_at)}
              </span>
              <span className="rounded-xl bg-white/10 px-3 py-2">
                <MapPin className="mr-1 inline h-4 w-4" /> {featuredEvent.location || featuredEvent.region || "Online"}
              </span>
              <span className="rounded-xl bg-white/10 px-3 py-2">
                <Users className="mr-1 inline h-4 w-4" /> {featuredEvent.attendeeCount} Participants
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/events/${featuredEvent.id}`} className={`btn bg-gradient-to-r ${featuredTheme.gradient} text-white`}>
                Join Event <ChevronRight size={18} />
              </Link>
              <Link href={`/events/${featuredEvent.id}`} className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10">
                Add to Calendar
              </Link>
            </div>
          </div>
        </section>
      )}

      <section id="all-events" className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black">All Events</h2>
            <p className="mt-2 text-slate-400">すべてのAIイベントを確認できます。</p>
          </div>
          <Link href="/events/all" className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10">
            View All Events
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {allEvents.map((event) => (
            <EventGridCard key={event.id} event={event} />
          ))}
          {!allEvents.length && <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-10 text-slate-300">条件に一致するイベントはありません。</div>}
        </div>
      </section>
    </main>
  );
}
