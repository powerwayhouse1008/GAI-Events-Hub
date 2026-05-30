import { requireOrganizer } from "@/lib/auth";
import { EventForm } from "./EventForm";

export default async function NewEventPage() {
  await requireOrganizer();

  return (
    <main className="min-h-screen bg-[#f8ecfb]">
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-bold text-purple-700">
          <div className="flex items-center gap-4">
            <span>イベント</span>
            <span>カレンダー</span>
            <span>さがす</span>
          </div>
          <span>公開前に管理者承認が必要です</span>
        </div>
        <EventForm />
      </div>
    </main>
  );
}
