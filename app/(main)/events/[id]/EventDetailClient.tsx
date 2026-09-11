"use client";

import Link from "next/link";
import { useState } from "react";
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
import { useLanguage } from "@/components/LanguageProvider";
import { useLocalizedEvent } from "@/components/LocalizedEventText";
import { ParticipantsList } from "@/components/ParticipantsList";
import { RegistrationReviewPanel } from "@/components/RegistrationReviewPanel";
import { formatTokyoDate, formatTokyoDateTime, formatTokyoTimeRange, getEventTheme } from "@/lib/events";
import { pickLocalized } from "@/lib/i18n";
import {
  createEventComment,
  deleteEventComment,
  getAnnouncements,
  getEventDocuments,
  getEventEngagement,
  getEventParticipants,
  hideEventComment,
  restrictEventCommenter,
  saveEventCommentTranslations,
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
}

const statusLabel: Record<string, string> = {
  pending: "承認待ち",
  published: "公開中",
  rejected: "却下",
  draft: "下書き",
  approved: "承認済み"
};

function autoGrowTextarea(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
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
  registrationStatus
}: EventDetailClientProps) {
  const { t } = useLanguage();
  const localizedEvent = useLocalizedEvent(event);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [documents, setDocuments] = useState(initialDocuments);
  const [participants, setParticipants] = useState(initialParticipants);
  const [engagement, setEngagement] = useState(initialEngagement);
  const [showManualMessage, setShowManualMessage] = useState(false);
  const [activeManagerModal, setActiveManagerModal] = useState<"announcement" | "document" | null>(null);
  const theme = getEventTheme(localizedEvent);
  const isManualReview = localizedEvent.approval_mode === "manual";
  const canEngage = registrationStatus === "approved";
  const approvedCount = participants.filter((participant: any) => participant.status === "approved").length;

  const refreshAnnouncements = async () => setAnnouncements(await getAnnouncements(localizedEvent.id));
  const refreshDocuments = async () => setDocuments(await getEventDocuments(localizedEvent.id));
  const refreshParticipants = async () => setParticipants(await getEventParticipants(localizedEvent.id));
  const refreshEngagement = async () => setEngagement(await getEventEngagement(localizedEvent.id));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#061319] text-white">
      <section className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.soft}`} />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(6,19,25,.96),rgba(9,22,34,.88)_45%,rgba(7,11,24,.96)),radial-gradient(circle_at_84%_14%,rgba(56,189,248,.18),transparent_30%)]" />

        <div className="relative mx-auto max-w-[1480px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {isOrganizer && (
            <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border ${theme.border} bg-white/[0.08] p-4 shadow-xl ${theme.glow} backdrop-blur`}>
              <p className="text-sm font-bold text-slate-200">
                このイベントを管理できます。現在の状態: <span className={theme.badge}>{statusLabel[localizedEvent.status] || localizedEvent.status}</span>
              </p>
              <Link href={`/events/${localizedEvent.id}/edit`} className={`btn bg-gradient-to-r ${theme.gradient} text-white`}>
                <Edit3 size={17} /> イベント編集
              </Link>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="min-w-0">
              <HeroBlock event={localizedEvent} theme={theme} />

              <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0">
                  <ParticipantTimeline announcements={announcements} theme={theme} />
                  <ParticipantDocuments documents={documents} theme={theme} />
                  <EventEngagementPanel
                    eventId={localizedEvent.id}
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
                  <h2 className="mt-5 text-2xl font-black">{t("Event Information")}</h2>

                  <div className="mt-6 grid gap-3">
                    <InfoRow icon={<CalendarDays size={18} />} label={t("Date")} value={formatTokyoDate(localizedEvent.starts_at)} />
                    <InfoRow icon={<Clock size={18} />} label={t("Time")} value={formatTokyoTimeRange(localizedEvent)} />
                    <InfoRow icon={<MapPin size={18} />} label={t("Location")} value={localizedEvent.location || localizedEvent.region || t("Online / TBA")} />
                    <InfoRow icon={<Ticket size={18} />} label={t("Price")} value={localizedEvent.ticket_price ? `JPY ${localizedEvent.ticket_price}` : t("Free")} />
                    <InfoRow icon={<Users size={18} />} label={t("Participant approval")} value={isManualReview ? t("Manually approve participants") : t("Automatically approve participants")} />
                    <InfoRow icon={<CheckCircle2 size={18} />} label={t("Approved")} value={`${approvedCount} ${t("people")}`} />
                  </div>

                  {localizedEvent.online_url && (
                    <a className={`mt-5 flex items-center gap-2 break-all rounded-[8px] border ${theme.border} bg-white/10 p-4 text-sm font-bold ${theme.badge}`} href={localizedEvent.online_url}>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {localizedEvent.online_url}
                    </a>
                  )}

                </aside>
              </div>

              {isOrganizer && (
                <div className="mt-10 grid gap-8">
                  <section className={`rounded-[8px] border ${theme.border} bg-white/[0.06] p-6 shadow-xl ${theme.glow} backdrop-blur`}>
                    <h2 className="text-2xl font-black">{t("Event Progress")}</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <StatCard label={t("Start")} value={formatTokyoDateTime(localizedEvent.starts_at)} />
                      <StatCard label={t("Register")} value={String(participants.length)} strong />
                      <StatCard label={t("Approved")} value={String(approvedCount)} strong />
                      <StatCard label={t("Capacity")} value={localizedEvent.capacity ? String(localizedEvent.capacity) : t("Unlimited")} strong />
                    </div>
                  </section>

                  <ManagementSection title={t("Notifications & Updates")}>
                    <AnnouncementForm
                      eventId={localizedEvent.id}
                      isOpen={activeManagerModal === "announcement"}
                      onOpenChange={(open) => setActiveManagerModal(open ? "announcement" : null)}
                      onSuccess={refreshAnnouncements}
                    />
                    <AnnouncementsList announcements={announcements} onDelete={refreshAnnouncements} isOrganizerView />
                  </ManagementSection>

                  <ManagementSection title={t("Materials & Images")}>
                    <DocumentUpload
                      eventId={localizedEvent.id}
                      isOpen={activeManagerModal === "document"}
                      onOpenChange={(open) => setActiveManagerModal(open ? "document" : null)}
                      onSuccess={refreshDocuments}
                    />
                    <DocumentsList documents={documents} onDelete={refreshDocuments} isOrganizerView />
                  </ManagementSection>
                  <ManagementSection title={t("Manage Registrations")}>
                    <RegistrationReviewPanel participants={participants} approvalMode={event.approval_mode} onUpdated={refreshParticipants} />
                  </ManagementSection>

                  <ManagementSection title={t("Participant List")}>
                    <button onClick={refreshParticipants} className="btn border border-white/15 bg-white/10 text-white hover:bg-white/15" type="button">
                      {t("Refresh Participants")}
                    </button>
                    <ParticipantsList participants={participants} totalCapacity={localizedEvent.capacity} />
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

      <RegistrationAction
        event={localizedEvent}
        profile={profile}
        isOrganizer={isOrganizer}
        registrationStatus={registrationStatus}
        isManualReview={isManualReview}
        showManualMessage={showManualMessage}
        setShowManualMessage={setShowManualMessage}
        theme={theme}
      />
    </main>
  );
}

