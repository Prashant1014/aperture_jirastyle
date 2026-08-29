"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/topnav";
import { MobileNav } from "@/components/mobile-nav";
import type { Role } from "@/generated/prisma/client";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  avatarUrl?: string | null;
};

export function PortalShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Persistent Sidebar */}
      <Sidebar user={user} />

      {/* Mobile Drawer and Bottom Nav */}
      <MobileNav
        user={user}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpen={() => setMobileNavOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-3.5 sm:p-6 pb-24 md:pb-6">
          <div className="mx-auto w-full max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
