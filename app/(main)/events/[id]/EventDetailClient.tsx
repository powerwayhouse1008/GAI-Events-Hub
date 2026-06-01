"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  File,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Ticket,
  Trash2,
  Users
} from "lucide-react";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { AnnouncementsList } from "@/components/AnnouncementsList";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentsList } from "@/components/DocumentsList";
import { ParticipantsList } from "@/components/ParticipantsList";
import { RegistrationReviewPanel } from "@/components/RegistrationReviewPanel";
import {
  createEventComment,
  deleteEventComment,
  getAnnouncements,
  getEventDocuments,
  getEventEngagement,
  getEventParticipants,
  hideEventComment,
  restrictEventCommenter,
  setEventVote,
  unrestrictEventCommenter
} from "./eventManagerActions";
import type { RegisterEventResult } from "./registerEvent";
import type { Announcement, Event, EventComment, EventDocument, Profile, RegistrationStatus } from "@/lib/types";

interface EventDetailClientProps {
  event: Event;
  profile: Profile | null;
  isOrganizer: boolean;
  announcements: Announcement[];
  documents: EventDocument[];
  participants: any[];
  engagement: {
    likes: number;
    dislikes: number;
    myVote: 1 | -1 | null;
    comments: EventComment[];
    restrictedUserIds: string[];
    myCommentRestricted: boolean;
  };
  registrationStatus: RegistrationStatus | null;
  registerEventAction: (formData: FormData) => Promise<RegisterEventResult>;
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
    badge: "text-violet-200",
    glow: "shadow-violet-500/20",
    gradient: "from-violet-600 to-fuchsia-500",
    soft: "from-violet-500/16 to-fuchsia-500/8",
    ring: "ring-violet-400/30"
  },
  blue: {
    border: "border-cyan-400/40",
    badge: "text-cyan-200",
    glow: "shadow-cyan-500/20",
    gradient: "from-blue-600 to-cyan-400",
    soft: "from-blue-500/16 to-cyan-400/8",
    ring: "ring-cyan-400/30"
  },
  green: {
    border: "border-emerald-400/40",
    badge: "text-emerald-200",
    glow: "shadow-emerald-500/20",
    gradient: "from-emerald-500 to-teal-400",
    soft: "from-emerald-500/16 to-teal-400/8",
    ring: "ring-emerald-400/30"
  },
  amber: {
    border: "border-amber-400/40",
    badge: "text-amber-200",
    glow: "shadow-amber-500/20",
    gradient: "from-amber-500 to-orange-500",
    soft: "from-amber-500/16 to-orange-500/8",
    ring: "ring-amber-400/30"
  },
  rose: {
    border: "border-rose-400/40",
    badge: "text-rose-200",
    glow: "shadow-rose-500/20",
    gradient: "from-rose-500 to-pink-500",
    soft: "from-rose-500/16 to-pink-500/8",
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

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKind(fileType: string | null) {
  if (!fileType) return "file";
  if (fileType.startsWith("image/")) return "image";
  if (fileType === "application/pdf") return "pdf";
  if (fileType.startsWith("video/")) return "video";
  if (fileType.startsWith("audio/")) return "audio";
  if (fileType.startsWith("text/")) return "text";
  return "file";
}

function FileKindIcon({ fileType }: { fileType: string | null }) {
  const kind = getFileKind(fileType);
  if (kind === "image") return <ImageIcon className="h-5 w-5" />;
  if (kind === "pdf" || kind === "text") return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

export function EventDetailClient({
  event,
  profile,
  isOrganizer,
  announcements: initialAnnouncements,
  documents: initialDocuments,
  participants: initialParticipants,
  engagement: initialEngagement,
  registrationStatus,
  registerEventAction
}: EventDetailClientProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [documents, setDocuments] = useState(initialDocuments);
  const [participants, setParticipants] = useState(initialParticipants);
  const [engagement, setEngagement] = useState(initialEngagement);
  const [showManualMessage, setShowManualMessage] = useState(false);
  const theme = getTheme(event);
  const isManualReview = event.approval_mode === "manual";
  const canEngage = registrationStatus === "approved";
  const approvedCount = participants.filter((participant: any) => participant.status === "approved").length;

  const refreshAnnouncements = async () => setAnnouncements(await getAnnouncements(event.id));
  const refreshDocuments = async () => setDocuments(await getEventDocuments(event.id));
  const refreshParticipants = async () => setParticipants(await getEventParticipants(event.id));
  const refreshEngagement = async () => setEngagement(await getEventEngagement(event.id));

  return (
    <main className="min-h-screen overflow-hidden bg-[#061319] text-white">
      <section className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.soft}`} />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(6,19,25,.96),rgba(9,22,34,.88)_45%,rgba(7,11,24,.96)),radial-gradient(circle_at_84%_14%,rgba(56,189,248,.18),transparent_30%)]" />

        <div className="relative mx-auto max-w-[1480px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {isOrganizer && (
            <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border ${theme.border} bg-white/[0.08] p-4 shadow-xl ${theme.glow} backdrop-blur`}>
              <p className="text-sm font-bold text-slate-200">
                このイベントを管理できます。現在の状態: <span className={theme.badge}>{statusLabel[event.status] || event.status}</span>
              </p>
              <Link href={`/events/${event.id}/edit`} className={`btn bg-gradient-to-r ${theme.gradient} text-white`}>
                <Edit3 size={17} /> イベント編集
              </Link>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="min-w-0">
              <HeroBlock event={event} theme={theme} />

              <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0">
                  <ParticipantTimeline announcements={announcements} theme={theme} />
                  <ParticipantDocuments documents={documents} theme={theme} />
                  <EventEngagementPanel
                    eventId={event.id}
                    profile={profile}
                    isOrganizer={isOrganizer}
                    canEngage={canEngage}
                    engagement={engagement}
                    onUpdated={refreshEngagement}
                    theme={theme}
                  />
                </div>

                <aside className={`h-fit rounded-[8px] border ${theme.border} bg-white/[0.08] p-6 shadow-2xl ${theme.glow} backdrop-blur`}>
                  <div className={`grid h-14 w-14 place-items-center rounded-[8px] bg-gradient-to-br ${theme.gradient} shadow-lg`}>
                    <Sparkles size={24} />
                  </div>
                  <h2 className="mt-5 text-2xl font-black">イベント情報</h2>

                  <div className="mt-6 grid gap-3">
                    <InfoRow icon={<CalendarDays size={18} />} label="日付" value={formatDate(event.starts_at)} />
                    <InfoRow icon={<Clock size={18} />} label="時間" value={formatTimeRange(event)} />
                    <InfoRow icon={<MapPin size={18} />} label="場所" value={event.location || event.region || "オンライン / 未定"} />
                    <InfoRow icon={<Ticket size={18} />} label="価格" value={event.ticket_price ? `¥${event.ticket_price}` : "無料"} />
                    <InfoRow icon={<Users size={18} />} label="参加承認" value={isManualReview ? "手動承認" : "自動承認"} />
                    <InfoRow icon={<CheckCircle2 size={18} />} label="承認済み" value={`${approvedCount} 名`} />
                  </div>

                  {event.online_url && (
                    <a className={`mt-5 flex items-center gap-2 break-all rounded-[8px] border ${theme.border} bg-white/10 p-4 text-sm font-bold ${theme.badge}`} href={event.online_url}>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {event.online_url}
                    </a>
                  )}

                  <RegistrationAction
                    event={event}
                    profile={profile}
                    isOrganizer={isOrganizer}
                    registrationStatus={registrationStatus}
                    isManualReview={isManualReview}
                    registerEventAction={registerEventAction}
                    showManualMessage={showManualMessage}
                    setShowManualMessage={setShowManualMessage}
                    theme={theme}
                  />
                </aside>
              </div>

              {isOrganizer && (
                <div className="mt-10 grid gap-8">
                  <section className={`rounded-[8px] border ${theme.border} bg-white/[0.06] p-6 shadow-xl ${theme.glow} backdrop-blur`}>
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
            </section>

            <aside className="hidden lg:block" aria-hidden="true">
              <div className="sticky top-8 space-y-4 pl-2">
                <div className="h-40 border-l border-white/25" />
                <div className={`h-5 w-5 -translate-x-[9px] rounded-full border ${theme.border} bg-white/15 shadow-lg ${theme.glow}`} />
                <div className="h-40 border-l border-white/25" />
                <div className={`h-5 w-5 -translate-x-[9px] rounded-full border ${theme.border} bg-white/15 shadow-lg ${theme.glow}`} />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroBlock({ event, theme }: { event: Event; theme: ReturnType<typeof getTheme> }) {
  return (
    <section className="relative overflow-hidden rounded-[8px] border border-white/15 bg-white/[0.05] shadow-2xl">
      <div className="relative h-[360px] sm:h-[520px] lg:h-[640px]">
        {event.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className={`grid h-full place-items-center bg-gradient-to-br ${theme.gradient} text-8xl font-black text-white`}>AI</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061319] via-[#061319]/48 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full border ${theme.border} bg-black/25 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${theme.badge} backdrop-blur`}>
              {event.category || "AI Event"}
            </span>
            <span className="rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs font-black text-slate-100 backdrop-blur">
              {statusLabel[event.status] || event.status}
            </span>
          </div>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">{event.title}</h1>
          <p className="mt-4 text-base font-bold text-slate-200 sm:text-lg">{event.organizer_name || "AI Event Organizer"}</p>
        </div>
      </div>

      {event.description && (
        <article className="border-t border-white/10 bg-black/20 p-5 leading-8 text-slate-200 sm:p-8">
          <p className="whitespace-pre-wrap">{event.description}</p>
        </article>
      )}
    </section>
  );
}

function ParticipantTimeline({ announcements, theme }: { announcements: Announcement[]; theme: ReturnType<typeof getTheme> }) {
  return (
    <section className="mt-0">
      <div className="mb-5 flex items-center gap-3">
        <Bell className={theme.badge} size={22} />
        <h2 className="text-3xl font-black">通知・更新</h2>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-[8px] border border-white/15 bg-white/[0.06] p-6 text-slate-300">まだ通知はありません。</div>
      ) : (
        <div className="relative ml-4 space-y-5 border-l border-white/25 pl-7">
          {announcements.map((announcement, index) => (
            <article key={announcement.id} className={`relative rounded-[8px] border ${theme.border} bg-white/[0.07] p-5 shadow-xl ${theme.glow} backdrop-blur`}>
              <span className={`absolute -left-[38px] top-5 grid h-6 w-6 place-items-center rounded-full border ${theme.border} bg-[#061319] text-[10px] font-black ${theme.badge}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className={`text-xs font-black uppercase tracking-[0.16em] ${theme.badge}`}>
                {new Date(announcement.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
              </p>
              <h3 className="mt-2 text-2xl font-black">{announcement.title}</h3>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-200">{announcement.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ParticipantDocuments({ documents, theme }: { documents: EventDocument[]; theme: ReturnType<typeof getTheme> }) {
  if (documents.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <FileText className={theme.badge} size={22} />
        <h2 className="text-3xl font-black">資料・画像</h2>
      </div>

      <div className="grid gap-6">
        {documents.map((doc) => {
          const isImage = getFileKind(doc.file_type) === "image";

          return (
            <article key={doc.id} className={`relative overflow-hidden rounded-[8px] border ${theme.border} bg-black/25 shadow-xl ${theme.glow}`}>
              <DocumentMedia doc={doc} />

              {!isImage && (
                <div className="border-t border-white/10 bg-black/25 p-5 pr-28 backdrop-blur">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`mt-1 ${theme.badge}`}>
                      <FileKindIcon fileType={doc.file_type} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-black">{doc.title}</h3>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {[formatFileSize(doc.file_size), new Date(doc.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })].filter(Boolean).join(" / ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/25 px-3 py-2 text-xs font-black text-white shadow-xl backdrop-blur transition hover:bg-white/20"
              >
                <Download className="h-3.5 w-3.5" />
                開く
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DocumentMedia({ doc }: { doc: EventDocument }) {
  const kind = getFileKind(doc.file_type);

  if (kind === "image") {
    return (
      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="block bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={doc.file_url} alt="" className="block max-h-[760px] w-full object-contain" />
      </a>
    );
  }

  if (kind === "pdf" || kind === "text") {
    return <iframe title={doc.title} src={doc.file_url} className="h-[620px] w-full bg-white" />;
  }

  if (kind === "video") {
    return <video src={doc.file_url} controls className="max-h-[620px] w-full bg-black" />;
  }

  if (kind === "audio") {
    return (
      <div className="bg-black/25 p-8">
        <audio src={doc.file_url} controls className="w-full" />
      </div>
    );
  }

  return (
    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex min-h-60 items-center justify-center gap-3 bg-black/25 p-8 text-lg font-black text-slate-200">
      <FileKindIcon fileType={doc.file_type} />
      ブラウザで開く
    </a>
  );
}

function EventEngagementPanel({
  eventId,
  profile,
  isOrganizer,
  canEngage,
  engagement,
  onUpdated,
  theme
}: {
  eventId: string;
  profile: Profile | null;
  isOrganizer: boolean;
  canEngage: boolean;
  engagement: {
    likes: number;
    dislikes: number;
    myVote: 1 | -1 | null;
    comments: EventComment[];
    restrictedUserIds: string[];
    myCommentRestricted: boolean;
  };
  onUpdated: () => Promise<void>;
  theme: ReturnType<typeof getTheme>;
}) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function vote(value: 1 | -1) {
    setBusy(`vote-${value}`);
    setNotice(null);
    const result = await setEventVote(eventId, value);
    if (!result.ok) setNotice(result.message || "操作に失敗しました。");
    await onUpdated();
    setBusy(null);
  }

  async function submitComment() {
    setBusy("comment");
    setNotice(null);
    const result = await createEventComment(eventId, comment);
    if (result.ok) setComment("");
    else setNotice(result.message || "コメントできませんでした。");
    await onUpdated();
    setBusy(null);
  }

  async function runModeration(action: string, task: () => Promise<{ ok: boolean; message?: string }>) {
    setBusy(action);
    setNotice(null);
    const result = await task();
    if (!result.ok) setNotice(result.message || "操作に失敗しました。");
    await onUpdated();
    setBusy(null);
  }

  return (
    <section className="mt-10 rounded-[8px] border border-white/15 bg-white/[0.06] p-5 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-black">リアクション・コメント</h2>
        <div className="flex gap-2">
          <button
            className={`inline-flex items-center gap-2 rounded-full border ${theme.border} px-4 py-2 text-sm font-black transition ${
              engagement.myVote === 1 ? "bg-emerald-400/25 text-emerald-100" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            disabled={!profile || !canEngage || busy === "vote-1"}
            onClick={() => vote(1)}
            type="button"
          >
            <ThumbsUp className="h-4 w-4" />
            {engagement.likes}
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-full border ${theme.border} px-4 py-2 text-sm font-black transition ${
              engagement.myVote === -1 ? "bg-rose-400/25 text-rose-100" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            disabled={!profile || !canEngage || busy === "vote--1"}
            onClick={() => vote(-1)}
            type="button"
          >
            <ThumbsDown className="h-4 w-4" />
            {engagement.dislikes}
          </button>
        </div>
      </div>

      {notice && <div className="mt-4 rounded-[8px] border border-amber-300/30 bg-amber-300/15 p-3 text-sm font-bold text-amber-100">{notice}</div>}

      {profile && !isOrganizer && canEngage && !engagement.myCommentRestricted && (
        <div className="mt-5 grid gap-3">
          <textarea
            className="min-h-28 resize-y rounded-[8px] border border-white/15 bg-black/20 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-400 focus:border-white/35"
            onChange={(event) => setComment(event.target.value)}
            placeholder="コメントを書く"
            value={comment}
          />
          <button
            className={`w-fit rounded-full border ${theme.border} bg-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/25 disabled:cursor-wait disabled:opacity-70`}
            disabled={busy === "comment"}
            onClick={submitComment}
            type="button"
          >
            {busy === "comment" ? "送信中..." : "コメント投稿"}
          </button>
        </div>
      )}

      {profile && engagement.myCommentRestricted && (
        <div className="mt-5 rounded-[8px] border border-red-300/30 bg-red-300/15 p-3 text-sm font-bold text-red-100">
          このイベントではコメント権限が制限されています。
        </div>
      )}

      {profile && !isOrganizer && !canEngage && (
        <div className="mt-5 rounded-[8px] border border-white/15 bg-white/10 p-3 text-sm font-bold text-slate-200">
          参加が承認された後にコメントと投票ができます。
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {engagement.comments.map((item) => {
          const restricted = engagement.restrictedUserIds.includes(item.user_id);
          const name = item.profiles?.display_name || item.profiles?.email || "User";
          return (
            <article key={item.id} className="rounded-[8px] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{name}</p>
                  <p className="text-xs font-bold text-slate-400">
                    {new Date(item.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                  </p>
                </div>
                {isOrganizer && (
                  <div className="flex flex-wrap gap-2">
                    {!item.hidden && (
                      <button
                        className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/20"
                        disabled={busy === `hide-${item.id}`}
                        onClick={() => runModeration(`hide-${item.id}`, () => hideEventComment(item.id, eventId))}
                        type="button"
                      >
                        非表示
                      </button>
                    )}
                    <button
                      className="rounded-full bg-red-500/20 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/30"
                      disabled={busy === `delete-${item.id}`}
                      onClick={() => runModeration(`delete-${item.id}`, () => deleteEventComment(item.id, eventId))}
                      type="button"
                    >
                      <Trash2 className="inline h-3.5 w-3.5" /> 削除
                    </button>
                    <button
                      className="rounded-full bg-amber-400/20 px-3 py-2 text-xs font-black text-amber-100 hover:bg-amber-400/30"
                      disabled={busy === `restrict-${item.user_id}`}
                      onClick={() =>
                        runModeration(`restrict-${item.user_id}`, () =>
                          restricted
                            ? unrestrictEventCommenter(eventId, item.user_id)
                            : restrictEventCommenter(eventId, item.user_id)
                        )
                      }
                      type="button"
                    >
                      {restricted ? "制限解除" : "コメント制限"}
                    </button>
                  </div>
                )}
              </div>
              <p className={`mt-3 whitespace-pre-wrap leading-7 ${item.hidden ? "text-slate-500 line-through" : "text-slate-200"}`}>
                {item.hidden ? "このコメントは非表示です。" : item.content}
              </p>
            </article>
          );
        })}
        {!engagement.comments.length && (
          <div className="rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm font-bold text-slate-400">
            まだコメントはありません。
          </div>
        )}
      </div>
    </section>
  );
}

function RegistrationAction({
  event,
  profile,
  isOrganizer,
  registrationStatus,
  isManualReview,
  registerEventAction,
  showManualMessage,
  setShowManualMessage,
  theme
}: {
  event: Event;
  profile: Profile | null;
  isOrganizer: boolean;
  registrationStatus: RegistrationStatus | null;
  isManualReview: boolean;
  registerEventAction: (formData: FormData) => Promise<RegisterEventResult>;
  showManualMessage: boolean;
  setShowManualMessage: (value: boolean) => void;
  theme: ReturnType<typeof getTheme>;
}) {
  const [registrationState, submitRegistration, isSubmitting] = useActionState(
    async (_previousState: RegisterEventResult | null, formData: FormData) => registerEventAction(formData),
    null
  );

  if (isOrganizer) return null;

  if (event.status !== "published") {
    return (
      <div className="mt-6 rounded-[8px] border border-amber-300/30 bg-amber-300/15 p-4 text-sm font-black text-amber-100">
        承認後に参加できます
      </div>
    );
  }

  if (!profile) {
    return (
      <Link className={`mt-6 inline-flex w-full items-center justify-center rounded-full border ${theme.border} bg-white/15 px-6 py-4 text-sm font-black text-white shadow-xl backdrop-blur transition hover:bg-white/25`} href={`/login?redirectTo=/events/${event.id}`}>
        ログインして参加
      </Link>
    );
  }

  if (registrationStatus === "approved" || registrationStatus === "pending") {
    return (
      <div className="mt-6 rounded-[8px] border border-emerald-300/30 bg-emerald-300/15 p-4 text-sm font-black text-emerald-100">
        {registrationStatus === "approved" ? "参加済みです。" : "参加申込済みです。承認をお待ちください。"}
      </div>
    );
  }

  if (registrationStatus === "rejected") {
    return (
      <div className="mt-6 rounded-[8px] border border-red-300/30 bg-red-300/15 p-4 text-sm font-black text-red-100">
        参加申込は却下されています。
      </div>
    );
  }

  if (!isManualReview) {
    return (
      <form action={submitRegistration} className="mt-6">
        <input type="hidden" name="event_id" value={event.id} />
        <button
          className={`w-full rounded-full border ${theme.border} bg-white/15 px-6 py-4 text-sm font-black text-white shadow-xl backdrop-blur transition hover:bg-white/25 disabled:cursor-wait disabled:opacity-75`}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "送信中..." : "参加申込"}
        </button>
        <RegistrationNotice state={registrationState} />
      </form>
    );
  }

  return (
    <div className="mt-6">
      {!showManualMessage ? (
        <button
          className={`w-full rounded-full border ${theme.border} bg-white/15 px-6 py-4 text-sm font-black text-white shadow-xl backdrop-blur transition hover:bg-white/25`}
          onClick={() => setShowManualMessage(true)}
          type="button"
        >
          参加申込
        </button>
      ) : (
        <form action={submitRegistration} className={`rounded-[8px] border ${theme.border} bg-black/20 p-4 shadow-xl backdrop-blur`}>
          <input type="hidden" name="event_id" value={event.id} />
          <label className="flex items-center gap-2 text-sm font-black text-slate-100" htmlFor="registration-message">
            <MessageSquare className="h-4 w-4" />
            主催者へのメッセージ
          </label>
          <textarea
            className="mt-3 min-h-28 w-full resize-y rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-400 focus:border-white/35"
            id="registration-message"
            name="message"
            placeholder="参加目的や主催者への連絡事項を入力してください"
          />
          <RegistrationNotice state={registrationState} />
          <div className="mt-3 flex gap-2">
            <button
              className={`min-w-0 flex-1 rounded-full border ${theme.border} bg-white/15 px-4 py-3 text-sm font-black text-white transition hover:bg-white/25 disabled:cursor-wait disabled:opacity-75`}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "送信中..." : "参加申込を送信"}
            </button>
            <button className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-slate-200 transition hover:bg-white/20" disabled={isSubmitting} onClick={() => setShowManualMessage(false)} type="button">
              閉じる
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function RegistrationNotice({ state }: { state: RegisterEventResult | null }) {
  if (!state) return null;

  return (
    <div
      className={`mt-3 rounded-[8px] border p-3 text-sm font-bold ${
        state.ok
          ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
          : "border-red-300/30 bg-red-300/15 text-red-100"
      }`}
    >
      {state.message}
    </div>
  );
}

function StatCard({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/10 p-5">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className={strong ? "mt-2 text-3xl font-black text-white" : "mt-2 font-bold text-slate-100"}>{value}</p>
    </div>
  );
}

function ManagementSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur">
      <h2 className="mb-5 text-2xl font-black text-white">{title}</h2>
      <div className="grid gap-5 text-slate-950">{children}</div>
    </section>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-[8px] border border-white/10 bg-white/10 p-4">
      <span className="mt-0.5 text-cyan-200">{icon}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="mt-1 font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
