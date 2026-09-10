"use client";

import { Bold, Check, Highlighter, ImagePlus, Italic, Palette, Underline, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { eventCategories, eventRegions } from "@/lib/events";
import { languages, type LanguageCode } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { prepareEventTranslations } from "@/lib/translation/client";
import type { Event } from "@/lib/types";
import { generateEventCover, saveEvent, saveEventTranslations } from "./eventActions";

type EventFormProps = {
  event?: Event;
};

const themeColors = [
  { label: "AI Purple", value: "purple", swatch: "from-violet-500 to-fuchsia-500" },
  { label: "Cyber Blue", value: "blue", swatch: "from-blue-500 to-cyan-400" },
  { label: "Startup Green", value: "green", swatch: "from-emerald-400 to-teal-500" },
  { label: "Business Amber", value: "amber", swatch: "from-amber-400 to-orange-500" },
  { label: "Neon Rose", value: "rose", swatch: "from-rose-500 to-pink-500" }
];

function datePart(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function timePart(value?: string | null) {
  return value ? value.slice(11, 16) : "";
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

function isSelectionInside(element: HTMLElement, range: Range) {
  return element.contains(range.commonAncestorContainer);
}

export function EventForm({ event }: EventFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const { language } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>(event?.cover_url || "");
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState<string | null>(event?.cover_url || null);
  const [selectedTheme, setSelectedTheme] = useState(event?.theme_color || "purple");
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(event?.source_language || language);
  const [translationStatus, setTranslationStatus] = useState<string | null>(null);
  const isEditing = Boolean(event);
  const minStartDate = getTokyoDateInputValue();

  function saveEditorSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (isSelectionInside(editor, range)) {
      selectionRef.current = range.cloneRange();
    }
  }

  function restoreEditorSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const range = selectionRef.current;
    if (!editor || !selection) return;

    editor.focus();
    selection.removeAllRanges();
    if (range && isSelectionInside(editor, range)) {
      selection.addRange(range);
      return;
    }

    const nextRange = document.createRange();
    nextRange.selectNodeContents(editor);
    nextRange.collapse(false);
    selection.addRange(nextRange);
  }

  function runEditorCommand(command: string, value?: string) {
    restoreEditorSelection();
    document.execCommand(command, false, value);
    saveEditorSelection();
  }

  async function createAiCover() {
    if (!formRef.current) return;
    setGeneratingCover(true);

    const formData = new FormData(formRef.current);
    const result = await generateEventCover({
      title: String(formData.get("title") || ""),
      description: editorRef.current?.innerText || "",
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
    setTranslationStatus(null);

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

    const htmlDescription = editorRef.current?.innerHTML || "";
    const selectedSourceLanguage = String(formData.get("source_language") || sourceLanguage) as LanguageCode;
    const result = await saveEvent({
      eventId: event?.id,
      title: String(formData.get("title") || ""),
      description: htmlDescription,
      organizerName: String(formData.get("organizer_name") || ""),
      category: String(formData.get("category") || "AI"),
      region: String(formData.get("region") || "Online"),
      location: String(formData.get("location") || ""),
      onlineUrl: String(formData.get("online_url") || ""),
      coverUrl,
      themeColor: String(formData.get("theme_color") || selectedTheme || "purple"),
      sourceLanguage: selectedSourceLanguage,
      startsAt,
      endsAt,
      capacity: Number(formData.get("capacity") || 0) || null,
      ticketPrice: Number(formData.get("ticket_price") || 0),
      approvalMode: String(formData.get("approval_mode") || "manual"),
      featured: event?.featured || false
    });

    if (result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }

    const eventId = result.id;
    if (!eventId) {
      alert("Event was saved, but no event ID was returned.");
      setLoading(false);
      return;
    }

    try {
      setTranslationStatus("鄙ｻ險ｳ繝｢繝・Ν繧呈ｺ門ｙ縺励※縺・∪縺・..");
      const translations = await prepareEventTranslations(
        {
          title: String(formData.get("title") || ""),
          description: htmlDescription,
          location: String(formData.get("location") || ""),
          sourceLanguage: selectedSourceLanguage
        },
        (progress) => setTranslationStatus(progress.message)
      );

      setTranslationStatus("鄙ｻ險ｳ繧剃ｿ晏ｭ倥＠縺ｦ縺・∪縺・..");
      const translationResult = await saveEventTranslations({
        eventId,
        sourceLanguage: selectedSourceLanguage,
        ...translations
      });

      if (translationResult.error) {
        alert(translationResult.error);
      }
    } catch (error) {
      console.error("Event translation failed", error);
      alert("繧､繝吶Φ繝医・菫晏ｭ倥＆繧後∪縺励◆縺後∬・蜍慕ｿｻ險ｳ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ょｾ後〒蜀咲ｿｻ險ｳ縺ｧ縺阪∪縺吶・");
    }

    router.push(`/events/${eventId}`);
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
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setGeneratedCoverUrl(null);
                setCoverPreview(URL.createObjectURL(file));
              }
            }}
          />
          <p className="mt-4 text-center font-bold text-purple-700">イベント画像をアップロード</p>
        </label>
        <button className="btn mt-4 w-full border border-purple-200 bg-white text-purple-700 hover:bg-purple-50" disabled={loading || generatingCover} type="button" onClick={createAiCover}>
          {generatingCover ? (
            <span className="loading-dots" aria-label="画像を生成中" />
          ) : (
            <>
              <WandSparkles size={20} />
              テーマに合わせてAI画像を生成
            </>
          )}
        </button>
      </section>

      <section className="grid gap-5 rounded-[28px] border border-purple-100 bg-white/45 p-7 shadow-sm backdrop-blur">
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          イベントは承認待ちとして保存されます。公開するには管理者による承認が必要です。
        </div>

        <label className="grid gap-2 text-sm font-black text-slate-700">
          <span>Source language</span>
          <select className="input" name="source_language" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value as LanguageCode)}>
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <textarea
          className="min-h-32 w-full resize-none overflow-hidden whitespace-pre-wrap bg-transparent text-5xl font-black tracking-tight text-purple-700 outline-none placeholder:text-purple-300 md:text-6xl"
          name="title"
          placeholder="イベント名"
          defaultValue={event?.title || ""}
          onInput={(event) => autoGrowTextarea(event.currentTarget)}
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
          onInput={(event) => autoGrowTextarea(event.currentTarget)}
          ref={(element) => {
            if (element) autoGrowTextarea(element);
          }}
        />
        <input className="input" name="online_url" placeholder="オンラインURL" defaultValue={event?.online_url || ""} />

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700" onChange={(event) => runEditorCommand("fontName", event.target.value)} onMouseDown={saveEditorSelection} defaultValue="">
              <option value="" disabled>
                フォント
              </option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times</option>
              <option value="Courier New">Courier</option>
              <option value="Yu Gothic">Yu Gothic</option>
            </select>
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700" onChange={(event) => runEditorCommand("fontSize", event.target.value)} onMouseDown={saveEditorSelection} defaultValue="">
              <option value="" disabled>
                サイズ
              </option>
              <option value="2">小</option>
              <option value="3">標準</option>
              <option value="5">大</option>
              <option value="7">特大</option>
            </select>
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100" onMouseDown={(event) => event.preventDefault()} onClick={() => runEditorCommand("bold")} type="button" aria-label="太字">
              <Bold size={17} />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100" onMouseDown={(event) => event.preventDefault()} onClick={() => runEditorCommand("italic")} type="button" aria-label="斜体">
              <Italic size={17} />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100" onMouseDown={(event) => event.preventDefault()} onClick={() => runEditorCommand("underline")} type="button" aria-label="下線">
              <Underline size={17} />
            </button>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700" onMouseDown={saveEditorSelection}>
              <Palette size={17} />
              <input className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0" type="color" onInput={(event) => runEditorCommand("foreColor", event.currentTarget.value)} aria-label="文字色" />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700" onMouseDown={saveEditorSelection}>
              <Highlighter size={17} />
              <input className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0" type="color" onInput={(event) => runEditorCommand("hiliteColor", event.currentTarget.value)} aria-label="背景色" />
            </label>
          </div>
          <div
            ref={editorRef}
            className="min-h-40 w-full cursor-text bg-white px-4 py-3 leading-7 text-slate-900 outline-none focus:ring-4 focus:ring-slate-200/70"
            contentEditable
            dangerouslySetInnerHTML={{ __html: event?.description || "" }}
            onBlur={saveEditorSelection}
            onClick={saveEditorSelection}
            onFocus={saveEditorSelection}
            onInput={saveEditorSelection}
            onKeyUp={saveEditorSelection}
            onMouseUp={saveEditorSelection}
            role="textbox"
            aria-label="イベント説明"
            spellCheck
            suppressContentEditableWarning
            tabIndex={0}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" name="organizer_name" placeholder="主催者名" defaultValue={event?.organizer_name || "Global AI Industry Alliance"} />
          <select className="input" name="category" defaultValue={event?.category || "AI"}>
            {eventCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select className="input" name="region" defaultValue={event?.region || "Tokyo"}>
            {eventRegions.map((region) => (
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
                  <input className="sr-only" type="radio" name="theme_color" value={color.value} checked={checked} onChange={() => setSelectedTheme(color.value)} />
                  <span className={`grid h-14 place-items-center rounded-[14px] bg-gradient-to-br ${color.swatch} text-white shadow-lg`}>
                    {checked && <Check size={22} />}
                  </span>
                  <span className="mt-2 block text-xs font-black text-slate-700">{color.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {translationStatus && <p className="text-center text-sm font-bold text-purple-700">{translationStatus}</p>}

        <button disabled={loading || generatingCover} className="btn btn-primary w-full text-lg" type="submit">
          {loading ? <span className="loading-dots" aria-label="保存中" /> : isEditing ? "イベントを更新" : "イベント作成"}
        </button>
      </section>
    </form>
  );
}
