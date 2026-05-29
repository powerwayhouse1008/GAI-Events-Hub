"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function EventForm() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string>("");

  async function submit(formData: FormData) {
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    let coverUrl: string | null = null;
    const file = formData.get("cover") as File | null;

    if (file && file.size > 0) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("event-covers").upload(path, file);
      if (!uploadError) {
        const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
        coverUrl = data.publicUrl;
      }
    }

    const startsAt = `${formData.get("start_date")}T${formData.get("start_time") || "00:00"}:00+09:00`;
    const endDate = formData.get("end_date") || formData.get("start_date");
    const endsAt = `${endDate}T${formData.get("end_time") || "00:00"}:00+09:00`;

    const { error } = await supabase.from("events").insert({
      title: formData.get("title"),
      description: formData.get("description"),
      organizer_id: user.id,
      organizer_name: formData.get("organizer_name"),
      category: formData.get("category"),
      region: formData.get("region"),
      location: formData.get("location"),
      online_url: formData.get("online_url"),
      cover_url: coverUrl,
      starts_at: startsAt,
      ends_at: endsAt,
      capacity: Number(formData.get("capacity") || 0) || null,
      ticket_price: Number(formData.get("ticket_price") || 0),
      approval_mode: formData.get("approval_mode"),
      status: "pending",
      featured: false
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/organizer-dashboard");
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
          <p className="mt-4 text-center font-bold text-purple-700">画像を選択 / Drag & Drop</p>
        </label>
      </section>

      <section className="grid gap-5 rounded-3xl border border-purple-100 bg-white/70 p-7 shadow-sm backdrop-blur">
        <div className="flex justify-between gap-4">
          <select name="calendar_type" className="input max-w-[220px]"><option>個人カレンダー</option><option>Global AI Industry Alliance</option></select>
          <select name="visibility" className="input max-w-[180px]"><option>公開</option><option>非公開</option></select>
        </div>

        <input className="w-full bg-transparent text-6xl font-black tracking-tight text-purple-700 outline-none placeholder:text-purple-300" name="title" placeholder="イベント名" required />

        <div className="grid gap-4 rounded-2xl bg-white/70 p-4 md:grid-cols-[110px_1fr_160px]">
          <div className="grid gap-3 font-bold text-purple-600"><span>● 開始</span><span>○ 終了</span></div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" name="start_date" type="date" required />
            <input className="input" name="start_time" type="time" />
            <input className="input" name="end_date" type="date" />
            <input className="input" name="end_time" type="time" />
          </div>
          <div className="rounded-2xl bg-purple-50 p-4 font-bold text-purple-700">🌐<br />GMT+09:00<br />Asia/Tokyo</div>
        </div>

        <input className="input" name="location" placeholder="📍 イベント会場名 / 場所" />
        <input className="input" name="online_url" placeholder="🔗 オンラインリンク / Zoom / YouTube" />
        <textarea className="input min-h-32" name="description" placeholder="説明を追加" />

        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" name="organizer_name" placeholder="主催者名" />
          <select className="input" name="category" defaultValue="AI">
            {["AI", "Tech", "Startup", "Developer", "Seminar", "Networking", "Hackathon", "Web3", "Robotics"].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select className="input" name="region" defaultValue="Tokyo">
            {["Tokyo", "Osaka", "Kyoto", "Singapore", "Seoul", "Taipei", "Hong Kong", "Bangkok", "Online"].map((x) => <option key={x}>{x}</option>)}
          </select>
          <input className="input" name="ticket_price" type="number" min="0" placeholder="チケット価格 / 0 = 無料" />
          <select className="input" name="approval_mode" defaultValue="manual"><option value="manual">承認制 ON</option><option value="auto">自動承認</option></select>
          <input className="input" name="capacity" type="number" min="0" placeholder="定員 / 無制限" />
        </div>

        <button disabled={loading} className="btn btn-primary w-full text-lg" type="submit">イベント作成</button>
      </section>
    </form>
  );
}
