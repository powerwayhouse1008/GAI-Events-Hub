"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApprovalStatus, UserRole } from "@/lib/types";
import { createDefaultAdmin, deleteAccount, grantAdmin, revokeAdmin } from "./accountActions";
import type { AccountActionResult } from "./accountActions";

export type AccountRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  company_name: string | null;
  role: UserRole;
  organizer_status: ApprovalStatus;
};

type AdminAccountsClientProps = {
  initialAccounts: AccountRow[];
  currentAdminId: string;
};

type PendingAction = "grant" | "revoke" | "delete" | "default";

function formDataFor(id: string) {
  const formData = new FormData();
  formData.set("id", id);
  return formData;
}

export function AdminAccountsClient({ initialAccounts, currentAdminId }: AdminAccountsClientProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [pending, setPending] = useState<Record<string, PendingAction | undefined>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => (a.email || "").localeCompare(b.email || "")),
    [accounts]
  );

  function setRowPending(id: string, action: PendingAction | undefined) {
    setPending((current) => {
      const next = { ...current };
      if (action) next[id] = action;
      else delete next[id];
      return next;
    });
  }

  function applyAccountPatch(id: string, patch: Partial<AccountRow>) {
    setAccounts((current) =>
      current.map((account) => (account.id === id ? { ...account, ...patch } : account))
    );
  }

  function runAccountAction(
    id: string,
    action: PendingAction,
    call: (formData: FormData) => Promise<AccountActionResult>,
    optimisticPatch?: Partial<AccountRow>
  ) {
    const previousAccounts = accounts;
    setNotice(null);
    setRowPending(id, action);
    if (optimisticPatch) applyAccountPatch(id, optimisticPatch);

    startTransition(async () => {
      const result = await call(formDataFor(id));
      if (!result?.ok) {
        setAccounts(previousAccounts);
        setNotice(result?.message || "操作に失敗しました。");
      } else if (result.account) {
        applyAccountPatch(result.account.id, {
          role: result.account.role,
          organizer_status: result.account.organizer_status
        });
      } else if (result.deletedId) {
        setAccounts((current) => current.filter((account) => account.id !== result.deletedId));
      }
      setRowPending(id, undefined);
    });
  }

  function createMaiAdmin() {
    setNotice(null);
    setRowPending("__default__", "default");

    startTransition(async () => {
      const result = await createDefaultAdmin();
      if (!result?.ok) {
        setNotice(result?.message || "管理者アカウントを準備できませんでした。");
      }
      setRowPending("__default__", undefined);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tight">アカウント権限</h1>
          <p className="mt-3 text-slate-500">
            登録済みアカウントの管理者権限を変更し、不要なアカウントを削除できます。
          </p>
        </div>
        <button
          className="rounded-xl bg-purple-700 px-5 py-3 font-bold text-white hover:bg-purple-800 disabled:cursor-wait disabled:opacity-70"
          disabled={pending.__default__ === "default"}
          onClick={createMaiAdmin}
          type="button"
        >
          {pending.__default__ === "default" ? "処理中..." : "mai@powerway.jp を管理者に設定"}
        </button>
      </div>

      {notice && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {notice}
        </div>
      )}

      <section className="card mt-8 overflow-x-auto p-7">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">名前</th>
              <th className="p-3">メール</th>
              <th className="p-3">会社・コミュニティ</th>
              <th className="p-3">権限</th>
              <th className="p-3">主催者状態</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedAccounts.map((account) => {
              const isCurrentAdmin = account.id === currentAdminId;
              const rowPending = pending[account.id];
              const isBusy = Boolean(rowPending);

              return (
                <tr key={account.id} className="border-b">
                  <td className="p-3 font-bold">{account.display_name || "-"}</td>
                  <td className="p-3">{account.email || "-"}</td>
                  <td className="p-3">{account.company_name || "-"}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                      {account.role}
                    </span>
                  </td>
                  <td className="p-3">{account.organizer_status}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={account.role === "admin" || isBusy}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        onClick={() =>
                          runAccountAction(account.id, "grant", grantAdmin, {
                            role: "admin",
                            organizer_status: "approved"
                          })
                        }
                        type="button"
                      >
                        {rowPending === "grant" ? "処理中..." : "管理者にする"}
                      </button>
                      <button
                        disabled={account.role !== "admin" || isCurrentAdmin || isBusy}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        onClick={() =>
                          runAccountAction(account.id, "revoke", revokeAdmin, {
                            role: "member",
                            organizer_status: "none"
                          })
                        }
                        type="button"
                      >
                        {rowPending === "revoke" ? "処理中..." : "管理者解除"}
                      </button>
                      <button
                        disabled={isCurrentAdmin || isBusy}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-300"
                        onClick={() => {
                          if (!window.confirm("このアカウントを削除しますか？")) return;
                          runAccountAction(account.id, "delete", deleteAccount);
                        }}
                        type="button"
                      >
                        {rowPending === "delete" ? "処理中..." : "アカウント削除"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!sortedAccounts.length && (
              <tr>
                <td colSpan={6} className="p-3 text-slate-500">
                  アカウントがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
