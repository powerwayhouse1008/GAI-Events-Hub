"use client";

import { Camera, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || "");

  async function submit(formData: FormData) {
    setSaving(true);
    setMessage("");

    let nextAvatarUrl = avatarUrl || null;
    const avatar = formData.get("avatar") as File | null;

    if (avatar && avatar.size > 0) {
      const safeName = avatar.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${profile.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(path, avatar, {
        upsert: false
      });

      if (uploadError) {
        setMessage(`画像をアップロードできませんでした: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage.from("profile-avatars").getPublicUrl(path);
      nextAvatarUrl = data.publicUrl;
      setAvatarUrl(nextAvatarUrl);
      setAvatarPreview(nextAvatarUrl);
    }

    const displayName = String(formData.get("display_name") || "").trim();
    const companyName = String(formData.get("company_name") || "").trim();
    const jobTitle = String(formData.get("job_title") || "").trim();
    const phoneNumber = String(formData.get("phone_number") || "").trim();

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        company_name: companyName || null,
        job_title: jobTitle || null,
        phone_number: phoneNumber || null,
        avatar_url: nextAvatarUrl
      })
      .eq("id", profile.id);

    if (error) {
      setMessage(`プロフィールを保存できませんでした: ${error.message}`);
      setSaving(false);
      return;
    }

    await supabase.auth.updateUser({
      data: {
        display_name: displayName || null,
        company_name: companyName || null,
        avatar_url: nextAvatarUrl
      }
    });

    setMessage("プロフィールを保存しました。");
    setSaving(false);
    router.refresh();
  }

  return (
    <section className="card mt-8 p-7">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black">プロフィール</h2>
          <p className="mt-2 text-slate-500">Gmail、名前、会社、職務、電話番号、プロフィール画像を確認・編集できます。</p>
        </div>
        <div className="rounded-full bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700">
          Role: {profile.role}
        </div>
      </div>

      <form action={submit} className="mt-7 grid gap-7 lg:grid-cols-[240px_1fr]">
        <div className="grid content-start gap-4">
          <label className="group relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-[28px] border border-purple-100 bg-slate-100">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-20 w-20 text-slate-400" />
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-slate-950/70 px-4 py-3 text-sm font-black text-white">
              <Camera size={18} /> 画像を変更
            </span>
            <input
              className="hidden"
              type="file"
              name="avatar"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setAvatarPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          <p className="break-all rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">{profile.email || "-"}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="label md:col-span-2">
            Gmail
            <input className="input mt-2 bg-slate-50 text-slate-500" value={profile.email || ""} readOnly />
          </label>

          <label className="label">
            名前
            <input className="input mt-2" name="display_name" defaultValue={profile.display_name || ""} />
          </label>

          <label className="label">
            会社
            <input className="input mt-2" name="company_name" defaultValue={profile.company_name || ""} />
          </label>

          <label className="label">
            職務・役職
            <input className="input mt-2" name="job_title" defaultValue={profile.job_title || ""} />
          </label>

          <label className="label">
            電話番号
            <input className="input mt-2" name="phone_number" type="tel" defaultValue={profile.phone_number || ""} />
          </label>

          <div className="md:col-span-2">
            <button disabled={saving} className="btn btn-primary flex w-full items-center justify-center gap-2" type="submit">
              <Save size={18} />
              {saving ? "保存中..." : "プロフィールを保存"}
            </button>
            {message && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">{message}</p>}
          </div>
        </div>
      </form>
    </section>
  );
}
