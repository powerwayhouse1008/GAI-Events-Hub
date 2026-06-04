import { Suspense } from "react";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top_left,rgba(154,78,186,.22),transparent_34%),linear-gradient(135deg,#fbf7ff,#f7ecfb_55%,#ffffff)] p-6 lg:grid-cols-[1fr_500px] lg:p-16">
      <section className="flex max-w-3xl flex-col justify-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-purple-500 to-sky-400 text-3xl font-black text-white shadow-xl">
          AI
        </div>
        <h1 className="mt-8 text-5xl font-black tracking-tight md:text-7xl">アカウント作成</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          登録したすべてのアカウントでイベント参加とイベント作成を利用できます。
        </p>
      </section>

      <section className="my-auto rounded-[32px] border border-purple-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="text-3xl font-black">新規登録</h2>
        <Suspense fallback={<div className="mt-6 text-center text-slate-500">読み込み中...</div>}>
          <RegisterForm />
        </Suspense>
        <p className="mt-6 text-center text-slate-600">
          すでにアカウントがありますか{" "}
          <Link href="/login" className="font-black text-purple-700">
            ログイン
          </Link>
        </p>
      </section>
    </main>
  );
}
