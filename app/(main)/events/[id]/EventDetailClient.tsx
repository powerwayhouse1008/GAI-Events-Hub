"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Edit3, MapPin, Sparkles, Ticket, Users } from "lucide-react";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { AnnouncementsList } from "@/components/AnnouncementsList";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentsList } from "@/components/DocumentsList";
import { ParticipantsList } from "@/components/ParticipantsList";
import { RegistrationReviewPanel } from "@/components/RegistrationReviewPanel";
import { getAnnouncements, getEventDocuments, getEventParticipants } from "./eventManagerActions";
import type { Announcement, Event, EventDocument, Profile } from "@/lib/types";

interface EventDetailClientProps {
  event: Event;
  profile: Profile | null;
  isOrganizer: boolean;
  announcements: Announcement[];
  documents: EventDocument[];
  participants: any[];
  registerEventAction: (formData: FormData) => Promise<void>;
}

const statusLabel: Record<string, string> = {
  pending: "承認待ち",
  published: "公開中",
  rejected: "却下",
  draft: "下書き",
  approved: "承認済み"
};

const themeStyles: Record<
  string,
  {
    border: string;
    badge: string;
    glow: string;
    gradient: string;
    soft: string;
    ring: string;
  }
> = {
  purple: {
    border: "border-violet-400/40",
    badge: "text-violet-300",
    glow: "shadow-violet-500/20",
    gradient: "from-violet-600 to-fuchsia-500",
    soft: "from-violet-500/18 to-fuchsia-500/10",
    ring: "ring-violet-400/30"
  },
  blue: {
    border: "border-cyan-400/40",
    badge: "text-cyan-300",
    glow: "shadow-cyan-500/20",
    gradient: "from-blue-600 to-cyan-400",
    soft: "from-blue-500/18 to-cyan-400/10",
    ring: "ring-cyan-400/30"
  },
  green: {
    border: "border-emerald-400/40",
    badge: "text-emerald-300",
    glow: "shadow-emerald-500/20",
    gradient: "from-emerald-500 to-teal-400",
    soft: "from-emerald-500/18 to-teal-400/10",
    ring: "ring-emerald-400/30"
  },
  amber: {
    border: "border-amber-400/40",
    badge: "text-amber-300",
    glow: "shadow-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
    soft: "from-amber-500/18 to-orange-500/10",
    ring: "ring-amber-400/30"
  },
  rose: {
    border: "border-rose-400/40",
    badge: "text-rose-300",
    glow: "shadow-rose-500/20",
    gradient: "from-rose-500 to-pink-500",
    soft: "from-rose-500/18 to-pink-500/10",
    ring: "ring-rose-400/30"
  }
};

function getTheme(event: Event) {
  return themeStyles[event.theme_color || "purple"] || themeStyles.purple;
}

