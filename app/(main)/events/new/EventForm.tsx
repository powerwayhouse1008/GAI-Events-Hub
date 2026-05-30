"use client";

import { Check, ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/lib/types";
import { saveEvent } from "./eventActions";

type EventFormProps = {
  event?: Event;
};

const categories = ["AI", "Tech", "Startup", "Developer", "Seminar", "Networking", "Hackathon", "Web3", "Robotics"];
const regions = ["Tokyo", "Osaka", "Kyoto", "Singapore", "Seoul", "Taipei", "Hong Kong", "Bangkok", "Online"];
const themeColors = [
  { label: "AI Purple", value: "purple", swatch: "from-violet-500 to-fuchsia-500" },
  { label: "Cyber Blue", value: "blue", swatch: "from-blue-500 to-cyan-400" },
  { label: "Startup Green", value: "green", swatch: "from-emerald-400 to-teal-500" },
  { label: "Business Amber", value: "amber", swatch: "from-amber-400 to-orange-500" },
  { label: "Neon Rose", value: "rose", swatch: "from-rose-500 to-pink-500" }
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
  const [selectedTheme, setSelectedTheme] = useState(event?.theme_color || "purple");
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
      const { error: uploadError } = await supabase.storage.from("event-covers").upload(path, file);

      if (uploadError) {
        alert(`画像をアップロードできませんでした。${uploadError.message}`);
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
      eventId: event?.id,
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      organizerName: String(formData.get("organizer_name") || ""),
      category: String(formData.get("category") || "AI"),
      region: String(formData.get("region") || "Online"),
      location: String(formData.get("location") || ""),
      onlineUrl: String(formData.get("online_url") || ""),
      coverUrl,
      themeColor: String(formData.get("theme_color") || selectedTheme || "purple"),
      startsAt,
      endsAt,
      capacity: Number(formData.get("capacity") || 0) || null,
      ticketPrice: Number(formData.get("ticket_price") || 0),
      approvalMode: String(formData.get("approval_mode") || "manual"),
      featured: event?.featured || false
    };

    const result = await saveEvent(payload);

    if (result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }

    router.push(`/events/${result.id}`);
    router.refresh();
  }

  return (
    <form action={submit} className="mt-10 grid gap-8 lg:grid-cols-[500px_1fr]">
      <section>
        <label className="block cursor-pointer overflow-hidden rounded-[28px] border border-purple-100 bg-white p-5 shadow-sm">
          <div className="grid h-[500px] place-items-center rounded-[22px] bg-gradient-to-br from-blue-950 via-sky-500 to-fuchsia-300 text-7xl font-black text-white">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPreview} alt="" className="h-full w-full rounded-[22px] object-cover" />
            ) : (
              <div className="grid gap-4 text-center">
                <ImagePlus className="mx-auto h-14 w-14" />
                <span>AI</span>
              </div>
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
          <p className="mt-4 text-center font-bold text-purple-700">イベント画像をアップロード</p>
        </label>
      </section>

      <section className="grid gap-5 rounded-[28px] border border-purple-100 bg-white/45 p-7 shadow-sm backdrop-blur">
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          イベントは承認待ちとして保存されます。公開するには管理者の承認が必要です。
        </div>

        <input
          className="w-full bg-transparent text-5xl font-black tracking-tight text-purple-700 outline-none placeholder:text-purple-300 md:text-6xl"
          name="title"
          placeholder="イベント名"
          defaultValue={event?.title || ""}
          required
        />

        <div className="grid gap-4 rounded-[20px] bg-white/70 p-4 md:grid-cols-[110px_1fr_160px]">
          <div className="grid gap-3 font-bold text-purple-600">
            <span>開始</span>
            <span>終了</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" name="start_date" type="date" defaultValue={datePart(event?.starts_at)} required />
            <input className="input" name="start_time" type="time" defaultValue={timePart(event?.starts_at)} />
            <input className="input" name="end_date" type="date" defaultValue={datePart(event?.ends_at)} />
            <input className="input" name="end_time" type="time" defaultValue={timePart(event?.ends_at)} />
          </div>
          <div className="rounded-[18px] bg-purple-50 p-4 font-bold text-purple-700">
            GMT+09:00
            <br />
            Asia/Tokyo
          </div>
        </div>

        <input className="input" name="location" placeholder="会場または住所" defaultValue={event?.location || ""} />
        <input className="input" name="online_url" placeholder="オンラインURL" defaultValue={event?.online_url || ""} />
        <textarea className="input min-h-32" name="description" placeholder="説明を追加" defaultValue={event?.description || ""} />

        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" name="organizer_name" placeholder="主催者名" defaultValue={event?.organizer_name || "Global AI Industry Alliance"} />
          <select className="input" name="category" defaultValue={event?.category || "AI"}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select className="input" name="region" defaultValue={event?.region || "Tokyo"}>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <input className="input" name="ticket_price" type="number" min="0" placeholder="チケット価格" defaultValue={event?.ticket_price || 0} />
          <select className="input" name="approval_mode" defaultValue={event?.approval_mode || "manual"}>
            <option value="manual">参加者を手動承認</option>
            <option value="auto">参加者を自動承認</option>
          </select>
          <input className="input" name="capacity" type="number" min="0" placeholder="定員" defaultValue={event?.capacity || ""} />
        </div>

        <fieldset className="grid gap-3">
          <legend className="text-sm font-black text-slate-700">テーマカラー</legend>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {themeColors.map((color) => {
              const checked = selectedTheme === color.value;

              return (
                <label
                  key={color.value}
                  className={`cursor-pointer rounded-[18px] border bg-white/75 p-3 shadow-sm transition ${
                    checked ? "border-purple-500 ring-2 ring-purple-200" : "border-slate-200 hover:border-purple-200"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="theme_color"
                    value={color.value}
                    checked={checked}
                    onChange={() => setSelectedTheme(color.value)}
                  />
                  <span className={`grid h-14 place-items-center rounded-[14px] bg-gradient-to-br ${color.swatch} text-white shadow-lg`}>
                    {checked && <Check size={22} />}
                  </span>
                  <span className="mt-2 block text-xs font-black text-slate-700">{color.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <button disabled={loading} className="btn btn-primary w-full text-lg" type="submit">
          {loading ? <span className="loading-dots" aria-label="保存中" /> : isEditing ? "イベントを更新して承認申請" : "イベント作成"}
        </button>
      </section>
    </form>
  );
}
