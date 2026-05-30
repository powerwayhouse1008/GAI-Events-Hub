import { Users } from "lucide-react";

interface ParticipantProfile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  company_name: string | null;
}

interface Participant {
  profiles: ParticipantProfile | null;
  status: string;
  created_at: string;
  message?: string | null;
}

interface ParticipantsListProps {
  participants: Participant[];
  totalCapacity: number | null;
}

const statusLabel: Record<string, string> = {
  approved: "承認済み",
  pending: "承認待ち",
  rejected: "却下"
};

function getAvatarColor(email: string | null) {
  if (!email) return "bg-gray-400";
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-teal-500"
  ];
  const hash = email.charCodeAt(0) + email.charCodeAt(email.length - 1);
  return colors[hash % colors.length];
}

function getInitials(name: string | null, email: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) return email.split("@")[0].slice(0, 2).toUpperCase();
  return "?";
}

function ParticipantAvatar({ participant }: { participant: Participant }) {
  const profile = participant.profiles;
  const name = profile?.display_name || profile?.email || "Unknown";

  return (
    <div className="group relative cursor-pointer">
      <div
        className={`${getAvatarColor(
          profile?.email || null
        )} flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-transform hover:scale-110`}
        title={name}
      >
        {getInitials(profile?.display_name || null, profile?.email || null)}
      </div>
      <div className="invisible absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-slate-900 p-3 text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
        <p className="font-semibold">{name}</p>
        {profile?.company_name && <p className="text-xs text-slate-300">{profile.company_name}</p>}
        {profile?.email && <p className="text-xs text-slate-300">{profile.email}</p>}
        {participant.message && <p className="mt-2 text-xs text-slate-200">{participant.message}</p>}
        <p className="mt-2 text-xs text-slate-400">
          {new Date(participant.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
        </p>
        <span className="mt-2 inline-block rounded bg-slate-700 px-2 py-0.5 text-xs font-semibold">
          {statusLabel[participant.status] || participant.status}
        </span>
      </div>
    </div>
  );
}

export function ParticipantsList({ participants, totalCapacity }: ParticipantsListProps) {
  const approvedParticipants = participants.filter((participant) => participant.status === "approved");
  const pendingParticipants = participants.filter((participant) => participant.status === "pending");

  if (participants.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-slate-500">参加者はまだいません。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <h3 className="text-lg font-bold text-slate-900">参加者統計</h3>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">承認済み</p>
            <p className="mt-1 text-2xl font-black text-blue-600">{approvedParticipants.length}</p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">承認待ち</p>
            <p className="mt-1 text-2xl font-black text-yellow-600">{pendingParticipants.length}</p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">合計</p>
            <p className="mt-1 text-2xl font-black text-slate-600">{participants.length}</p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">定員</p>
            <p className="mt-1 text-2xl font-black text-purple-600">{totalCapacity || "無制限"}</p>
          </div>
        </div>
      </div>

      {approvedParticipants.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-slate-500">
              承認済み ({approvedParticipants.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {approvedParticipants.map((participant, index) => (
              <ParticipantAvatar key={`${participant.created_at}-${index}`} participant={participant} />
            ))}
          </div>
        </section>
      )}

      {pendingParticipants.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-semibold text-slate-500">
              承認待ち ({pendingParticipants.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-3 opacity-80">
            {pendingParticipants.map((participant, index) => (
              <ParticipantAvatar key={`${participant.created_at}-${index}`} participant={participant} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
