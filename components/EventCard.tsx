import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import type { Event } from "@/lib/types";

export function EventCard({ event, compact = false }: { event: Event; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={`/events/${event.id}`} className="grid grid-cols-[86px_1fr] gap-4 rounded-2xl p-2 hover:bg-white">
        <div className="h-[86px] overflow-hidden rounded-2xl bg-purple-100">
          {event.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.cover_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center font-black text-purple-600">AI</div>
          )}
        </div>
        <div>
          <p className="text-sm text-slate-400">{formatDate(event.starts_at)}</p>
          <h3 className="line-clamp-2 font-black leading-tight">{event.title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-slate-400">{event.organizer_name}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:grid-cols-[1fr_150px]"
    >
      <div>
        <p className="text-slate-400">{formatDate(event.starts_at)}</p>
        <h3 className="mt-2 text-2xl font-black leading-tight tracking-tight">{event.title}</h3>
        <p className="mt-3 flex items-center gap-2 text-slate-400">
          <Users size={16} /> {event.organizer_name || "Global AI Industry Alliance"}
        </p>
        <p className="mt-2 flex items-center gap-2 text-slate-400">
          <MapPin size={16} /> {event.location || "Online / TBA"}
        </p>
        {event.ticket_price === 0 && (
          <span className="mt-4 inline-block rounded-lg bg-green-100 px-3 py-1 text-sm font-bold text-green-700">無料</span>
        )}
      </div>
      <div className="h-[130px] overflow-hidden rounded-2xl bg-purple-100 md:h-[150px]">
        {event.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-4xl font-black text-purple-600">AI</div>
        )}
      </div>
    </Link>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo"
  });
}
