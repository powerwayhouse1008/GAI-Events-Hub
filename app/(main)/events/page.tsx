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
const eventListColumns =
  "id,title,description,category,region,location,cover_url,theme_color,starts_at,ends_at,featured";

const themeStyles: Record<string, { border: string; badge: string; glow: string; gradient: string; soft: string }> = {
  purple: {
    border: "border-violet-300/30",
    badge: "text-violet-200",
    glow: "shadow-violet-950/35",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
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

function TimelineEventBody({ event }: { event: EventWithCount }) {
  const theme = getTheme(event);

  return (
    <article className={`rounded-3xl border ${theme.border} bg-white/[0.07] p-6 shadow-xl ${theme.glow} backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-white/[0.09]`}>
      <div className="flex items-start gap-4">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}>
          <Sparkles size={23} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase ${theme.badge}`}>{event.category || "AI"}</p>
          <h3 className="mt-2 text-2xl font-black leading-tight text-white">{event.title}</h3>
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
        <div className="w-24 text-center">
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

  let query = supabase
    .from("events")
    .select(eventListColumns)
    .eq("status", "published")
    .order("starts_at", { ascending: true });

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
      <section className="relative min-h-[560px] border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(34,211,238,.18),transparent_30%),radial-gradient(circle_at_77%_36%,rgba(124,58,237,.32),transparent_34%),radial-gradient(circle_at_42%_92%,rgba(236,72,153,.16),transparent_32%),linear-gradient(115deg,#061525_0%,#080812_45%,#14103a_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,20,.18),rgba(8,10,20,.7)_62%)]" />
        <div className="relative mx-auto grid max-w-[1500px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_520px] lg:py-28">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.42em] text-cyan-300">AI Event Hub</p>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.05] md:text-7xl">
              Discover Amazing <span className="bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">AI Events</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              世界中のAIコミュニティとつながり、学び、イベントに参加できます。主催者はイベントを作成し、画像や資料も公開できます。
            </p>

            <form className="mt-8 grid max-w-[620px] gap-2 rounded-3xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-black/20 backdrop-blur md:grid-cols-[1fr_140px_140px_auto]">
              <input className="rounded-2xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:bg-white/15" name="q" defaultValue={sp.q} placeholder="Search events..." />
              <select className="rounded-2xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none" name="category" defaultValue={sp.category || ""}>
                <option value="">Category</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <select className="rounded-2xl border border-white/10 bg-[#111522] px-4 py-3 text-white outline-none" name="region" defaultValue={sp.region || ""}>
                <option value="">Region</option>
                {regions.map((region) => (
                  <option key={region}>{region}</option>
                ))}
              </select>
              <button className="btn rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-950/30 hover:from-violet-500 hover:to-fuchsia-400">
                <Search size={18} /> Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#all-events" className="btn rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-950/30 hover:from-violet-500 hover:to-fuchsia-400">
                Browse Events <ChevronRight size={18} />
              </a>
              <Link href="/events/new" className="btn rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Plus size={18} /> Create Event
              </Link>
            </div>
          </div>

          <div className="hidden min-h-[380px] items-center justify-center lg:flex">
            <div className="relative h-[300px] w-[430px]">
              <div className="absolute left-8 top-28 h-20 w-[360px] rounded-full border border-white/15 bg-white/[0.03]" />
              <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl" />
              <div className="absolute left-24 top-8 grid h-56 w-56 rotate-12 place-items-center rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 text-6xl font-black text-white shadow-[0_0_80px_rgba(124,58,237,.55)]">
                AI
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-cyan-300">Upcoming Events</p>
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
        <section className="mx-auto grid max-w-[1400px] gap-0 px-4 pb-14 sm:px-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="min-h-[340px] overflow-hidden rounded-t-3xl bg-slate-900 lg:rounded-l-3xl lg:rounded-tr-none">
            {featuredEvent.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredEvent.cover_url} alt="" className="h-full min-h-[340px] w-full object-cover" />
            ) : (
              <div className={`grid h-full min-h-[340px] place-items-center bg-gradient-to-br ${featuredTheme.gradient} text-7xl font-black`}>AI</div>
            )}
          </div>
          <div className="rounded-b-3xl border border-white/10 bg-white/[0.08] p-8 shadow-xl shadow-violet-950/20 backdrop-blur lg:rounded-r-3xl lg:rounded-bl-none">
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
              <Link href={`/events/${featuredEvent.id}`} className={`btn rounded-full bg-gradient-to-r ${featuredTheme.gradient} text-white`}>
                Join Event <ChevronRight size={18} />
              </Link>
              <Link href={`/events/${featuredEvent.id}`} className="btn rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10">
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
          <Link href="/events/all" className="btn rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10">
            View All Events
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {allEvents.map((event) => (
            <EventGridCard key={event.id} event={event} />
          ))}
          {!allEvents.length && <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-10 text-slate-300">条件に一致するイベントはありません。</div>}
        </div>
      </section>
    </main>
  );
}
