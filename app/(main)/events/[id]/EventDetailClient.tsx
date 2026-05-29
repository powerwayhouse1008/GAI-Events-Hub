"use client";

import { useState } from "react";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { AnnouncementsList } from "@/components/AnnouncementsList";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentsList } from "@/components/DocumentsList";
import { ParticipantsList } from "@/components/ParticipantsList";
import {
  getAnnouncements,
  getEventDocuments,
  getEventParticipants,
} from "./eventManagerActions";
import type { Event, Profile, Announcement, EventDocument } from "@/lib/types";

interface EventDetailClientProps {
  event: Event;
  profile: Profile | null;
  isOrganizer: boolean;
  announcements: Announcement[];
  documents: EventDocument[];
  participants: any[];
  registerEventAction: (formData: FormData) => Promise<void>;
}

export function EventDetailClient({
  event,
  profile,
  isOrganizer,
  announcements: initialAnnouncements,
  documents: initialDocuments,
  participants: initialParticipants,
  registerEventAction,
}: EventDetailClientProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [documents, setDocuments] = useState(initialDocuments);
  const [participants, setParticipants] = useState(initialParticipants);

  const handleAnnouncementSuccess = async () => {
    const newAnnouncements = await getAnnouncements(event.id);
    setAnnouncements(newAnnouncements);
  };

  const handleDocumentSuccess = async () => {
    const newDocuments = await getEventDocuments(event.id);
    setDocuments(newDocuments);
  };

  const handleDeleteAnnouncement = async () => {
    const newAnnouncements = await getAnnouncements(event.id);
    setAnnouncements(newAnnouncements);
  };

  const handleDeleteDocument = async () => {
    const newDocuments = await getEventDocuments(event.id);
    setDocuments(newDocuments);
  };

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-12">
      {isOrganizer && (
        <div className="mb-6 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-semibold text-purple-700">
            ℹ️ あなたはこのイベントの主催者です。下記でイベント情報を管理できます。
          </p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_390px]">
        {/* Main Content */}
        <section>
          <div className="overflow-hidden rounded-[36px] bg-purple-100">
            {event.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.cover_url}
                alt=""
                className="h-[420px] w-full object-cover"
              />
            ) : (
              <div className="grid h-[420px] place-items-center text-7xl font-black text-purple-600">
                AI
              </div>
            )}
          </div>
          <h1 className="mt-8 text-5xl font-black tracking-tight">{event.title}</h1>
          <p className="mt-4 text-slate-500">{event.organizer_name}</p>
          <article className="prose mt-8 max-w-none whitespace-pre-wrap text-slate-700">
            {event.description}
          </article>

          {isOrganizer && (
            <>
              {/* Organizer Dashboard */}
              <div className="mt-12 space-y-8 border-t border-slate-200 pt-8">
                {/* Event Statistics */}
                <div>
                  <h2 className="mb-6 text-2xl font-black">イベント統計</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                      <p className="text-sm font-semibold text-slate-600">開始日時</p>
                      <p className="mt-2 font-bold text-slate-900">
                        {new Date(event.starts_at).toLocaleString("ja-JP", {
                          timeZone: "Asia/Tokyo",
                        })}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6">
                      <p className="text-sm font-semibold text-slate-600">
                        参加者申請
                      </p>
                      <p className="mt-2 text-3xl font-black text-green-600">
                        {participants.length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                      <p className="text-sm font-semibold text-slate-600">承認済み</p>
                      <p className="mt-2 text-3xl font-black text-purple-600">
                        {participants.filter((p: any) => p.status === "approved").length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                      <p className="text-sm font-semibold text-slate-600">
                        収容可能
                      </p>
                      <p className="mt-2 text-3xl font-black text-orange-600">
                        {event.capacity || "∞"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Announcements Section */}
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-black">通知</h2>
                  </div>
                  <div className="mb-4">
                    <AnnouncementForm
                      eventId={event.id}
                      onSuccess={handleAnnouncementSuccess}
                    />
                  </div>
                  <AnnouncementsList
                    announcements={announcements}
                    onDelete={handleDeleteAnnouncement}
                    isOrganizerView={true}
                  />
                </div>

                {/* Documents Section */}
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-black">ドキュメント</h2>
                  </div>
                  <div className="mb-4">
                    <DocumentUpload
                      eventId={event.id}
                      onSuccess={handleDocumentSuccess}
                    />
                  </div>
                  <DocumentsList
                    documents={documents}
                    onDelete={handleDeleteDocument}
                    isOrganizerView={true}
                  />
                </div>

                {/* Participants Section */}
                <div>
                  <h2 className="mb-6 text-2xl font-black">参加者</h2>
                  <ParticipantsList
                    participants={participants}
                    totalCapacity={event.capacity}
                  />
                </div>
              </div>
            </>
          )}

          {/* Participant View - Announcements and Documents */}
          {!isOrganizer && profile && (
            <div className="mt-12 space-y-8 border-t border-slate-200 pt-8">
              {/* Public Announcements */}
              {announcements.length > 0 && (
                <div>
                  <h2 className="mb-4 text-2xl font-black">通知</h2>
                  <AnnouncementsList
                    announcements={announcements}
                    onDelete={handleDeleteAnnouncement}
                    isOrganizerView={false}
                  />
                </div>
              )}

              {/* Public Documents */}
              {documents.length > 0 && (
                <div>
                  <h2 className="mb-4 text-2xl font-black">ドキュメント</h2>
                  <DocumentsList
                    documents={documents}
                    onDelete={handleDeleteDocument}
                    isOrganizerView={false}
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-bold text-slate-400">日時</p>
          <p className="mt-1 text-xl font-black">
            {new Date(event.starts_at).toLocaleString("ja-JP", {
              timeZone: "Asia/Tokyo",
            })}
          </p>
          <p className="mt-6 text-sm font-bold text-slate-400">場所</p>
          <p className="mt-1 font-bold">{event.location || "Online / TBA"}</p>
          {event.online_url && (
            <p className="mt-2 break-all text-purple-700">{event.online_url}</p>
          )}
          <p className="mt-6 text-sm font-bold text-slate-400">価格</p>
          <p className="mt-1 font-black">
            {event.ticket_price ? `¥${event.ticket_price}` : "無料"}
          </p>

          {profile && !isOrganizer ? (
            <form action={registerEventAction} className="mt-8">
              <input type="hidden" name="event_id" value={event.id} />
              <textarea
                className="input mb-4 min-h-24"
                name="message"
                placeholder="主催者へのメッセージ"
              />
              <button className="btn btn-primary w-full">申し込む</button>
            </form>
          ) : !profile ? (
            <a
              className="btn btn-primary mt-8 w-full"
              href={`/login?redirectTo=/events/${event.id}`}
            >
              ログインして申し込む
            </a>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
