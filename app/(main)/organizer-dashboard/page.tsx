import Link from "next/link";
import { requireOrganizer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { approveRegistration, rejectRegistration } from "./registrationActions";
import type { Event } from "@/lib/types";

export default async function OrganizerDashboard() {
  const profile = await requireOrganizer();
  const supabase = await createClient();

  const query = supabase.from("events").select("*").order("created_at", { ascending: false });
  const { data: events = [] } =
    profile.role === "admin" ? await query : await query.eq("organizer_id", profile.id);

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-5xl font-black tracking-tight">Organizer Dashboard</h1>
        <Link href="/events/new" className="btn btn-primary">Create Event</Link>
      </div>

      <div className="mt-8 grid gap-6">
        {(events as Event[]).map(async (event) => {
          const { data: registrations = [] } = await supabase
            .from("registrations")
            .select("*, profiles(display_name,email)")
            .eq("event_id", event.id)
            .order("created_at", { ascending: false });

          return (
            <section key={event.id} className="card p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black">
                    {event.title} <span className={`status status-${event.status}`}>{event.status}</span>
                  </h2>
                  <p className="mt-2 text-slate-500">
                    {new Date(event.starts_at).toLocaleDateString("ja-JP")}
                  </p>
                  {event.status === "pending" && (
                    <p className="mt-2 text-sm font-bold text-amber-600">
                      Waiting for admin approval before public registration opens.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/events/${event.id}`} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                    Manage
                  </Link>
                  <Link href={`/events/${event.id}/edit`} className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-bold text-white">
                    Edit
                  </Link>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3">Applicant</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(registrations as any[]).map((registration) => (
                      <tr key={registration.id} className="border-b">
                        <td className="p-3">{registration.profiles?.display_name}</td>
                        <td className="p-3">{registration.profiles?.email}</td>
                        <td className="p-3">
                          <span className={`status status-${registration.status}`}>
                            {registration.status}
                          </span>
                        </td>
                        <td className="p-3">{registration.message}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <form action={approveRegistration}>
                              <input type="hidden" name="id" value={registration.id} />
                              <button className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white">
                                Approve
                              </button>
                            </form>
                            <form action={rejectRegistration}>
                              <input type="hidden" name="id" value={registration.id} />
                              <button className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white">
                                Reject
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!registrations?.length && (
                      <tr>
                        <td className="p-3 text-slate-500" colSpan={5}>No applications yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
