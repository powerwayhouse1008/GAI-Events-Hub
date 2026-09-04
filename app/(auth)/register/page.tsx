import { Suspense } from "react";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen bg-slate-50 p-4 sm:p-6 lg:grid-cols-[1fr_480px] lg:p-10">
      <section className="hidden flex-col justify-between rounded-3xl bg-slate-950 p-10 text-white lg:flex">
        <Link href="/events" className="flex items-center gap-3 font-black">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-950">AI</span>
          Global AI Industry Alliance
        </Link>
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase text-cyan-200">Create Account</p>
          <h1 className="mt-5 text-6xl font-black leading-tight">Start joining and hosting better AI events.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            登録したすべてのアカウントでイベント参加とイベント作成を利用できます。
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm font-bold text-slate-300">
          <span className="rounded-xl border border-white/10 bg-white/5 p-4">Member</span>
          <span className="rounded-xl border border-white/10 bg-white/5 p-4">Organizer</span>
          <span className="rounded-xl border border-white/10 bg-white/5 p-4">Global</span>
        </div>
      </section>

      <section className="my-auto w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/[0.06] sm:p-8">
        <div className="lg:hidden">
          <Link href="/events" className="flex items-center gap-3 font-black text-slate-950">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">AI</span>
            Global AI Industry Alliance
          </Link>
        </div>
        <h2 className="mt-8 text-3xl font-black text-slate-950 lg:mt-0">新規登録</h2>
        <p className="mt-2 text-slate-500">メンバーまたは主催者としてアカウントを作成できます。</p>
        <Suspense fallback={<div className="mt-6 text-center text-slate-500">読み込み中...</div>}>
          <RegisterForm />
        </Suspense>
        <p className="mt-6 text-center text-slate-600">
          すでにアカウントがありますか{" "}
          <Link href="/login" className="font-black text-slate-950 underline decoration-cyan-300 decoration-2 underline-offset-4">
            ログイン
          </Link>
        </p>
      </section>
    </main>
  );
}
