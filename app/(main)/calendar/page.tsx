import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Grid3X3, List, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

const weekDays = ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"];
const monthNames = [
  "THÁNG 01",
  "THÁNG 02",
  "THÁNG 03",
  "THÁNG 04",
  "THÁNG 05",
  "THÁNG 06",
  "THÁNG 07",
  "THÁNG 08",
  "THÁNG 09",
  "THÁNG 10",
  "THÁNG 11",
  "THÁNG 12"
];

type CalendarSearchParams = {
  view?: string;
  year?: string;
  month?: string;
  week?: string;
};

type DayCell = {
  date: Date;
  inMonth: boolean;
  events: Event[];
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function startOfWeekMonday(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, diff));
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseNumber(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

function getEventDate(event: Event) {
  return startOfDay(new Date(event.starts_at));
}

function groupEventsByDay(events: Event[]) {
  const grouped = new Map<string, Event[]>();
  events.forEach((event) => {
    const key = toDateKey(getEventDate(event));
    grouped.set(key, [...(grouped.get(key) || []), event]);
  });
  return grouped;
}

function getMonthCells(year: number, month: number, grouped: Map<string, Event[]>) {
  const firstDay = new Date(year, month - 1, 1);
  const start = startOfWeekMonday(firstDay);

  return Array.from({ length: 42 }, (_, index): DayCell => {
    const date = addDays(start, index);
    return {
      date,
      inMonth: date.getMonth() === month - 1,
      events: grouped.get(toDateKey(date)) || []
    };
  });
}

function getWeekCells(weekStart: Date, grouped: Map<string, Event[]>) {
  return Array.from({ length: 7 }, (_, index): DayCell => {
    const date = addDays(weekStart, index);
    return {
      date,
      inMonth: true,
      events: grouped.get(toDateKey(date)) || []
    };
  });
}

function buildCalendarHref(view: "month" | "week", date: Date) {
  const params = new URLSearchParams({
    view,
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1)
  });

  if (view === "week") params.set("week", toDateKey(startOfWeekMonday(date)));
  return `/calendar?${params.toString()}`;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo"
  });
}

function formatEventTime(event: Event) {
  return new Date(event.starts_at).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
  });
}

function EventLogo({ event, size = "sm" }: { event: Event; size?: "sm" | "md" }) {
  const className =
    size === "md"
      ? "h-12 w-12 rounded-xl text-sm"
      : "h-8 w-8 rounded-lg text-[10px]";

  if (event.cover_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={event.cover_url} alt={event.title} className={`${className} object-cover shadow-sm`} />
    );
  }

  return (
    <span className={`${className} grid shrink-0 place-items-center bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 font-black text-white shadow-sm`}>
      {event.category?.slice(0, 2).toUpperCase() || "AI"}
    </span>
  );
}

