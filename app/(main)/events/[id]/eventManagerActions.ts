"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile, requireUser } from "@/lib/auth";
import { notifyEventParticipants } from "@/lib/event-notifications";
import type { Announcement, EventComment, EventDocument } from "@/lib/types";

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

async function isEventParticipant(eventId: string, userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  return Boolean(data);
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

  if (error) throw new Error(`通知を作成できませんでした: ${error.message}`);

  await notifyEventParticipants({
    eventId,
    actorId: user.id,
    type: "announcement",
    title,
    message: content
  });

  return data as Announcement;
}

export async function getAnnouncements(eventId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as Announcement[];
}

export async function deleteAnnouncement(announcementId: string, eventId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();

  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    throw new Error("このイベントを管理する権限がありません。");
  }

  const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
  if (error) throw new Error(`通知を削除できませんでした: ${error.message}`);
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

  if (uploadError) throw new Error(`ファイルをアップロードできませんでした: ${uploadError.message}`);

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
    throw new Error(`ファイル情報を保存できませんでした: ${docError.message}`);
  }

  await notifyEventParticipants({
    eventId,
    actorId: user.id,
    type: "document",
    title: title || file.name,
    message: "新しい資料・画像が追加されました。"
  });

  return docData as EventDocument;
}

export async function getEventDocuments(eventId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_documents")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return [];
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
  if (error) throw new Error(`ファイルを削除できませんでした: ${error.message}`);
}

export async function getEventParticipants(eventId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();

  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    throw new Error("このイベントを管理する権限がありません。");
  }

  const { data: registrations, error } = await supabase
    .from("registrations")
    .select("id, user_id, status, message, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`参加者情報を取得できませんでした: ${error.message}`);

  const userIds = [...new Set((registrations || []).map((registration) => registration.user_id))];
  const { data: profiles = [] } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url, company_name")
        .in("id", userIds)
    : { data: [] };

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
  return (registrations || []).map((registration) => ({
    ...registration,
    profiles: profileById.get(registration.user_id) || {
      display_name: null,
      email: null,
      avatar_url: null,
      company_name: null
    }
  }));
}

export async function getEventEngagement(eventId: string) {
  const supabase = createAdminClient();
  const profile = await getProfile();

  const [{ data: votes = [] }, { data: comments = [] }, { data: restrictions = [] }] =
    await Promise.all([
      supabase.from("event_votes").select("user_id, value").eq("event_id", eventId),
      supabase
        .from("event_comments")
        .select("id, event_id, user_id, content, hidden, hidden_by, hidden_at, created_at, updated_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false }),
      supabase.from("event_comment_restrictions").select("user_id").eq("event_id", eventId)
    ]);

  const userIds = [
    ...new Set([
      ...(comments || []).map((comment) => comment.user_id),
      ...(restrictions || []).map((restriction) => restriction.user_id)
    ])
  ];

  const { data: profiles = [] } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url, company_name")
        .in("id", userIds)
    : { data: [] };

  const profileById = new Map((profiles || []).map((commentProfile) => [commentProfile.id, commentProfile]));
  const restrictedUserIds = (restrictions || []).map((restriction) => restriction.user_id);

  return {
    likes: (votes || []).filter((vote) => vote.value === 1).length,
    dislikes: (votes || []).filter((vote) => vote.value === -1).length,
    myVote: profile ? ((votes || []).find((vote) => vote.user_id === profile.id)?.value as 1 | -1 | undefined) || null : null,
    comments: (comments || []).map((comment) => ({
      ...comment,
      profiles: profileById.get(comment.user_id) || null
    })) as EventComment[],
    restrictedUserIds,
    myCommentRestricted: profile ? restrictedUserIds.includes(profile.id) : false
  };
}

export async function setEventVote(eventId: string, value: 1 | -1) {
  const user = await requireUser();
  const supabase = createAdminClient();
  if (!(await isEventParticipant(eventId, user.id))) {
    return { ok: false, message: "参加者のみ投票できます。" };
  }

  const { data: existing } = await supabase
    .from("event_votes")
    .select("id, value")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.value === value) {
    const { error } = await supabase.from("event_votes").delete().eq("id", existing.id);
    return error ? { ok: false, message: error.message } : { ok: true };
  }

  const { error } = await supabase.from("event_votes").upsert(
    {
      event_id: eventId,
      user_id: user.id,
      value
    },
    { onConflict: "event_id,user_id" }
  );

  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function createEventComment(eventId: string, content: string) {
  const user = await requireUser();
  const supabase = createAdminClient();
  const text = content.trim();
  if (!text) return { ok: false, message: "コメントを入力してください。" };
  if (!(await isEventParticipant(eventId, user.id))) {
    return { ok: false, message: "参加者のみコメントできます。" };
  }

  const { data: restriction } = await supabase
    .from("event_comment_restrictions")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (restriction) return { ok: false, message: "このイベントではコメントが制限されています。" };

  const { error } = await supabase.from("event_comments").insert({
    event_id: eventId,
    user_id: user.id,
    content: text
  });

  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function hideEventComment(commentId: string, eventId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();
  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    return { ok: false, message: "このコメントを管理する権限がありません。" };
  }

  const { error } = await supabase
    .from("event_comments")
    .update({ hidden: true, hidden_by: user.id, hidden_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("event_id", eventId);

  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function deleteEventComment(commentId: string, eventId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();
  const { data: comment } = await supabase
    .from("event_comments")
    .select("user_id")
    .eq("id", commentId)
    .eq("event_id", eventId)
    .maybeSingle();

  const canManage = await verifyOrganizerAccess(eventId, user.id);
  if (!comment || (!canManage && comment.user_id !== user.id)) {
    return { ok: false, message: "このコメントを削除する権限がありません。" };
  }

  const { error } = await supabase.from("event_comments").delete().eq("id", commentId).eq("event_id", eventId);
  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function restrictEventCommenter(eventId: string, userId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();
  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    return { ok: false, message: "コメント権限を管理できません。" };
  }

  const { error } = await supabase.from("event_comment_restrictions").upsert(
    {
      event_id: eventId,
      user_id: userId,
      restricted_by: user.id
    },
    { onConflict: "event_id,user_id" }
  );

  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function unrestrictEventCommenter(eventId: string, userId: string) {
  const user = await requireUser();
  const supabase = createAdminClient();
  if (!(await verifyOrganizerAccess(eventId, user.id))) {
    return { ok: false, message: "コメント権限を管理できません。" };
  }

  const { error } = await supabase
    .from("event_comment_restrictions")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  return error ? { ok: false, message: error.message } : { ok: true };
}
