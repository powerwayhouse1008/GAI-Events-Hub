import { Users } from "lucide-react";

interface Participant {
  profiles: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
    company_name: string | null;
  };
  status: string;
  created_at: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  totalCapacity: number | null;
}

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
    "bg-teal-500",
  ];
  const hash = email.charCodeAt(0) + email.charCodeAt(email.length - 1);
  return colors[hash % colors.length];
}

function getInitials(name: string | null, email: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email.split("@")[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

export function ParticipantsList({ participants, totalCapacity }: ParticipantsListProps) {
  const approvedParticipants = participants.filter((p) => p.status === "approved");

  if (participants.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p className="text-slate-500">参加者がまだいません</p>
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
            <p className="mt-1 text-2xl font-black text-blue-600">
              {approvedParticipants.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">申請中</p>
            <p className="mt-1 text-2xl font-black text-yellow-600">
              {participants.filter((p) => p.status === "pending").length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">合計</p>
            <p className="mt-1 text-2xl font-black text-slate-600">
              {participants.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">収容可能</p>
            <p className="mt-1 text-2xl font-black text-purple-600">
              {totalCapacity || "∞"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="mb-4 font-bold text-slate-900">参加者一覧</h4>
        {participants.length > 0 && (
          <div>
            {/* 承認済み参加者 */}
            {approvedParticipants.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-semibold text-slate-500">
                    承認済み（{approvedParticipants.length}）
                  </span>
                </div>
                <div className="mb-6 flex flex-wrap gap-3">
                  {approvedParticipants.map((participant, idx) => (
                    <div
                      key={idx}
                      className="group relative cursor-pointer"
                      title={
                        (participant.profiles.display_name ||
                        participant.profiles.email) || undefined
                      }
                    >
                      {/* Avatar Icon */}
                      <div
                        className={`${getAvatarColor(
                          participant.profiles.email
                        )} flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm shadow-md transition-transform hover:scale-110`}
                      >
                        {getInitials(
                          participant.profiles.display_name,
                          participant.profiles.email
                        )}
                      </div>

                      {/* Tooltip */}
                      <div className="invisible absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 transform rounded-lg bg-slate-900 p-3 text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                        <p className="font-semibold">
                          {participant.profiles.display_name ||
                            participant.profiles.email}
                        </p>
                        {participant.profiles.company_name && (
                          <p className="text-xs text-slate-300">
                            {participant.profiles.company_name}
                          </p>
                        )}
                        {participant.profiles.email && (
                          <p className="text-xs text-slate-300">
                            {participant.profiles.email}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(participant.created_at).toLocaleString(
                            "ja-JP",
                            { timeZone: "Asia/Tokyo" }
                          )}
                        </p>
                        <div className="mt-1 inline-block rounded bg-green-600 px-2 py-0.5 text-xs font-semibold">
                          承認済み
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 申請中の参加者 */}
            {participants.filter((p) => p.status === "pending").length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs font-semibold text-slate-500">
                    申請中（
                    {participants.filter((p) => p.status === "pending").length}
                    ）
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {participants
                    .filter((p) => p.status === "pending")
                    .map((participant, idx) => (
                      <div
                        key={idx}
                        className="group relative cursor-pointer opacity-75"
                        title={
                          (participant.profiles.display_name ||
                          participant.profiles.email) || undefined
                        }
                      >
                        {/* Avatar Icon with pending badge */}
                        <div className="relative">
                          <div
                            className={`${getAvatarColor(
                              participant.profiles.email
                            )} flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm shadow-md transition-transform hover:scale-110`}
                          >
                            {getInitials(
                              participant.profiles.display_name,
                              participant.profiles.email
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 rounded-full bg-yellow-400 p-1">
                            <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                          </div>
                        </div>

                        {/* Tooltip */}
                        <div className="invisible absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 transform rounded-lg bg-slate-900 p-3 text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100" title={undefined}>
                          <p className="font-semibold">
                            {participant.profiles.display_name ||
                              participant.profiles.email}
                          </p>
                          {participant.profiles.company_name && (
                            <p className="text-xs text-slate-300">
                              {participant.profiles.company_name}
                            </p>
                          )}
                          {participant.profiles.email && (
                            <p className="text-xs text-slate-300">
                              {participant.profiles.email}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(participant.created_at).toLocaleString(
                              "ja-JP",
                              { timeZone: "Asia/Tokyo" }
                            )}
                          </p>
                          <div className="mt-1 inline-block rounded bg-yellow-600 px-2 py-0.5 text-xs font-semibold">
                            申請中
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