function MonthCell({ cell, selectedMonth }: { cell: DayCell; selectedMonth: number }) {
  const isToday = toDateKey(cell.date) === toDateKey(new Date());
  const isWeekend = cell.date.getDay() === 0;
  const isSelectedMonth = cell.date.getMonth() === selectedMonth - 1;

  return (
    <div
      className={`min-h-32 border-r border-b border-slate-200 p-3 transition hover:bg-emerald-50/60 ${
        isSelectedMonth ? "bg-white" : "bg-slate-50 text-slate-400"
      } ${isToday ? "bg-amber-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={buildCalendarHref("week", cell.date)}
          className={`text-3xl font-black leading-none hover:text-emerald-600 ${
            isWeekend ? "text-red-600" : isSelectedMonth ? "text-slate-950" : "text-slate-400"
          }`}
          aria-label={`${formatShortDate(cell.date)} の週を見る`}
        >
          {String(cell.date.getDate()).padStart(2, "0")}
        </Link>
        {cell.events.length > 0 && <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {cell.events.slice(0, 4).map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} title={event.title} aria-label={event.title} className="transition hover:-translate-y-0.5">
            <EventLogo event={event} />
          </Link>
        ))}
        {cell.events.length > 4 && (
          <Link href={buildCalendarHref("week", cell.date)} className="grid h-8 min-w-8 place-items-center rounded-lg bg-slate-100 px-2 text-xs font-black text-slate-600">
            +{cell.events.length - 4}
          </Link>
        )}
      </div>

      {cell.events[0] && (
        <Link href={`/events/${cell.events[0].id}`} className="mt-2 line-clamp-2 block text-xs font-bold leading-5 text-slate-700 hover:text-emerald-700">
          {cell.events[0].title}
        </Link>
      )}
    </div>
  );
}

function WeekView({ days }: { days: DayCell[] }) {
  return (
    <div className="overflow-hidden rounded-b-sm border-x border-b border-slate-200 bg-white">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {days.map((day, index) => (
          <div key={toDateKey(day.date)} className="border-r border-slate-200 p-3 text-center last:border-r-0">
            <p className="text-sm font-bold text-slate-500">{weekDays[index]}</p>
            <p className={`mt-1 text-2xl font-black ${day.date.getDay() === 0 ? "text-red-600" : "text-slate-950"}`}>{day.date.getDate()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 divide-x divide-slate-200">
        {days.map((day) => (
          <div key={toDateKey(day.date)} className="min-h-[420px] p-3">
            <div className="grid gap-3">
              {day.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="grid grid-cols-[48px_1fr] gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <EventLogo event={event} size="md" />
                  <span className="min-w-0">
                    <span className="block text-xs font-black text-emerald-700">{formatEventTime(event)}</span>
                    <span className="mt-1 line-clamp-3 block text-sm font-black leading-5 text-slate-950">{event.title}</span>
                    <span className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} /> {event.location || event.region || "Online"}
                    </span>
                  </span>
                </Link>
              ))}
              {!day.events.length && <p className="rounded-xl bg-slate-50 p-3 text-center text-sm font-bold text-slate-400">予定なし</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<CalendarSearchParams>;
}) {
  const params = await searchParams;
  const now = new Date();
  const view = params.view === "week" ? "week" : "month";
  const year = parseNumber(params.year, now.getFullYear(), 1970, 2100);
  const month = parseNumber(params.month, now.getMonth() + 1, 1, 12);
  const selectedMonthDate = new Date(year, month - 1, 1);
  const selectedWeekStart = params.week ? startOfWeekMonday(new Date(params.week)) : startOfWeekMonday(selectedMonthDate);

  const supabase = await createClient();
  const { data: events = [] } = await supabase.from("events").select("*").eq("status", "published").order("starts_at");
  const grouped = groupEventsByDay((events || []) as Event[]);
  const monthCells = getMonthCells(year, month, grouped);
  const weekCells = getWeekCells(selectedWeekStart, grouped);
  const prevDate = view === "week" ? addDays(selectedWeekStart, -7) : addMonths(selectedMonthDate, -1);
  const nextDate = view === "week" ? addDays(selectedWeekStart, 7) : addMonths(selectedMonthDate, 1);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6">
      <section className="mx-auto max-w-[1180px] overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#4caf5c] px-5 py-4 text-white">
          <div className="flex items-center gap-4">
            <Link href={buildCalendarHref(view, prevDate)} className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#4caf5c] transition hover:scale-105" aria-label="前へ">
              <ChevronLeft size={30} />
            </Link>
            <h1 className="text-2xl font-black sm:text-3xl">
              {view === "week"
                ? `${formatShortDate(selectedWeekStart)} - ${formatShortDate(addDays(selectedWeekStart, 6))}`
                : `${monthNames[month - 1]} - ${year}`}
            </h1>
            <Link href={buildCalendarHref(view, nextDate)} className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#4caf5c] transition hover:scale-105" aria-label="次へ">
              <ChevronRight size={30} />
            </Link>
          </div>

          <form className="flex flex-wrap items-center gap-2" action="/calendar">
            <input type="hidden" name="view" value={view} />
            {view === "week" && <input type="hidden" name="week" value={toDateKey(selectedWeekStart)} />}
            <Link
              href={buildCalendarHref("month", selectedMonthDate)}
              className={`inline-flex min-h-11 items-center gap-2 rounded px-4 py-2 text-sm font-black ${view === "month" ? "bg-white text-[#237f33]" : "bg-white/20 text-white hover:bg-white/30"}`}
            >
              <Grid3X3 size={17} /> Tháng
            </Link>
            <Link
              href={buildCalendarHref("week", selectedWeekStart)}
              className={`inline-flex min-h-11 items-center gap-2 rounded px-4 py-2 text-sm font-black ${view === "week" ? "bg-white text-[#237f33]" : "bg-white/20 text-white hover:bg-white/30"}`}
            >
              <List size={17} /> Tuần
            </Link>
            <select name="month" className="min-h-11 rounded border-0 bg-white px-3 text-slate-950" defaultValue={month} aria-label="Chọn tháng">
              {monthNames.map((name, index) => (
                <option key={name} value={index + 1}>
                  Tháng {index + 1}
                </option>
              ))}
            </select>
            <select name="year" className="min-h-11 rounded border-0 bg-white px-3 text-slate-950" defaultValue={year} aria-label="Chọn năm">
              {Array.from({ length: 7 }, (_, index) => year - 3 + index).map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              ))}
            </select>
            <button className="inline-flex min-h-11 items-center rounded bg-[#237f33] px-4 py-2 text-sm font-black text-white hover:bg-[#1b6a29]" type="submit">
              XEM
            </button>
          </form>
        </div>

        {view === "month" ? (
          <>
            <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
              {weekDays.map((day) => (
                <div key={day} className="border-r border-slate-200 px-3 py-4 text-center font-bold text-slate-500 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-slate-200">
              {monthCells.map((cell) => (
                <MonthCell key={toDateKey(cell.date)} cell={cell} selectedMonth={month} />
              ))}
            </div>
          </>
        ) : (
          <WeekView days={weekCells} />
        )}
      </section>

      <section className="mx-auto mt-6 max-w-[1180px] rounded-sm border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-slate-700">
          <CalendarDays size={18} />
          <p className="font-bold">
            Logo hoặc tiêu đề trong lịch đều có thể bấm để mở trang chi tiết sự kiện. Bấm vào số ngày để xem tuần chứa ngày đó.
          </p>
        </div>
      </section>
    </main>
  );
}
