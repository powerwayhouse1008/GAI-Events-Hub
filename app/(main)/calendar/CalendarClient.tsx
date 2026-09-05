"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Grid3X3, List, MapPin } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { LanguageCode } from "@/lib/i18n";
import type { Event } from "@/lib/types";

type ViewMode = "month" | "week";
type DayCell = {
  date: Date;
  inMonth: boolean;
  events: Event[];
};

const copy: Record<
  LanguageCode,
  {
    title: string;
    month: string;
    week: string;
    view: string;
    previous: string;
    next: string;
    noEvents: string;
    noItems: string;
    hint: string;
    locationFallback: string;
    weekdays: string[];
    months: string[];
    locale: string;
  }
> = {
  ja: {
    title: "カレンダー",
    month: "月",
    week: "週",
    view: "表示",
    previous: "前へ",
    next: "次へ",
    noEvents: "予定なし",
    noItems: "公開中のイベントはありません。",
    hint: "日付を押すと週表示へ移動します。イベントのロゴまたはタイトルを押すと詳細ページを開きます。",
    locationFallback: "オンライン",
    weekdays: ["月", "火", "水", "木", "金", "土", "日"],
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    locale: "ja-JP"
  },
  en: {
    title: "Calendar",
    month: "Month",
    week: "Week",
    view: "View",
    previous: "Previous",
    next: "Next",
    noEvents: "No events",
    noItems: "There are no published events.",
    hint: "Select a date to switch to that week. Select an event logo or title to open the event page.",
    locationFallback: "Online",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    locale: "en-US"
  },
  zh: {
    title: "日历",
    month: "月",
    week: "周",
    view: "查看",
    previous: "上一页",
    next: "下一页",
    noEvents: "暂无活动",
    noItems: "暂无已发布活动。",
    hint: "点击日期切换到该周。点击活动图标或标题可打开活动详情。",
    locationFallback: "线上",
    weekdays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    locale: "zh-CN"
  },
  vi: {
    title: "Lịch",
    month: "Tháng",
    week: "Tuần",
    view: "Xem",
    previous: "Trước",
    next: "Sau",
    noEvents: "Không có sự kiện",
    noItems: "Chưa có sự kiện nào được công bố.",
    hint: "Bấm vào ngày để xem tuần đó. Bấm logo hoặc tiêu đề sự kiện để mở trang chi tiết.",
    locationFallback: "Trực tuyến",
    weekdays: ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"],
    months: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
    locale: "vi-VN"
  }
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
  return startOfDay(addDays(date, day === 0 ? -6 : 1 - day));
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function groupEventsByDay(events: Event[]) {
  const grouped = new Map<string, Event[]>();
  events.forEach((event) => {
    const date = startOfDay(new Date(event.starts_at));
    const key = toDateKey(date);
    grouped.set(key, [...(grouped.get(key) || []), event]);
  });
  return grouped;
}

function getMonthCells(date: Date, grouped: Map<string, Event[]>) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeekMonday(firstDay);

  return Array.from({ length: 42 }, (_, index): DayCell => {
    const cellDate = addDays(start, index);
    return {
      date: cellDate,
      inMonth: cellDate.getMonth() === date.getMonth(),
      events: grouped.get(toDateKey(cellDate)) || []
    };
  });
}

function getWeekCells(date: Date, grouped: Map<string, Event[]>) {
  const start = startOfWeekMonday(date);
  return Array.from({ length: 7 }, (_, index): DayCell => {
    const cellDate = addDays(start, index);
    return {
      date: cellDate,
      inMonth: true,
      events: grouped.get(toDateKey(cellDate)) || []
    };
  });
}

function formatDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString(locale, { timeZone: "Asia/Tokyo", ...options });
}

function formatTime(event: Event, locale: string) {
  return new Date(event.starts_at).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
  });
}

function EventLogo({ event, large = false }: { event: Event; large?: boolean }) {
  const size = large ? "h-14 w-14 rounded-2xl text-sm" : "h-9 w-9 rounded-xl text-[10px]";

  if (event.cover_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={event.cover_url} alt={event.title} className={`${size} shrink-0 object-cover shadow-lg shadow-violet-950/15`} />
    );
  }

  return (
    <span className={`${size} grid shrink-0 place-items-center bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 font-black text-white shadow-lg shadow-fuchsia-950/25`}>
      {event.category?.slice(0, 2).toUpperCase() || "AI"}
    </span>
  );
}

