import Link from "next/link";
import { getProfile } from "@/lib/auth";

const statusLabel: Record<string, string> = {
  none: "未申請",
  pending: "承認待ち",
  approved: "承認済み",
  rejected: "却下"
};

export default async function OrganizerPendingPage() {
  const profile = await getProfile();
  const status = profile?.organizer_status || "none";

  return (
    <main className="grid min-h-screen place-items-center bg-gai-pink p-6">
      <section className="max-w-xl rounded-[32px] bg-white p-8 text-center shadow-xl">
        <h1 className="text-4xl font-black">承認待ちです</h1>
        <p className="mt-4 leading-8 text-slate-600">
          主催者アカウントは管理者の承認待ちです。承認後、イベント作成ページを利用できます。
        </p>
        <p className="mt-4 text-sm text-slate-400">
          現在の状態: {statusLabel[status] || status}
        </p>
        {status === "none" && (
          <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">
            申請情報がまだ同期されていません。ページを再読み込みするか、管理者に連絡してください。
          </p>
        )}
        <Link href="/events" className="btn btn-primary mt-8">イベントページへ</Link>
      </section>
    </main>
  );
}
