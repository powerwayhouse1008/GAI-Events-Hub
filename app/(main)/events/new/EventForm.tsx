"use client";

import { Check, ImagePlus, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/lib/types";
import { generateEventCover, saveEvent } from "./eventActions";

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

function autoGrowTextarea(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

function floorToMinute(date: Date) {
  const nextDate = new Date(date);
  nextDate.setSeconds(0, 0);
  return nextDate;
}

function getTokyoDateInputValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function EventForm({ event }: EventFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>(event?.cover_url || "");
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState<string | null>(event?.cover_url || null);
  const [selectedTheme, setSelectedTheme] = useState(event?.theme_color || "purple");
  const isEditing = Boolean(event);
  const minStartDate = getTokyoDateInputValue();

  async function createAiCover() {
    if (!formRef.current) return;

    setGeneratingCover(true);

    const formData = new FormData(formRef.current);
    const result = await generateEventCover({
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      category: String(formData.get("category") || "AI"),
      region: String(formData.get("region") || "Online"),
      location: String(formData.get("location") || ""),
      themeColor: String(formData.get("theme_color") || selectedTheme || "purple")
    });

    if (result.error) {
      alert(result.error);
      setGeneratingCover(false);
      return;
    }

    if (result.coverUrl) {
      setGeneratedCoverUrl(result.coverUrl);
      setCoverPreview(result.coverUrl);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }

    setGeneratingCover(false);
  }

  async function submit(formData: FormData) {
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const startDate = String(formData.get("start_date") || "");
    const startTime = String(formData.get("start_time") || "00:00");
    const endDate = String(formData.get("end_date") || startDate);
    const endTime = String(formData.get("end_time") || startTime || "00:00");
    const startsAt = `${startDate}T${startTime}:00+09:00`;
    const endsAt = `${endDate}T${endTime}:00+09:00`;
    const startsAtDate = new Date(startsAt);
    const endsAtDate = new Date(endsAt);

    const originalStartMinute = event ? floorToMinute(new Date(event.starts_at)).getTime() : null;
    const startChanged = originalStartMinute !== null && floorToMinute(startsAtDate).getTime() !== originalStartMinute;

    if (Number.isNaN(startsAtDate.getTime()) || ((!event || startChanged) && startsAtDate < floorToMinute(new Date()))) {
      alert("開始日時は現在時刻以降を選択してください。過去のイベントは作成できません。");
      setLoading(false);
      return;
    }

    if (Number.isNaN(endsAtDate.getTime()) || endsAtDate < startsAtDate) {
      alert("終了日時は開始日時以降を選択してください。");
      setLoading(false);
      return;
    }

    let coverUrl: string | null = generatedCoverUrl || event?.cover_url || null;
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
    <form ref={formRef} action={submit} className="mt-10 grid gap-8 lg:grid-cols-[500px_1fr]">
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
            ref={coverInputRef}
            type="file"
            name="cover"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setGeneratedCoverUrl(null);
                setCoverPreview(URL.createObjectURL(file));
              }
            }}
          />
          <p className="mt-4 text-center font-bold text-purple-700">イベント画像をアップロード</p>
        </label>
        <button
          className="btn mt-4 w-full border border-purple-200 bg-white text-purple-700 hover:bg-purple-50"
          disabled={loading || generatingCover}
          type="button"
          onClick={createAiCover}
        >
          {generatingCover ? (
            <span className="loading-dots" aria-label="Dang tao anh" />
          ) : (
            <>
              <WandSparkles size={20} />
              Tao anh AI theo chu de
            </>
          )}
        </button>
      </section>

      <section className="grid gap-5 rounded-[28px] border border-purple-100 bg-white/45 p-7 shadow-sm backdrop-blur">
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          イベントは承認待ちとして保存されます。公開するには管理者の承認が必要です。
        </div>

        <textarea
          className="min-h-32 w-full resize-none overflow-hidden whitespace-pre-wrap bg-transparent text-5xl font-black tracking-tight text-purple-700 outline-none placeholder:text-purple-300 md:text-6xl"
          name="title"
          placeholder="イベント名"
          defaultValue={event?.title || ""}
          onInput={(e) => autoGrowTextarea(e.currentTarget)}
          ref={(element) => {
            if (element) autoGrowTextarea(element);
          }}
          required
        />

        <div className="grid gap-4 rounded-[20px] bg-white/70 p-4 md:grid-cols-[110px_1fr_160px]">
          <div className="grid gap-3 font-bold text-purple-600">
            <span>開始</span>
            <span>終了</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" name="start_date" type="date" min={event ? undefined : minStartDate} defaultValue={datePart(event?.starts_at)} required />
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

        <textarea
          className="input min-h-24 resize-none overflow-hidden whitespace-pre-wrap"
          name="location"
          placeholder="会場または住所"
          defaultValue={event?.location || ""}
          onInput={(e) => autoGrowTextarea(e.currentTarget)}
          ref={(element) => {
            if (element) autoGrowTextarea(element);
          }}
        />
        <input className="input" name="online_url" placeholder="オンラインURL" defaultValue={event?.online_url || ""} />
        <textarea
          className="input min-h-32 resize-none overflow-hidden whitespace-pre-wrap"
          name="description"
          placeholder="説明を追加"
          defaultValue={event?.description || ""}
          onInput={(e) => autoGrowTextarea(e.currentTarget)}
          ref={(element) => {
            if (element) autoGrowTextarea(element);
          }}
        />

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

        <button disabled={loading || generatingCover} className="btn btn-primary w-full text-lg" type="submit">
          {loading ? <span className="loading-dots" aria-label="保存中" /> : isEditing ? "イベントを更新して承認申請" : "イベント作成"}
        </button>
      </section>
    </form>
  );
}