function HeroBlock({ event, theme }: { event: Event & { organizerName?: string }; theme: ReturnType<typeof getEventTheme> }) {
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
          <h1 className="mt-5 max-w-5xl whitespace-pre-wrap break-words text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">{event.title}</h1>
          <p className="mt-4 text-base font-bold text-slate-200 sm:text-lg">{event.organizerName || event.organizer_name || "AI Event Organizer"}</p>
        </div>
      </div>

      {event.description && (
        <article
          className="event-description border-t border-white/10 bg-black/20 p-5 leading-8 text-slate-200 sm:p-8"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      )}
    </section>
  );
}

function ParticipantTimeline({ announcements, theme }: { announcements: Announcement[]; theme: ReturnType<typeof getEventTheme> }) {
  const { t } = useLanguage();

  return (
    <section className="mt-0">
      <div className="mb-5 flex items-center gap-3">
        <Bell className={theme.badge} size={22} />
        <h2 className="text-3xl font-black">{t("Notifications & Updates")}</h2>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-[8px] border border-white/15 bg-white/[0.06] p-6 text-slate-300">{t("No notifications yet.")}</div>
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

function ParticipantDocuments({ documents, theme }: { documents: EventDocument[]; theme: ReturnType<typeof getEventTheme> }) {
  const { t } = useLanguage();

  if (documents.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <FileText className={theme.badge} size={22} />
        <h2 className="text-3xl font-black">{t("Materials & Images")}</h2>
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
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/25 px-3 py-2 text-xs font-black text-white shadow-xl backdrop-blur transition hover:bg-white/20"
              >
                {t("Open")}
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
  theme: ReturnType<typeof getEventTheme>;
}) {
  const { language, t } = useLanguage();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function vote(value: 1 | -1) {
    setBusy(`vote-${value}`);
    setNotice(null);
    const result = await setEventVote(eventId, value);
    if (!result.ok) setNotice(result.message ? t(result.message) : t("Could not update."));
    await onUpdated();
    setBusy(null);
  }

  async function submitComment() {
    setBusy("comment");
    setNotice(null);
    const sourceLanguage = language;
    const originalComment = comment;
    const result = await createEventComment(eventId, originalComment, sourceLanguage);
    if (result.ok) setComment("");
    else setNotice(result.message ? t(result.message) : t("Could not post comment."));
    await onUpdated();
    if (result.ok && result.id) {
      try {
        const { prepareCommentTranslations } = await import("@/lib/translation/client");
        const translations = await prepareCommentTranslations({ content: originalComment.trim(), sourceLanguage });
        const translationResult = await saveEventCommentTranslations({ commentId: result.id, eventId, sourceLanguage, ...translations });
        if (translationResult.ok) await onUpdated();
      } catch (error) {
        console.error("Comment translation failed", error);
      }
    }
    setBusy(null);
  }

  async function runModeration(action: string, task: () => Promise<{ ok: boolean; message?: string }>) {
    setBusy(action);
    setNotice(null);
    const result = await task();
    if (!result.ok) setNotice(result.message ? t(result.message) : t("Could not update."));
    await onUpdated();
    setBusy(null);
  }

  return (
    <section className="mt-10 rounded-[8px] border border-white/15 bg-white/[0.06] p-5 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-black">{t("Reactions & Comments")}</h2>
        <div className="flex gap-2">
          <button
            className={`inline-flex items-center gap-2 rounded-full border ${theme.border} px-4 py-2 text-sm font-black transition ${engagement.myVote === 1 ? "bg-emerald-400/25 text-emerald-100" : "bg-white/10 text-white hover:bg-white/20"}`}
            disabled={!profile || !canEngage || busy === "vote-1"}
            onClick={() => vote(1)}
            type="button"
          >
            <ThumbsUp className="h-4 w-4" />
            {engagement.likes}
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-full border ${theme.border} px-4 py-2 text-sm font-black transition ${engagement.myVote === -1 ? "bg-rose-400/25 text-rose-100" : "bg-white/10 text-white hover:bg-white/20"}`}
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
            className="min-h-28 resize-none overflow-hidden rounded-[8px] border border-white/15 bg-black/20 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-400 focus:border-white/35"
            onChange={(event) => {
              setComment(event.target.value);
              autoGrowTextarea(event.currentTarget);
            }}
            placeholder={t("Write a comment")}
            value={comment}
          />
          <button
            className={`w-fit rounded-full border ${theme.border} bg-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/25 disabled:cursor-wait disabled:opacity-70`}
            disabled={busy === "comment"}
            onClick={submitComment}
            type="button"
          >
            {busy === "comment" ? t("Sending...") : t("Post Comment")}
          </button>
        </div>
      )}

      {profile && engagement.myCommentRestricted && <div className="mt-5 rounded-[8px] border border-red-300/30 bg-red-300/15 p-3 text-sm font-bold text-red-100">{t("Commenting is restricted for this event.")}</div>}
      {profile && !isOrganizer && !canEngage && <div className="mt-5 rounded-[8px] border border-white/15 bg-white/10 p-3 text-sm font-bold text-slate-200">{t("You can comment and vote after your registration is approved.")}</div>}

      <div className="mt-6 grid gap-3">
        {engagement.comments.map((item) => {
          const restricted = engagement.restrictedUserIds.includes(item.user_id);
          const name = item.profiles?.display_name || item.profiles?.email || "User";
          const localizedContent = pickLocalized(item.content_i18n, language, item.source_language) || item.content;
          return (
            <article key={item.id} className="rounded-[8px] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-black text-white">{name}</p><p className="text-xs font-bold text-slate-400">{new Date(item.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p></div>
                {isOrganizer && <div className="flex flex-wrap gap-2">
                  {!item.hidden && <button className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/20" disabled={busy === `hide-${item.id}`} onClick={() => runModeration(`hide-${item.id}`, () => hideEventComment(item.id, eventId))} type="button">{t("Hide")}</button>}
                  <button className="rounded-full bg-red-500/20 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-500/30" disabled={busy === `delete-${item.id}`} onClick={() => runModeration(`delete-${item.id}`, () => deleteEventComment(item.id, eventId))} type="button"><Trash2 className="inline h-3.5 w-3.5" /> {t("Delete")}</button>
                  <button className="rounded-full bg-amber-400/20 px-3 py-2 text-xs font-black text-amber-100 hover:bg-amber-400/30" disabled={busy === `restrict-${item.user_id}`} onClick={() => runModeration(`restrict-${item.user_id}`, () => restricted ? unrestrictEventCommenter(eventId, item.user_id) : restrictEventCommenter(eventId, item.user_id))} type="button">{restricted ? t("Remove restriction") : t("Restrict comments")}</button>
                </div>}
              </div>
              <p className={`mt-3 whitespace-pre-wrap leading-7 ${item.hidden ? "text-slate-500 line-through" : "text-slate-200"}`}>{item.hidden ? t("This comment is hidden.") : localizedContent}</p>
            </article>
          );
        })}
        {!engagement.comments.length && <div className="rounded-[8px] border border-white/10 bg-black/20 p-4 text-sm font-bold text-slate-400">{t("No comments yet.")}</div>}
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
  showManualMessage,
  setShowManualMessage,
  theme
}: {
  event: Event;
  profile: Profile | null;
  isOrganizer: boolean;
  registrationStatus: RegistrationStatus | null;
  isManualReview: boolean;
  showManualMessage: boolean;
  setShowManualMessage: (value: boolean) => void;
  theme: ReturnType<typeof getEventTheme>;
}) {
  const { t } = useLanguage();
  const [registrationState, setRegistrationState] = useState<RegisterEventResult | null>(null);
  const [localRegistrationStatus, setLocalRegistrationStatus] = useState(registrationStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRegistration = async (message = "") => {
    setIsSubmitting(true);
    setRegistrationState(null);

    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const result = (await response.json()) as RegisterEventResult;
      setRegistrationState(result);

      if (result.ok && result.status) {
        setLocalRegistrationStatus(result.status);
        setShowManualMessage(false);
      }
    } catch (error) {
      console.error("Registration request failed:", error);
      setRegistrationState({ ok: false, message: "参加申込を送信できませんでした。" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrganizer) return null;

  if (event.status !== "published") {
    return (
      <div className="fixed bottom-5 right-5 z-[9999] max-w-[calc(100vw-2.5rem)] rounded-[8px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-black text-amber-800 shadow-2xl">
        承認後に参加できます
      </div>
    );
  }

  if (!profile) {
    return (
      <Link className="fixed bottom-5 right-5 z-[9999] inline-flex max-w-[calc(100vw-2.5rem)] items-center justify-center rounded-full border border-yellow-200 bg-yellow-300 px-6 py-4 text-sm font-black text-slate-950 shadow-2xl ring-4 ring-yellow-100/70 transition hover:bg-yellow-200" href={`/login?redirectTo=/events/${event.id}`}>
        ログインして参加
      </Link>
    );
  }

  if (localRegistrationStatus === "approved" || localRegistrationStatus === "pending") {
    return (
      <div className="fixed bottom-5 right-5 z-[9999] max-w-[calc(100vw-2.5rem)] rounded-[8px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800 shadow-2xl">
        {localRegistrationStatus === "approved" ? "参加済みです。" : "参加申込済みです。承認をお待ちください。"}
      </div>
    );
  }

  if (localRegistrationStatus === "rejected") {
    return (
      <div className="fixed bottom-5 right-5 z-[9999] max-w-[calc(100vw-2.5rem)] rounded-[8px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-700 shadow-2xl">
        参加申込は却下されています。
      </div>
    );
  }

  if (!isManualReview) {
    return (
      <form
        className="fixed bottom-5 right-5 z-[9999] max-w-[calc(100vw-2.5rem)]"
        onSubmit={(event) => {
          event.preventDefault();
          void submitRegistration();
        }}
      >
        <button
          className="rounded-full border border-yellow-200 bg-yellow-300 px-7 py-4 text-sm font-black text-slate-950 shadow-2xl ring-4 ring-yellow-100/70 transition hover:bg-yellow-200 disabled:cursor-wait disabled:opacity-75"
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
    <div className="fixed bottom-5 right-5 z-[9999] w-[min(360px,calc(100vw-2.5rem))]">
      {!showManualMessage ? (
        <button
          className="w-full rounded-full border border-yellow-200 bg-yellow-300 px-7 py-4 text-sm font-black text-slate-950 shadow-2xl ring-4 ring-yellow-100/70 transition hover:bg-yellow-200"
          onClick={() => setShowManualMessage(true)}
          type="button"
        >
          参加申込
        </button>
      ) : (
        <form
          className="rounded-[8px] border border-yellow-200 bg-white p-4 text-slate-950 shadow-2xl"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            void submitRegistration(String(formData.get("message") || ""));
          }}
        >
          <label className="flex items-center gap-2 text-sm font-black text-slate-950" htmlFor="registration-message">
            <MessageSquare className="h-4 w-4" />
            主催者へのメッセージ
          </label>
          <textarea
            className="mt-3 min-h-28 w-full resize-none overflow-hidden rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 focus:border-yellow-400"
            id="registration-message"
            name="message"
            onInput={(event) => autoGrowTextarea(event.currentTarget)}
            placeholder="参加目的や主催者への連絡事項を入力してください"
          />
          <RegistrationNotice state={registrationState} />
          <div className="mt-3 flex gap-2">
            <button
              className="min-w-0 flex-1 rounded-full border border-yellow-200 bg-yellow-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-yellow-200 disabled:cursor-wait disabled:opacity-75"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "送信中..." : "参加申込を送信"}
            </button>
            <button className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200" disabled={isSubmitting} onClick={() => setShowManualMessage(false)} type="button">
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
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
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
        <p className="mt-1 whitespace-pre-wrap break-words font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
