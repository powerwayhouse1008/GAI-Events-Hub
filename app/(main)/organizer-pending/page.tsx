import Link from "next/link";
import { getProfile } from "@/lib/auth";

export default async function OrganizerPendingPage() {
  const profile = await getProfile();

  return (
    <main className="grid min-h-screen place-items-center bg-gai-pink p-6">
      <section className="max-w-xl rounded-[32px] bg-white p-8 text-center shadow-xl">
        <h1 className="text-4xl font-black">承認待ちです</h1>
        <p className="mt-4 leading-8 text-slate-600">
          主催者アカウントは管理者の承認待ちです。承認後、イベント作成ページを利用できます。
        </p>
        <p className="mt-4 text-sm text-slate-400">Current status: {profile?.organizer_status || "none"}</p>
        <Link href="/events" className="btn btn-primary mt-8">イベントページへ</Link>
      </section>
    </main>
  );
}
