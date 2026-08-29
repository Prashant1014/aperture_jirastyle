"use client";

import { useState } from "react";
import Link from "next/link";
import { RoleBadge } from "@/components/ui/badge";
import { deleteUserAction } from "./actions";
import { ROLE_ORDER } from "@/lib/roles";
import type { Role } from "@/generated/prisma/client";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  isActive: boolean;
};

export function UserList({ initialUsers, currentUserId }: { initialUsers: User[], currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name" | "role">("default");

  const filteredUsers = users.filter((u) => {
    const search = query.toLowerCase();
    return (
      (u.name?.toLowerCase() || "").includes(search) ||
      (u.email?.toLowerCase() || "").includes(search)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }
    if (sortBy === "role") {
      const aIndex = ROLE_ORDER.indexOf(a.role);
      const bIndex = ROLE_ORDER.indexOf(b.role);
      return aIndex - bIndex;
    }
    return 0;
  });

  const handleDelete = async (userId: string) => {
    if (userId === currentUserId) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm("Are you sure you want to completely delete this user? This action cannot be undone.")) return;

    try {
      await deleteUserAction(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Failed to delete user.";
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="glass flex-1 flex items-center px-3.5 py-2.5 rounded-xl border border-white/10">
          <span className="text-white/40 mr-2.5 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="bg-transparent border-none outline-none w-full text-white placeholder:text-white/40 text-xs sm:text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="glass flex items-center px-3.5 py-2.5 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
          <span className="text-white/50 text-xs sm:text-sm mr-2">Sort:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as "default" | "name" | "role")}
            className="bg-transparent border-none outline-none text-xs sm:text-sm text-white appearance-none cursor-pointer pr-4"
          >
            <option value="default" className="bg-surface text-white">Default</option>
            <option value="name" className="bg-surface text-white">Name (A-Z)</option>
            <option value="role" className="bg-surface text-white">Role</option>
          </select>
        </div>
      </div>

      <div className="glass rounded-xl border border-white/10 overflow-hidden divide-y divide-white/10">
        {sortedUsers.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">No users found.</div>
        ) : (
          sortedUsers.map((u) => (
            <div
              key={u.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-white/5"
            >
              <Link href={`/admin/users/${u.id}`} className="min-w-0 flex-1 group">
                <p className="truncate font-medium text-sm sm:text-base text-white/90 group-hover:text-white transition-colors">
                  {u.name || "Unnamed"}
                  {!u.isActive && (
                    <span className="ml-2 text-[10px] text-danger font-semibold bg-danger/10 px-2 py-0.5 rounded-full">
                      Deactivated
                    </span>
                  )}
                </p>
                <p className="truncate text-xs sm:text-sm text-white/50">{u.email}</p>
              </Link>
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <RoleBadge role={u.role} />
                {u.id !== currentUserId && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-xs text-danger hover:text-white hover:bg-danger px-2.5 py-1 rounded-md transition-colors border border-danger/30"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
