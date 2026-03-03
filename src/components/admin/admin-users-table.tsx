"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminUserActivityDrawer } from "./admin-user-activity-drawer";

type UserRow = {
  id: string;
  email?: string;
  createdAt: string;
  lastSignInAt?: string;
};

type UsersResponse = {
  users: UserRow[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AdminUsersTable() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email?: string } | null>(null);

  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/admin/dashboard/users?page=${encodeURIComponent(pageNum)}`
      );
      if (!r.ok) throw new Error(r.statusText);
      const d: UsersResponse = await r.json();
      if (pageNum === 1) {
        setUsers(d.users);
      } else {
        setUsers((prev) => [...prev, ...d.users]);
      }
      setHasMore(d.hasMore ?? false);
      setPage(pageNum);
    } catch (e) {
      setError((e as Error).message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const loadMore = () => {
    if (!loading && hasMore) fetchPage(page + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminUserActivityDrawer
        userId={selectedUser?.id ?? ""}
        userEmail={selectedUser?.email}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <div className="overflow-x-auto rounded-xl border border-[#e7e1d9]">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#e7e1d9] bg-[#f9f7f3]">
            <th className="px-3 py-2 font-semibold text-[#3b1f4a]">Email</th>
              <th className="px-3 py-2 font-semibold text-[#3b1f4a]">Inscription</th>
              <th className="px-3 py-2 font-semibold text-[#3b1f4a]">Dernière connexion</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedUser({ id: u.id, email: u.email })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedUser({ id: u.id, email: u.email });
                  }
                }}
                className="cursor-pointer border-b border-[#e7e1d9] transition hover:bg-[#f4c95d22]"
              >
                <td className="px-3 py-2 font-medium text-[#1c1b1f]">
                  {u.email ?? u.id.slice(0, 8) + "…"}
                </td>
                <td className="px-3 py-2 text-[#524b5a]">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-3 py-2 text-[#524b5a]">
                  {formatDate(u.lastSignInAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && users.length === 0 && (
        <div className="flex justify-center py-4 text-sm text-[#524b5a]">
          Chargement…
        </div>
      )}
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="self-center rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:bg-[#f4c95d22] disabled:opacity-50"
        >
          {loading ? "Chargement…" : "Voir plus"}
        </button>
      )}
    </div>
  );
}
