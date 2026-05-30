"use client";

import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EventFormProps = {
  event?: Event;
};

const categories = [
  "AI",
  "Tech",
  "Startup",
  "Developer",
  "Seminar",
  "Networking",
  "Hackathon",
  "Web3",
  "Robotics"
];

const regions = [
  "Tokyo",
  "Osaka",
  "Kyoto",
  "Singapore",
  "Seoul",
  "Taipei",
  "Hong Kong",
  "Bangkok",
  "Online"
];

function datePart(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function timePart(value?: string | null) {
  if (!value) return "";
  return value.slice(11, 16);
}

export function EventForm({ event }: EventFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>(event?.cover_url || "");
  const isEditing = Boolean(event);

  async function submit(formData: FormData) {
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    let coverUrl: string | null = event?.cover_url || null;
    const file = formData.get("cover") as File | null;

    if (file && file.size > 0) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("event-covers")
        .upload(path, file);

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
      coverUrl = data.publicUrl;
    }

    const startDate = String(formData.get("start_date") || "");
    const startTime = String(formData.get("start_time") || "00:00");
    const endDate = String(formData.get("end_date") || startDate);
    const endTime = String(formData.get("end_time") || startTime || "00:00");
    const startsAt = `${startDate}T${startTime}:00+09:00`;
    const endsAt = `${endDate}T${endTime}:00+09:00`;

    const payload = {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      organizer_id: user.id,
      organizer_name: String(formData.get("organizer_name") || ""),
      category: String(formData.get("category") || "AI"),
      region: String(formData.get("region") || "Online"),
      location: String(formData.get("location") || ""),
      online_url: String(formData.get("online_url") || ""),
      cover_url: coverUrl,
      starts_at: startsAt,
      ends_at: endsAt,
      capacity: Number(formData.get("capacity") || 0) || null,
      ticket_price: Number(formData.get("ticket_price") || 0),
      approval_mode: String(formData.get("approval_mode") || "manual"),
      status: "pending",
      featured: event?.featured || false
    };

    const { data, error } = isEditing
      ? await supabase
          .from("events")
          .update(payload)
          .eq("id", event?.id)
          .eq("organizer_id", user.id)
          .select("id")
          .single()
      : await supabase.from("events").insert(payload).select("id").single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push(`/events/${data.id}`);
    router.refresh();
  }

  return (
    <form action={submit} className="mt-10 grid gap-8 lg:grid-cols-[500px_1fr]">
      <section>
        <label className="block cursor-pointer overflow-hidden rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
          <div className="grid h-[500px] place-items-center rounded-2xl bg-gradient-to-br from-blue-950 via-sky-500 to-fuchsia-300 text-7xl font-black text-white">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPreview} alt="" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              "AI"
            )}
          </div>
          <input
            type="file"
            name="cover"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setCoverPreview(URL.createObjectURL(file));
            }}
          />
          <p className="mt-4 text-center font-bold text-purple-700">
            Upload event cover image
          </p>
        </label>
      </section>

      <section className="grid gap-5 rounded-3xl border border-purple-100 bg-white/45 p-7 shadow-sm backdrop-blur">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          Events are submitted as pending. Admin approval is required before they are public.
        </div>

        <input
          className="w-full bg-transparent text-6xl font-black tracking-tight text-purple-700 outline-none placeholder:text-purple-300"
          name="title"
          placeholder="イベント名"
          defaultValue={event?.title || ""}
          required
        />

        <div className="grid gap-4 rounded-2xl bg-white/70 p-4 md:grid-cols-[110px_1fr_160px]">
          <div className="grid gap-3 font-bold text-purple-600">
            <span>Start</span>
            <span>End</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" name="start_date" type="date" defaultValue={datePart(event?.starts_at)} required />
            <input className="input" name="start_time" type="time" defaultValue={timePart(event?.starts_at)} />
            <input className="input" name="end_date" type="date" defaultValue={datePart(event?.ends_at)} />
            <input className="input" name="end_time" type="time" defaultValue={timePart(event?.ends_at)} />
          </div>
          <div className="rounded-2xl bg-purple-50 p-4 font-bold text-purple-700">
            GMT+09:00<br />Asia/Tokyo
          </div>
        </div>

        <input className="input" name="location" placeholder="Venue or address" defaultValue={event?.location || ""} />
        <input className="input" name="online_url" placeholder="Online URL" defaultValue={event?.online_url || ""} />
        <textarea
          className="input min-h-32"
          name="description"
          placeholder="Event description"
          defaultValue={event?.description || ""}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="input"
            name="organizer_name"
            placeholder="Organizer name"
            defaultValue={event?.organizer_name || "Global AI Industry Alliance"}
          />
          <select className="input" name="category" defaultValue={event?.category || "AI"}>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select className="input" name="region" defaultValue={event?.region || "Tokyo"}>
            {regions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <input
            className="input"
            name="ticket_price"
            type="number"
            min="0"
            placeholder="Ticket price"
            defaultValue={event?.ticket_price || 0}
          />
          <select className="input" name="approval_mode" defaultValue={event?.approval_mode || "manual"}>
            <option value="manual">Manual participant review</option>
            <option value="auto">Auto approve participants</option>
          </select>
          <input
            className="input"
            name="capacity"
            type="number"
            min="0"
            placeholder="Capacity"
            defaultValue={event?.capacity || ""}
          />
        </div>

        <button disabled={loading} className="btn btn-primary w-full text-lg" type="submit">
          {loading ? "Saving..." : isEditing ? "Update event and request approval" : "Create event"}
        </button>
      </section>
    </form>
  );
}
