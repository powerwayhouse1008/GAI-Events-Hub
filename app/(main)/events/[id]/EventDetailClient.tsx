"use client";

import Link from "next/link";
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

  const refreshAnnouncements = async () => {
    setAnnouncements(await getAnnouncements(event.id));
  };

  const refreshDocuments = async () => {
    setDocuments(await getEventDocuments(event.id));
  };

  const refreshParticipants = async () => {
    setParticipants(await getEventParticipants(event.id));
  };

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-12">
      {isOrganizer && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-semibold text-purple-700">
            You are the organizer. Status: {event.status}. Manage participants, announcements, documents, and event images here.
          </p>
          <Link href={`/events/${event.id}/edit`} className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-bold text-white">
            Edit Event
          </Link>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_390px]">
        <section>
          <div className="overflow-hidden rounded-[36px] bg-purple-100">
            {event.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.cover_url} alt="" className="h-[420px] w-full object-cover" />
            ) : (
              <div className="grid h-[420px] place-items-center text-7xl font-black text-purple-600">
                AI
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-black tracking-tight">{event.title}</h1>
              <p className="mt-4 text-slate-500">{event.organizer_name}</p>
            </div>
            <span className={`status status-${event.status}`}>{event.status}</span>
          </div>

          {event.status === "pending" && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
              This event is waiting for admin approval. It will become public after admin publishes it.
            </div>
          )}

          <article className="prose mt-8 max-w-none whitespace-pre-wrap text-slate-700">
            {event.description}
          </article>

          {isOrganizer && (
            <div className="mt-12 space-y-8 border-t border-slate-200 pt-8">
              <div>
                <h2 className="mb-6 text-2xl font-black">Event Progress</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl bg-blue-50 p-6">
                    <p className="text-sm font-semibold text-slate-600">Start</p>
                    <p className="mt-2 font-bold text-slate-900">
                      {new Date(event.starts_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-6">
                    <p className="text-sm font-semibold text-slate-600">Applications</p>
                    <p className="mt-2 text-3xl font-black text-green-600">{participants.length}</p>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-6">
                    <p className="text-sm font-semibold text-slate-600">Approved</p>
                    <p className="mt-2 text-3xl font-black text-purple-600">
                      {participants.filter((p: any) => p.status === "approved").length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-orange-50 p-6">
                    <p className="text-sm font-semibold text-slate-600">Capacity</p>
                    <p className="mt-2 text-3xl font-black text-orange-600">{event.capacity || "Unlimited"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-black">Updates</h2>
                <div className="mb-4">
                  <AnnouncementForm eventId={event.id} onSuccess={refreshAnnouncements} />
                </div>
                <AnnouncementsList announcements={announcements} onDelete={refreshAnnouncements} isOrganizerView={true} />
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-black">Documents and Images</h2>
                <div className="mb-4">
                  <DocumentUpload eventId={event.id} onSuccess={refreshDocuments} />
                </div>
                <DocumentsList documents={documents} onDelete={refreshDocuments} isOrganizerView={true} />
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-black">Participants</h2>
                <button
                  onClick={refreshParticipants}
                  className="mb-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                  type="button"
                >
                  Refresh participants
                </button>
                <ParticipantsList participants={participants} totalCapacity={event.capacity} />
              </div>
            </div>
          )}

          {!isOrganizer && profile && (announcements.length > 0 || documents.length > 0) && (
            <div className="mt-12 space-y-8 border-t border-slate-200 pt-8">
              {announcements.length > 0 && (
                <div>
                  <h2 className="mb-4 text-2xl font-black">Updates</h2>
                  <AnnouncementsList announcements={announcements} onDelete={refreshAnnouncements} isOrganizerView={false} />
                </div>
              )}

              {documents.length > 0 && (
                <div>
                  <h2 className="mb-4 text-2xl font-black">Documents</h2>
                  <DocumentsList documents={documents} onDelete={refreshDocuments} isOrganizerView={false} />
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-bold text-slate-400">Date</p>
          <p className="mt-1 text-xl font-black">
            {new Date(event.starts_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
          </p>
          <p className="mt-6 text-sm font-bold text-slate-400">Location</p>
          <p className="mt-1 font-bold">{event.location || "Online / TBA"}</p>
          {event.online_url && <p className="mt-2 break-all text-purple-700">{event.online_url}</p>}
          <p className="mt-6 text-sm font-bold text-slate-400">Price</p>
          <p className="mt-1 font-black">{event.ticket_price ? `¥${event.ticket_price}` : "Free"}</p>

          {event.status !== "published" && !isOrganizer ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
              Registration opens after admin approval.
            </div>
          ) : profile && !isOrganizer ? (
            <form action={registerEventAction} className="mt-8">
              <input type="hidden" name="event_id" value={event.id} />
              <textarea className="input mb-4 min-h-24" name="message" placeholder="Message to organizer" />
              <button className="btn btn-primary w-full">Register</button>
            </form>
          ) : !profile ? (
            <Link className="btn btn-primary mt-8 w-full" href={`/login?redirectTo=/events/${event.id}`}>
              Login to register
            </Link>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
