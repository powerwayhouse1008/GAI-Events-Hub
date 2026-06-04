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
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4">
        <Link href="/events" className="flex items-center gap-3 font-black">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-sky-400 text-white">
            AI
          </div>
          <span className="hidden sm:block">Global AI Industry Alliance</span>
        </Link>

        <nav className="hidden items-center gap-6 font-bold text-slate-700 md:flex">
          <Link href="/events" className="flex items-center gap-2 hover:text-purple-700">
            <Ticket size={18} /> イベント
          </Link>
          <Link href="/calendar" className="flex items-center gap-2 hover:text-purple-700">
            <Calendar size={18} /> カレンダー
          </Link>
          <Link href="/search" className="flex items-center gap-2 hover:text-purple-700">
            <Search size={18} /> さがす
          </Link>
          {canCreateEvent && (
            <Link
              href="/events/new"
              className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-purple-700 hover:bg-purple-200"
            >
              <Plus size={18} /> イベント作成
            </Link>
          )}
          {profile?.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-2 hover:text-purple-700">
              <ShieldCheck size={18} /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden font-bold text-slate-700 lg:block">
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
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-100"
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
