import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { UserList } from "./user-list";
import { auth } from "@/auth";
import { ImportUsersButton } from "./import-button";
import { TestNotificationButton } from "./test-notification-button";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({ 
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true }
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Manage members</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">{users.length} registered accounts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <TestNotificationButton />
          <ImportUsersButton />
          <Link href="/admin/users/new">
            <Button size="sm" className="h-9 px-3 text-xs font-semibold">New account</Button>
          </Link>
        </div>
      </div>

      <UserList initialUsers={users} currentUserId={session?.user.id || ""} />
    </div>
  );
}