function MonthCell({
  cell,
  selectedMonth,
  locale,
  labels,
  onSelectWeek
}: {
  cell: DayCell;
  selectedMonth: number;
  locale: string;
  labels: (typeof copy)[LanguageCode];
  onSelectWeek: (date: Date) => void;
}) {
  const isToday = toDateKey(cell.date) === toDateKey(new Date());
  const isSunday = cell.date.getDay() === 0;

  return (
    <div
      className={`min-h-36 border-r border-b border-slate-200/80 p-3 transition duration-200 hover:bg-emerald-50/80 ${
        cell.inMonth ? "bg-white" : "bg-slate-50/80 text-slate-400"
      } ${isToday ? "bg-amber-50 shadow-[inset_0_0_0_2px_rgba(245,158,11,.25)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelectWeek(cell.date)}
          className={`min-h-11 rounded-2xl px-1 text-3xl font-black leading-none transition hover:text-emerald-600 ${
            isSunday ? "text-red-600" : cell.inMonth ? "text-slate-950" : "text-slate-400"
          }`}
          aria-label={formatDate(cell.date, locale, { dateStyle: "long" })}
        >
          {String(cell.date.getDate()).padStart(2, "0")}
        </button>
        {cell.events.length > 0 && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,.75)]" />}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {cell.events.slice(0, 4).map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} title={event.title} aria-label={event.title} className="transition hover:-translate-y-0.5">
            <EventLogo event={event} />
          </Link>
        ))}
        {cell.events.length > 4 && (
          <button type="button" onClick={() => onSelectWeek(cell.date)} className="grid h-9 min-w-9 place-items-center rounded-xl bg-slate-100 px-2 text-xs font-black text-slate-600">
            +{cell.events.length - 4}
          </button>
        )}
      </div>

      {cell.events[0] && (
        <Link href={`/events/${cell.events[0].id}`} className="mt-2 line-clamp-2 block text-xs font-bold leading-5 text-slate-700 hover:text-emerald-700">
          {cell.events[0].title}
        </Link>
      )}
      {!cell.events.length && cell.inMonth && <p className="mt-8 text-center text-xs text-slate-300">{labels.noEvents}</p>}
    </div>
  );
}

function WeekView({ days, labels, locale }: { days: DayCell[]; labels: (typeof copy)[LanguageCode]; locale: string }) {
  const maxEvents = Math.max(1, ...days.map((day) => day.events.length));

  return (
    <div className="overflow-x-auto rounded-b-[2rem] border-x border-b border-slate-200 bg-white shadow-inner">
      <div className="min-w-[980px]">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/70">
          {days.map((day, index) => (
            <div key={toDateKey(day.date)} className="border-r border-slate-200 p-4 text-center last:border-r-0">
              <p className="text-sm font-black text-slate-500">{labels.weekdays[index]}</p>
              <p className={`mt-1 text-3xl font-black ${day.date.getDay() === 0 ? "text-red-600" : "text-slate-950"}`}>{day.date.getDate()}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{formatDate(day.date, locale, { month: "short" })}</p>
            </div>
          ))}
        </div>

        {Array.from({ length: maxEvents }, (_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 border-b border-slate-200 last:border-b-0">
            {days.map((day) => {
              const event = day.events[rowIndex];
              return (
                <div key={`${toDateKey(day.date)}-${rowIndex}`} className="min-h-28 border-r border-slate-200 bg-white p-3 last:border-r-0">
                  {event ? (
                    <Link
                      href={`/events/${event.id}`}
                      className="flex h-full gap-3 rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/70 p-3 shadow-lg shadow-violet-950/[0.06] transition duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-950/10"
                    >
                      <EventLogo event={event} large />
                      <span className="min-w-0">
                        <span className="block text-xs font-black text-emerald-700">{formatTime(event, locale)}</span>
                        <span className="mt-1 line-clamp-2 block text-sm font-black leading-5 text-slate-950">{event.title}</span>
                        <span className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={12} /> {event.location || event.region || labels.locationFallback}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    rowIndex === 0 && <p className="rounded-2xl bg-slate-50 p-3 text-center text-sm font-bold text-slate-400">{labels.noEvents}</p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarClient({ events }: { events: Event[] }) {
  const { language } = useLanguage();
  const labels = copy[language];
  const [view, setView] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const grouped = useMemo(() => groupEventsByDay(events), [events]);
  const monthCells = useMemo(() => getMonthCells(selectedDate, grouped), [selectedDate, grouped]);
  const weekCells = useMemo(() => getWeekCells(selectedDate, grouped), [selectedDate, grouped]);
  const monthTitle = `${labels.months[selectedDate.getMonth()]} - ${selectedDate.getFullYear()}`;
  const weekStart = startOfWeekMonday(selectedDate);
  const weekEnd = addDays(weekStart, 6);

  function movePrevious() {
    setSelectedDate((date) => (view === "week" ? addDays(date, -7) : addMonths(date, -1)));
  }

  function moveNext() {
    setSelectedDate((date) => (view === "week" ? addDays(date, 7) : addMonths(date, 1)));
  }

  function selectWeek(date: Date) {
    setSelectedDate(date);
    setView("week");
  }

  return (
    <main
      key={language}
      data-no-translate
      className="min-h-screen bg-[linear-gradient(135deg,#eefcf4,#f8fafc_45%,#f7f0ff)] px-4 py-8 text-slate-950 sm:px-6"
    >
      <section className="mx-auto max-w-[1180px] overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-2xl shadow-emerald-950/10 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-5 py-5 text-white shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-4">
            <button type="button" onClick={movePrevious} className="grid h-12 w-12 place-items-center rounded-full bg-white text-emerald-600 shadow-lg shadow-emerald-950/20 transition hover:scale-105" aria-label={labels.previous}>
              <ChevronLeft size={31} />
            </button>
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase text-white/75">
                <CalendarDays size={15} /> {labels.title}
              </p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                {view === "week"
                  ? `${formatDate(weekStart, labels.locale, { month: "2-digit", day: "2-digit" })} - ${formatDate(weekEnd, labels.locale, { month: "2-digit", day: "2-digit", year: "numeric" })}`
                  : monthTitle}
              </h1>
            </div>
            <button type="button" onClick={moveNext} className="grid h-12 w-12 place-items-center rounded-full bg-white text-emerald-600 shadow-lg shadow-emerald-950/20 transition hover:scale-105" aria-label={labels.next}>
              <ChevronRight size={31} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/15 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                view === "month" ? "bg-white text-emerald-700 shadow-lg shadow-emerald-950/15" : "text-white hover:bg-white/15"
              }`}
            >
              <Grid3X3 size={17} /> {labels.month}
            </button>
            <button
              type="button"
              onClick={() => setView("week")}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                view === "week" ? "bg-white text-emerald-700 shadow-lg shadow-emerald-950/15" : "text-white hover:bg-white/15"
              }`}
            >
              <List size={17} /> {labels.week}
            </button>
          </div>
        </div>

        {view === "month" && (
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex snap-x gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 18 }, (_, index) => addMonths(selectedDate, index - 8)).map((date) => {
                const active = date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
                return (
                  <button
                    key={`${date.getFullYear()}-${date.getMonth()}`}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`snap-center rounded-2xl px-4 py-2 text-sm font-black shadow-sm transition ${
                      active ? "bg-emerald-600 text-white shadow-emerald-950/20" : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {labels.months[date.getMonth()]} {date.getFullYear()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex snap-x gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 15 }, (_, index) => addDays(startOfWeekMonday(selectedDate), (index - 7) * 7)).map((date) => {
                const active = toDateKey(startOfWeekMonday(date)) === toDateKey(startOfWeekMonday(selectedDate));
                return (
                  <button
                    key={toDateKey(date)}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`snap-center rounded-2xl px-4 py-2 text-sm font-black shadow-sm transition ${
                      active ? "bg-emerald-600 text-white shadow-emerald-950/20" : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {formatDate(date, labels.locale, { month: "2-digit", day: "2-digit" })} - {formatDate(addDays(date, 6), labels.locale, { month: "2-digit", day: "2-digit" })}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {events.length ? (
          view === "month" ? (
            <>
              <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/70">
                {labels.weekdays.map((day) => (
                  <div key={day} className="border-r border-slate-200 px-3 py-4 text-center font-black text-slate-600 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthCells.map((cell) => (
                  <MonthCell key={toDateKey(cell.date)} cell={cell} selectedMonth={selectedDate.getMonth()} locale={labels.locale} labels={labels} onSelectWeek={selectWeek} />
                ))}
              </div>
            </>
          ) : (
            <WeekView days={weekCells} labels={labels} locale={labels.locale} />
          )
        ) : (
          <div className="p-12 text-center text-lg font-bold text-slate-500">{labels.noItems}</div>
        )}
      </section>

      <section className="mx-auto mt-6 max-w-[1180px] rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-xl shadow-slate-950/[0.05]">
        <div className="flex items-center gap-3 text-slate-700">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CalendarDays size={19} />
          </span>
          <p className="font-bold">{labels.hint}</p>
        </div>
      </section>
    </main>
  );
}