function formatDateTime(value: string) {
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

export function EventDetailClient({
  event,
  profile,
  isOrganizer,
  announcements: initialAnnouncements,
  documents: initialDocuments,
  participants: initialParticipants,
  registerEventAction
}: EventDetailClientProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [documents, setDocuments] = useState(initialDocuments);
  const [participants, setParticipants] = useState(initialParticipants);
  const theme = getTheme(event);
  const isManualReview = event.approval_mode === "manual";
  const approvedCount = participants.filter((participant: any) => participant.status === "approved").length;

  const refreshAnnouncements = async () => setAnnouncements(await getAnnouncements(event.id));
  const refreshDocuments = async () => setDocuments(await getEventDocuments(event.id));
  const refreshParticipants = async () => setParticipants(await getEventParticipants(event.id));

  return (
    <main className="min-h-screen overflow-hidden bg-[#070817] text-white">
      <section className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.soft}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(0,194,255,.2),transparent_28%),radial-gradient(circle_at_18%_28%,rgba(255,94,122,.14),transparent_24%)]" />

        <div className="relative mx-auto max-w-[1500px] px-6 py-10">
          {isOrganizer && (
            <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border ${theme.border} bg-white/[0.08] p-4 shadow-xl ${theme.glow} backdrop-blur`}>
              <p className="text-sm font-bold text-slate-200">
                このイベントを管理できます。現在の状態: <span className={theme.badge}>{statusLabel[event.status] || event.status}</span>
              </p>
              <Link href={`/events/${event.id}/edit`} className={`btn bg-gradient-to-r ${theme.gradient} text-white`}>
                <Edit3 size={17} /> イベント編集
              </Link>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.08fr_420px]">
            <section>
              <div className={`overflow-hidden rounded-[32px] border ${theme.border} bg-white/[0.06] shadow-2xl ${theme.glow} ring-1 ${theme.ring}`}>
                {event.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.cover_url} alt="" className="h-[520px] w-full object-cover" />
                ) : (
                  <div className={`grid h-[520px] place-items-center bg-gradient-to-br ${theme.gradient} text-8xl font-black text-white`}>
                    AI
                  </div>
                )}
              </div>

              <div className="mt-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border ${theme.border} bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] ${theme.badge}`}>
                    {event.category || "AI Event"}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-slate-200">
                    {statusLabel[event.status] || event.status}
                  </span>
                </div>

                <h1 className="mt-5 max-w-5xl text-5xl font-black leading-tight tracking-tight md:text-7xl">{event.title}</h1>
                <p className="mt-5 text-lg font-bold text-slate-300">{event.organizer_name || "AI Event Organizer"}</p>

                {event.status === "pending" && (
                  <div className="mt-6 rounded-[20px] border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
                    このイベントは管理者の公開承認待ちです。承認後に参加者へ公開されます。
                  </div>
                )}

                <article className="mt-8 whitespace-pre-wrap rounded-[28px] border border-white/10 bg-white/[0.06] p-7 leading-8 text-slate-200 backdrop-blur">
                  {event.description || "説明はまだありません。"}
                </article>
              </div>

              {isOrganizer && (
                <div className="mt-10 grid gap-8">
                  <section className={`rounded-[28px] border ${theme.border} bg-white/[0.06] p-6 shadow-xl ${theme.glow} backdrop-blur`}>
                    <h2 className="text-2xl font-black">イベント進行状況</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <StatCard label="開始日時" value={formatDateTime(event.starts_at)} />
                      <StatCard label="申込数" value={String(participants.length)} strong />
                      <StatCard label="承認済み" value={String(approvedCount)} strong />
                      <StatCard label="定員" value={event.capacity ? String(event.capacity) : "無制限"} strong />
                    </div>
                  </section>

                  <ManagementSection title="通知・更新">
                    <AnnouncementForm eventId={event.id} onSuccess={refreshAnnouncements} />
                    <AnnouncementsList announcements={announcements} onDelete={refreshAnnouncements} isOrganizerView />
                  </ManagementSection>

                  <ManagementSection title="資料・画像">
                    <DocumentUpload eventId={event.id} onSuccess={refreshDocuments} />
                    <DocumentsList documents={documents} onDelete={refreshDocuments} isOrganizerView />
                  </ManagementSection>

                  <ManagementSection title="参加申込の管理">
                    <RegistrationReviewPanel participants={participants} approvalMode={event.approval_mode} onUpdated={refreshParticipants} />
                  </ManagementSection>

                  <ManagementSection title="参加者リスト">
                    <button onClick={refreshParticipants} className="btn border border-white/15 bg-white/10 text-white hover:bg-white/15" type="button">
                      参加者を更新
                    </button>
                    <ParticipantsList participants={participants} totalCapacity={event.capacity} />
                  </ManagementSection>
                </div>
              )}

              {!isOrganizer && profile && (announcements.length > 0 || documents.length > 0) && (
                <div className="mt-10 grid gap-8">
                  {announcements.length > 0 && (
                    <ManagementSection title="通知・更新">
                      <AnnouncementsList announcements={announcements} onDelete={refreshAnnouncements} isOrganizerView={false} />
                    </ManagementSection>
                  )}

                  {documents.length > 0 && (
                    <ManagementSection title="資料・画像">
                      <DocumentsList documents={documents} onDelete={refreshDocuments} isOrganizerView={false} />
                    </ManagementSection>
                  )}
                </div>
              )}
            </section>

            <aside className={`h-fit rounded-[30px] border ${theme.border} bg-white/[0.08] p-7 shadow-2xl ${theme.glow} backdrop-blur lg:sticky lg:top-6`}>
              <div className={`grid h-16 w-16 place-items-center rounded-[22px] bg-gradient-to-br ${theme.gradient} shadow-lg`}>
                <Sparkles size={26} />
              </div>
              <h2 className="mt-5 text-2xl font-black">イベント情報</h2>

              <div className="mt-6 grid gap-4">
                <InfoRow icon={<CalendarDays size={18} />} label="日付" value={formatDate(event.starts_at)} />
                <InfoRow icon={<Clock size={18} />} label="時間" value={formatTimeRange(event)} />
                <InfoRow icon={<MapPin size={18} />} label="場所" value={event.location || event.region || "オンライン / 未定"} />
                <InfoRow icon={<Ticket size={18} />} label="価格" value={event.ticket_price ? `¥${event.ticket_price}` : "無料"} />
                <InfoRow icon={<Users size={18} />} label="参加承認" value={isManualReview ? "手動承認" : "自動承認"} />
                <InfoRow icon={<CheckCircle2 size={18} />} label="承認済み" value={`${approvedCount} 名`} />
              </div>

              {event.online_url && (
                <a className={`mt-5 block break-all rounded-[18px] border ${theme.border} bg-white/10 p-4 text-sm font-bold ${theme.badge}`} href={event.online_url}>
                  {event.online_url}
                </a>
              )}

              {event.status !== "published" && !isOrganizer ? (
                <div className="mt-8 rounded-[20px] border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
                  管理者の公開承認後に参加申込が可能になります。
                </div>
              ) : profile && !isOrganizer ? (
                <form action={registerEventAction} className="mt-8">
                  <input type="hidden" name="event_id" value={event.id} />
                  <textarea className="input mb-4 min-h-24" name="message" placeholder="主催者へのメッセージ" />
                  <button className={`btn w-full bg-gradient-to-r ${theme.gradient} text-white`}>
                    {isManualReview ? "参加申込（承認待ち）" : "参加申込"}
                  </button>
                </form>
              ) : !profile ? (
                <Link className={`btn mt-8 w-full bg-gradient-to-r ${theme.gradient} text-white`} href={`/login?redirectTo=/events/${event.id}`}>
                  ログインして参加申込
                </Link>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/10 p-5">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className={strong ? "mt-2 text-3xl font-black text-white" : "mt-2 font-bold text-slate-100"}>{value}</p>
    </div>
  );
}

function ManagementSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur">
      <h2 className="mb-5 text-2xl font-black text-white">{title}</h2>
      <div className="grid gap-5 text-slate-950">{children}</div>
    </section>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-[18px] border border-white/10 bg-white/10 p-4">
      <span className="mt-0.5 text-cyan-200">{icon}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="mt-1 font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
