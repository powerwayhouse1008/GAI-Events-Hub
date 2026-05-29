import { requireOrganizer } from "@/lib/auth";
import { EventForm } from "./EventForm";

export default async function NewEventPage() {
  await requireOrganizer();

  return (
    <main className="min-h-screen bg-gai-pink">
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <h1 className="text-5xl font-black tracking-tight">AIイベントを作成</h1>
        <p className="mt-3 text-slate-600">AI業界のイベント情報を登録して、コミュニティに共有しましょう。</p>
        <EventForm />
      </div>
    </main>
  );
}
