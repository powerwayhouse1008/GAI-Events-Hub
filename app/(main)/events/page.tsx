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

const themeStyles: Record<
  string,
  {
    border: string;
    badge: string;
    glow: string;
    gradient: string;
    soft: string;
  }
> = {
  purple: {
    border: "border-violet-400/40",
    badge: "text-violet-300",
    glow: "shadow-violet-500/20",
    gradient: "from-violet-600 to-fuchsia-500",
    soft: "from-violet-500/18 to-fuchsia-500/10"
  },
  blue: {
    border: "border-cyan-400/40",
    badge: "text-cyan-300",
    glow: "shadow-cyan-500/20",
    gradient: "from-blue-600 to-cyan-400",
    soft: "from-blue-500/18 to-cyan-400/10"
  },
  green: {
    border: "border-emerald-400/40",
    badge: "text-emerald-300",
    glow: "shadow-emerald-500/20",
    gradient: "from-emerald-500 to-teal-400",
    soft: "from-emerald-500/18 to-teal-400/10"
  },
  amber: {
    border: "border-amber-400/40",
    badge: "text-amber-300",
    glow: "shadow-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
    soft: "from-amber-500/18 to-orange-500/10"
  },
  rose: {
    border: "border-rose-400/40",
    badge: "text-rose-300",
    glow: "shadow-rose-500/20",
    gradient: "from-rose-500 to-pink-500",
    soft: "from-rose-500/18 to-pink-500/10"
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
    <div className="relative grid gap-6 md:grid-cols-[1fr_92px_1fr]">
      <div className={isRight ? "hidden md:block" : ""}>
        {!isRight && <TimelineEventBody event={event} />}
      </div>

      <div className="hidden flex-col items-center md:flex">
        <div className="grid h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_28px_rgba(34,211,238,.9)]" />
        <div className="h-full min-h-56 w-px bg-gradient-to-b from-cyan-300/80 via-violet-400/70 to-transparent" />
      </div>

      <div className={`flex items-center ${isRight ? "md:justify-start" : "md:justify-end"} text-slate-300`}>
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest">{parts.month}</p>
          <p className="text-5xl font-black text-white">{parts.day}</p>
          <p className="text-sm font-bold tracking-widest">{parts.weekday}</p>
        </div>
      </div>

      <div className={isRight ? "md:col-start-3 md:row-start-1" : "md:hidden"}>
        {isRight && <TimelineEventBody event={event} />}
      </div>

      <div className={`pointer-events-none absolute inset-x-0 top-10 -z-10 h-40 bg-gradient-to-r ${theme.soft} blur-3xl`} />
    </div>
  );
}

