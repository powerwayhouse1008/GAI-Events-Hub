import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getAnnouncements, getEventDocuments, getEventEngagement, getEventParticipants } from "./eventManagerActions";
import { EventDetailClient } from "./EventDetailClient";
import type { Event, EventComment, RegistrationStatus } from "@/lib/types";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  if (!data) notFound();

  const event = data as Event;
  const profile = await getProfile();
  const isOrganizer = profile?.role === "admin" || profile?.id === event.organizer_id;
  let registrationStatus: RegistrationStatus | null = null;

  let announcements: any[] = [];
  let documents: any[] = [];
  let participants: any[] = [];
  let engagement: {
    likes: number;
    dislikes: number;
    myVote: 1 | -1 | null;
    comments: EventComment[];
    restrictedUserIds: string[];
    myCommentRestricted: boolean;
  } = {
    likes: 0,
    dislikes: 0,
    myVote: null,
    comments: [],
    restrictedUserIds: [],
    myCommentRestricted: false
  };

  try {
    const [loadedAnnouncements, loadedDocuments, loadedEngagement, currentRegistration] = await Promise.all([
      profile ? getAnnouncements(id) : Promise.resolve([]),
      profile ? getEventDocuments(id) : Promise.resolve([]),
      profile ? getEventEngagement(id) : Promise.resolve(engagement),
      profile && !isOrganizer
        ? supabase
            .from("registrations")
            .select("status")
            .eq("event_id", id)
            .eq("user_id", profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null })
    ]);

    announcements = loadedAnnouncements;
    documents = loadedDocuments;
    engagement = loadedEngagement;
    registrationStatus = (currentRegistration.data?.status as RegistrationStatus | undefined) || null;

    if (isOrganizer) {
      participants = await getEventParticipants(id);
    }
  } catch (error) {
    console.error("Error fetching event data:", error);
  }

  return (
    <EventDetailClient
      event={event}
      profile={profile}
      isOrganizer={isOrganizer}
      announcements={announcements}
      documents={documents}
      participants={participants}
      engagement={engagement}
      registrationStatus={registrationStatus}
    />
  );
}
