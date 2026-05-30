"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile, requireUser } from "@/lib/auth";
import type { Announcement, EventDocument } from "@/lib/types";

async function verifyOrganizerAccess(eventId: string, userId: string) {
  const profile = await getProfile();
  if (profile?.role === "admin") return true;

  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .single();

  return Boolean(event && event.organizer_id === userId);
}

export async function createAnnouncement(eventId: string, title: string, content: string) {
  const user = await requireUser();
  const supabase = createAdminClient();

  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    throw new Error("このイベントを管理する権限がありません。");
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      event_id: eventId,
      organizer_id: user.id,
      title,
      content
    })
    .select()
    .single();

  if (error) throw new Error(`通知を作成できませんでした。${error.message}`);
  return data as Announcement;
}

export async function getAnnouncements(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`通知を取得できませんでした。${error.message}`);
  return data as Announcement[];
}

export async function deleteAnnouncement(announcementId: string, eventId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();

  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    throw new Error("このイベントを管理する権限がありません。");
  }

  const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
  if (error) throw new Error(`通知を削除できませんでした。${error.message}`);
}

export async function uploadDocument(eventId: string, file: File, title: string) {
  const user = await requireUser();
  const supabase = createAdminClient();

  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    throw new Error("このイベントを管理する権限がありません。");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${eventId}/${Date.now()}-${safeName}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("event-documents")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {
    throw new Error(`ファイルをアップロードできませんでした。${uploadError.message}`);
  }

  const { data } = supabase.storage.from("event-documents").getPublicUrl(uploadData.path);

  const { data: docData, error: docError } = await supabase
    .from("event_documents")
    .insert({
      event_id: eventId,
      organizer_id: user.id,
      title: title || file.name,
      file_url: data.publicUrl,
      file_type: file.type,
      file_size: file.size
    })
    .select()
    .single();

  if (docError) {
    await supabase.storage.from("event-documents").remove([uploadData.path]);
    throw new Error(`ファイル情報を保存できませんでした。${docError.message}`);
  }

  return docData as EventDocument;
}

export async function getEventDocuments(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_documents")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`ファイル一覧を取得できませんでした。${error.message}`);
  return data as EventDocument[];
}

export async function deleteDocument(documentId: string, eventId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();

  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    throw new Error("このイベントを管理する権限がありません。");
  }

  const { data: doc } = await supabase
    .from("event_documents")
    .select("file_url")
    .eq("id", documentId)
    .single();

  if (doc?.file_url) {
    const urlParts = doc.file_url.split("/storage/v1/object/public/event-documents/");
    if (urlParts[1]) {
      await supabase.storage.from("event-documents").remove([urlParts[1]]);
    }
  }

  const { error } = await supabase.from("event_documents").delete().eq("id", documentId);
  if (error) throw new Error(`ファイルを削除できませんでした。${error.message}`);
}

export async function getEventParticipants(eventId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();

  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    throw new Error("このイベントを管理する権限がありません。");
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

  if (error) throw new Error(`参加者情報を取得できませんでした。${error.message}`);
  return data;
}