function TimelineEventBody({ event }: { event: EventWithCount }) {
  const theme = getTheme(event);

  return (
    <article
      className={`rounded-[28px] border ${theme.border} bg-white/[0.06] p-7 shadow-2xl ${theme.glow} backdrop-blur transition duration-300 hover:-translate-y-1 hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-5">
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}>
          <Sparkles size={26} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-[0.22em] ${theme.badge}`}>{event.category || "AI Event"}</p>
          <h3 className="mt-3 text-2xl font-black text-white">{event.title}</h3>
          <div className="mt-5 grid gap-3 text-sm text-slate-300">
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
          <Link href={`/events/${event.id}`} className={`mt-6 inline-flex items-center gap-2 font-bold ${theme.badge}`}>
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
    <Link
      href={`/events/${event.id}`}
      className={`group overflow-hidden rounded-[24px] border ${theme.border} bg-white/[0.06] shadow-xl ${theme.glow} backdrop-blur transition duration-300 hover:-translate-y-1 hover:scale-[1.02]`}
    >
      <div className="h-44 overflow-hidden bg-slate-900">
        {event.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        ) : (
          <div className={`grid h-full place-items-center bg-gradient-to-br ${theme.gradient} text-5xl font-black text-white`}>AI</div>
        )}
      </div>
      <div className="p-5">
        <p className={`text-xs font-black uppercase tracking-[0.18em] ${theme.badge}`}>{event.category || "AI"}</p>
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
    <main className="min-h-screen overflow-hidden bg-[#070817] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(109,94,249,.34),transparent_30%),radial-gradient(circle_at_12%_10%,rgba(0,194,255,.22),transparent_28%),radial-gradient(circle_at_48%_82%,rgba(255,94,122,.16),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-6 py-20 lg:grid-cols-[1fr_520px] lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-cyan-300">AI Event Hub</p>
            <h1 className="mt-6 text-6xl font-black leading-tight tracking-tight md:text-7xl">
              Discover Amazing{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                AI Events
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              世界中のAIコミュニティとつながり、学び、イベントに参加できます。主催者はイベントを作成し、画像や資料も公開できます。
            </p>

            <form className="mt-8 grid gap-3 rounded-[28px] border border-white/15 bg-white/10 p-2 backdrop-blur md:grid-cols-[1fr_160px_160px_auto]">
              <input
                className="rounded-full bg-transparent px-5 py-3 text-white outline-none placeholder:text-slate-400"
                name="q"
                defaultValue={sp.q}
                placeholder="Search events..."
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

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#all-events" className="btn bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
                Browse Events <ChevronRight size={18} />
              </a>
              <Link href="/events/new" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Plus size={18} /> Create Event
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[420px] place-items-center lg:grid">
            <div className="absolute h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="absolute h-28 w-[420px] rounded-full border border-violet-300/30" />
            <div className="relative grid h-72 w-72 rotate-12 place-items-center rounded-[52px] border border-cyan-300/30 bg-gradient-to-br from-blue-600/40 via-violet-600/40 to-fuchsia-500/40 text-7xl font-black shadow-[0_0_90px_rgba(109,94,249,.45)] backdrop-blur-xl">
              AI
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Upcoming Events</p>
          <h2 className="mt-3 text-4xl font-black">Event Timeline</h2>
          <p className="mt-3 text-slate-400">日付ごとに注目イベントをタイムライン表示します。</p>
          <span className="mt-8 inline-flex rounded-full border border-violet-400/50 bg-violet-500/10 px-5 py-2 font-black text-violet-200">
            2026
          </span>
        </div>

        <div className="mt-8 grid gap-10">
          {timelineEvents.map((event, index) => (
            <TimelineCard key={event.id} event={event} side={index % 2 === 0 ? "left" : "right"} />
          ))}
          {!timelineEvents.length && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-10 text-center text-slate-300">
              公開中のイベントはまだありません。
            </div>
          )}
        </div>
      </section>

      {featuredEvent && (
        <section className="mx-auto grid max-w-[1500px] gap-0 px-6 pb-14 lg:grid-cols-[1.2fr_.9fr]">
          <div className="min-h-[360px] overflow-hidden rounded-t-[28px] bg-slate-900 lg:rounded-l-[28px] lg:rounded-tr-none">
            {featuredEvent.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredEvent.cover_url} alt="" className="h-full min-h-[360px] w-full object-cover" />
            ) : (
              <div className={`grid h-full min-h-[360px] place-items-center bg-gradient-to-br ${featuredTheme.gradient} text-7xl font-black`}>
                AI
              </div>
            )}
          </div>
          <div className="rounded-b-[28px] border border-white/10 bg-white/[0.08] p-10 shadow-2xl backdrop-blur lg:rounded-r-[28px] lg:rounded-bl-none">
            <p className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-200">
              Featured Poster
            </p>
            <h2 className="mt-6 text-4xl font-black">{featuredEvent.title}</h2>
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
            <div className="mt-8 flex flex-wrap gap-4">
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

      <section id="all-events" className="mx-auto max-w-[1500px] px-6 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black">All Events</h2>
            <p className="mt-2 text-slate-400">すべてのAIイベントを確認できます。</p>
          </div>
          <Link href="/events" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-bold text-slate-200 hover:bg-white/10">
            View All Events
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {allEvents.map((event) => (
            <EventGridCard key={event.id} event={event} />
          ))}
          {!allEvents.length && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-10 text-slate-300">
              条件に一致するイベントはありません。
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
