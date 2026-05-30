"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Announcement, EventDocument } from "@/lib/types";

// Check if user is event organizer
async function verifyOrganizerAccess(eventId: string, userId: string) {
  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== userId) {
    return false;
  }
  return true;
}

// Create announcement
export async function createAnnouncement(
  eventId: string,
  title: string,
  content: string
) {
  const user = await requireUser();
  const supabase = await createClient();

  // Verify access
  const isAuthorized = await verifyOrganizerAccess(eventId, user.id);
  if (!isAuthorized) {
    throw new Error("Unauthorized: Only event organizer can create announcements");
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      event_id: eventId,
      organizer_id: user.id,
      title,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Announcement;
}

// Get announcements for event
export async function getAnnouncements(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Announcement[];
}

// Delete announcement
export async function deleteAnnouncement(announcementId: string, eventId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  // Verify access
  const isAuthorized = await verifyOrganizerAccess(eventId, user.id);
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) throw error;
}

// Upload document
export async function uploadDocument(
  eventId: string,
  file: File,
  title: string
) {
  const user = await requireUser();
  const supabase = createAdminClient();

  // Verify access
  const isAuthorized = await verifyOrganizerAccess(eventId, user.id);
  if (!isAuthorized) {
    throw new Error("このイベントの主催者だけがファイルをアップロードできます。");
  }

  // Upload file to storage
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${eventId}/${Date.now()}-${safeName}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("event-documents")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`ファイルをアップロードできませんでした。${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from("event-documents")
    .getPublicUrl(uploadData.path);

  // Create document record
  const { data: docData, error: docError } = await supabase
    .from("event_documents")
    .insert({
      event_id: eventId,
      organizer_id: user.id,
      title: title || file.name,
      file_url: data.publicUrl,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();

  if (docError) {
    await supabase.storage.from("event-documents").remove([uploadData.path]);
    throw new Error(`ファイル情報を保存できませんでした。${docError.message}`);
  }
  return docData as EventDocument;
}

// Get documents for event
export async function getEventDocuments(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_documents")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as EventDocument[];
}

// Delete document
export async function deleteDocument(documentId: string, eventId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  // Verify access
  const isAuthorized = await verifyOrganizerAccess(eventId, user.id);
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  // Get document info
  const { data: doc } = await supabase
    .from("event_documents")
    .select("file_url")
    .eq("id", documentId)
    .single();

  if (doc && doc.file_url) {
    // Extract file path from URL
    const urlParts = doc.file_url.split("/storage/v1/object/public/event-documents/");
    if (urlParts[1]) {
      await supabase.storage
        .from("event-documents")
        .remove([urlParts[1]]);
    }
  }

  // Delete database record
  const { error } = await supabase
    .from("event_documents")
    .delete()
    .eq("id", documentId);

  if (error) throw error;
}

// Get registrations with participant info
export async function getEventParticipants(eventId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  // Verify access
  const isAuthorized = await verifyOrganizerAccess(eventId, user.id);
  if (!isAuthorized) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      id,
      user_id,
      status,
      message,
      created_at,
      profiles:user_id (
        display_name,
        email,
        avatar_url,
        company_name
      )
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
