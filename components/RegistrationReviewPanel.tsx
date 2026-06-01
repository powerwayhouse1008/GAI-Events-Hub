"use client";

import { useState } from "react";
import { Check, UserCheck, UserRound, X } from "lucide-react";
import { setRegistrationStatus } from "@/app/(main)/organizer-dashboard/registrationActions";
import { LoadingDots } from "@/components/LoadingDots";

type Participant = {
  id: string;
  status: string;
  message?: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
    company_name: string | null;
  } | null;
};

type RegistrationReviewPanelProps = {
  participants: Participant[];
  approvalMode: "manual" | "auto";
  onUpdated: () => Promise<void>;
};

function getName(participant: Participant) {
  return participant.profiles?.display_name || participant.profiles?.email || "名前なし";
}

function ParticipantRow({
  participant,
  showActions,
  onUpdated
}: {
  participant: Participant;
  showActions: boolean;
  onUpdated: () => Promise<void>;
}) {
  const [loadingStatus, setLoadingStatus] = useState<"approved" | "rejected" | null>(null);

  async function update(status: "approved" | "rejected") {
    setLoadingStatus(status);
    try {
      const result = await setRegistrationStatus(participant.id, status);
      if (!result.ok) {
        alert(result.message || "更新できませんでした。");
        return;
      }
      await onUpdated();
    } finally {
      setLoadingStatus(null);
    }
  }

  return (
    <div className="grid gap-3 border-b border-slate-100 py-4 md:grid-cols-[1fr_1fr_120px_auto] md:items-center">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
          {participant.profiles?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={participant.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={18} />
          )}
        </div>
        <div>
          <p className="font-bold text-slate-950">{getName(participant)}</p>
          {participant.profiles?.company_name && (
            <p className="text-xs text-slate-500">{participant.profiles.company_name}</p>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-600">{participant.profiles?.email || "-"}</p>
      <span className={`status status-${participant.status}`}>
        {participant.status === "approved"
          ? "承認済み"
          : participant.status === "pending"
            ? "承認待ち"
            : participant.status === "rejected"
              ? "却下"
              : participant.status}
      </span>
      {showActions ? (
        <div className="flex gap-2">
          <button
            onClick={() => update("approved")}
            disabled={loadingStatus !== null}
            className="inline-flex min-w-20 items-center justify-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-80"
            type="button"
            data-skip-global-loading="true"
          >
            {loadingStatus === "approved" ? <LoadingDots /> : <><Check size={16} /> 承認</>}
          </button>
          <button
            onClick={() => update("rejected")}
            disabled={loadingStatus !== null}
            className="inline-flex min-w-20 items-center justify-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-80"
            type="button"
            data-skip-global-loading="true"
          >
            {loadingStatus === "rejected" ? <LoadingDots /> : <><X size={16} /> 却下</>}
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">{new Date(participant.created_at).toLocaleString("ja-JP")}</p>
      )}
      {participant.message && (
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 md:col-span-4">
          {participant.message}
        </p>
      )}
    </div>
  );
}

export function RegistrationReviewPanel({
  participants,
  approvalMode,
  onUpdated
}: RegistrationReviewPanelProps) {
  const pending = participants.filter((participant) => participant.status === "pending");
  const approved = participants.filter((participant) => participant.status === "approved");
  const rejected = participants.filter((participant) => participant.status === "rejected");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black">承認待ち</h3>
            <p className="mt-1 text-sm text-slate-500">
              {approvalMode === "manual"
                ? "手動承認のイベントです。参加申込を承認または却下できます。"
                : "自動承認のイベントなので、通常ここには申込は残りません。"}
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-700">
            {pending.length} 件
          </span>
        </div>

        <div className="mt-4">
          {pending.length ? (
            pending.map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                showActions={approvalMode === "manual"}
                onUpdated={onUpdated}
              />
            ))
          ) : (
            <div className="rounded-xl bg-amber-50 p-5 text-sm font-bold text-amber-700">
              承認待ちの申込はありません。
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black">参加者一覧</h3>
              <p className="mt-1 text-sm text-slate-500">承認済みの参加者を確認できます。</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
            {approved.length} 名
          </span>
        </div>

        <div className="mt-4">
          {approved.length ? (
            approved.map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                showActions={false}
                onUpdated={onUpdated}
              />
            ))
          ) : (
            <div className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
              参加者はまだいません。
            </div>
          )}
        </div>

        {rejected.length > 0 && (
          <p className="mt-4 text-xs font-bold text-slate-400">却下済み: {rejected.length} 件</p>
        )}
      </section>
    </div>
  );
}
