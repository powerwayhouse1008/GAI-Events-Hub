import type { Event } from "@/lib/types";

export const eventCategories = ["AI", "Tech", "Startup", "Developer", "Seminar", "Networking", "Hackathon", "Web3", "Robotics"];
export const eventRegions = ["Tokyo", "Osaka", "Kyoto", "Singapore", "Seoul", "Taipei", "Hong Kong", "Bangkok", "Online"];

export const eventListColumns =
  "id,title,description,category,region,location,organizer_name,cover_url,theme_color,starts_at,ends_at,featured";
export const archiveEventColumns = "id,title,description,category,region,location,cover_url,starts_at,ends_at";
export const calendarEventColumns = "id,title,category,region,location,cover_url,starts_at,ends_at";

export const eventThemeStyles: Record<string, { border: string; badge: string; glow: string; gradient: string; soft: string; ring: string }> = {
  purple: {
    border: "border-violet-300/30",
    badge: "text-violet-200",
    glow: "shadow-violet-950/35",
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    soft: "from-violet-400/18 to-fuchsia-400/10",
    ring: "ring-violet-400/30"
  },
  blue: {
    border: "border-cyan-300/25",
    badge: "text-cyan-200",
    glow: "shadow-cyan-950/20",
    gradient: "from-blue-500 to-cyan-400",
    soft: "from-blue-400/18 to-cyan-300/10",
    ring: "ring-cyan-400/30"
  },
  green: {
    border: "border-emerald-300/25",
    badge: "text-emerald-200",
    glow: "shadow-emerald-950/20",
    gradient: "from-emerald-500 to-teal-400",
    soft: "from-emerald-400/18 to-teal-300/10",
    ring: "ring-emerald-400/30"
  },
  amber: {
    border: "border-amber-300/25",
    badge: "text-amber-200",
    glow: "shadow-amber-950/20",
    gradient: "from-amber-400 to-orange-500",
    soft: "from-amber-300/18 to-orange-400/10",
    ring: "ring-amber-400/30"
  },
  rose: {
    border: "border-rose-300/25",
    badge: "text-rose-200",
    glow: "shadow-rose-950/20",
    gradient: "from-rose-500 to-pink-500",
    soft: "from-rose-400/18 to-pink-300/10",
    ring: "ring-rose-400/30"
  }
};

export function getEventTheme(event?: Pick<Event, "theme_color"> | null) {
  return eventThemeStyles[event?.theme_color || "purple"] || eventThemeStyles.purple;
}

export function formatTokyoDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    timeZone: "Asia/Tokyo"
  });
}

export function formatTokyoDateTime(value: string) {
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

export function formatTokyoTimeRange(event: Pick<Event, "starts_at" | "ends_at">) {
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
