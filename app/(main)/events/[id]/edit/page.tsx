import { EventForm } from "@/app/(main)/events/new/EventForm";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";
import { notFound, redirect } from "next/navigation";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  if (!data) notFound();

  const event = data as Event;
  if (event.organizer_id !== user.id) redirect(`/events/${event.id}`);

  return (
    <main className="min-h-screen bg-gai-pink">
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <h1 className="text-5xl font-black tracking-tight">Edit Event</h1>
        <p className="mt-3 text-slate-600">
          Updating an event sends it back to pending status for admin approval.
        </p>
        <EventForm event={event} />
      </div>
    </main>
  );
}
