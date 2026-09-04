import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Calendar, Plus, Search, ShieldCheck, Ticket, UserRound } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export async function Nav() {
  noStore();

  const profile = await getProfile();
  const canCreateEvent = Boolean(profile);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-950/[0.03] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/events" className="flex min-w-0 items-center gap-3 font-black text-slate-950">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm text-white shadow-lg shadow-slate-950/15">
            AI
          </div>
          <span className="hidden truncate sm:block">Global AI Industry Alliance</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 text-sm font-bold text-slate-700 md:flex">
          <Link href="/events" className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-white hover:text-slate-950 hover:shadow-sm">
            <Ticket size={17} /> イベント
          </Link>
          <Link href="/calendar" className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-white hover:text-slate-950 hover:shadow-sm">
            <Calendar size={17} /> カレンダー
          </Link>
          <Link href="/search" className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-white hover:text-slate-950 hover:shadow-sm">
            <Search size={17} /> さがす
          </Link>
          {canCreateEvent && (
            <Link href="/events/new" className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-white shadow-sm hover:bg-slate-800">
              <Plus size={17} /> イベント作成
            </Link>
          )}
          {profile?.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-white hover:text-slate-950 hover:shadow-sm">
              <ShieldCheck size={17} /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 lg:block">
            {new Date().toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Tokyo"
            })}{" "}
            GMT+9
          </span>

          {profile ? (
            <>
              <Link
                href="/me"
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm"
                title={profile.display_name || profile.email || "Account"}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound size={20} />
                )}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              ログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
