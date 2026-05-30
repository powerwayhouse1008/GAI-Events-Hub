import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notFound } from "next/navigation";
import { registerEvent } from "./registerEvent";
import { getAnnouncements, getEventDocuments, getEventParticipants } from "./eventManagerActions";
import { EventDetailClient } from "./EventDetailClient";
import type { Event } from "@/lib/types";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  if (!data) notFound();

  const event = data as Event;
  const profile = await getProfile();
  const isOrganizer = profile?.role === "admin" || profile?.id === event.organizer_id;

  let announcements: any[] = [];
  let documents: any[] = [];
  let participants: any[] = [];

  try {
    [announcements, documents] = await Promise.all([
      profile ? getAnnouncements(id) : Promise.resolve([]),
      profile ? getEventDocuments(id) : Promise.resolve([])
    ]);
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
      registerEventAction={registerEvent}
    />
  );
}
