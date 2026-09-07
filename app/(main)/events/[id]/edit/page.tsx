import { EventForm } from "@/app/(main)/events/new/EventForm";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";
import { notFound, redirect } from "next/navigation";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  if (!data) notFound();

  const event = data as Event;
  const canEdit = profile.role === "admin" || event.organizer_id === profile.id;
  if (!canEdit) redirect(`/events/${event.id}`);

  return (
    <main className="min-h-screen bg-[#f8ecfb]">
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <h1 className="text-5xl font-black tracking-tight">イベント修正</h1>
        <p className="mt-3 text-slate-600">イベント情報を更新できます。管理者は更新後すぐに公開できます。</p>
        <EventForm event={event} />
      </div>
    </main>
  );
}
