import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top_left,rgba(154,78,186,.22),transparent_34%),linear-gradient(135deg,#fbf7ff,#f7ecfb_55%,#ffffff)] p-6 lg:grid-cols-[1fr_460px] lg:p-16">
      <section className="flex max-w-3xl flex-col justify-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-purple-500 to-sky-400 text-3xl font-black text-white shadow-xl">
          AI
        </div>
        <h1 className="mt-8 text-5xl font-black tracking-tight md:text-7xl">Global AI Industry Alliance</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          AI業界イベント、コミュニティ、カレンダー、主催者管理をひとつのプラットフォームで。
        </p>
      </section>

      <section className="my-auto rounded-[32px] border border-purple-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="text-3xl font-black">ログイン</h2>
        <p className="mt-2 text-slate-500">Googleまたはメールでログインできます。</p>
        <Suspense fallback={<div className="mt-6 text-center text-slate-500">読み込み中...</div>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-slate-600">
          アカウントがない方{" "}
          <Link href="/register" className="font-black text-purple-700">
            新規登録
          </Link>
        </p>
      </section>
    </main>
  );
}
