"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";
import { Logo } from "@/components/logo";
import { RoleBadge } from "@/components/ui/badge";
import type { Role } from "@/generated/prisma/client";
import { isWebadmin, isCoreOrAbove } from "@/lib/roles";
import { signOutAction } from "@/app/(portal)/actions";
import { EnableNotificationsButton } from "./enable-notifications-button";

type NavUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  avatarUrl?: string | null;
};

// SVG Icons
const Icons = {
  Dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
  ),
  Board: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
  ),
  Announcements: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14l4-4h9a2 2 0 0 0 2-2v-5"></path><path d="M18.42 15.58a2.121 2.121 0 0 0 3-3L15 6l-3 3 6.42 6.58z"></path></svg>
  ),
  Directory: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  Calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  ),
  Admin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
  ),
  Profile: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  ),
  Menu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
  ),
  Close: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
};

export function MobileNav({
  user,
  isOpen,
  onClose,
  onOpen,
}: {
  user: NavUser;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const pathname = usePathname();

  // Close drawer automatically on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const links = [
    { href: "/", label: "Dashboard", icon: Icons.Dashboard },
    { href: "/coverages", label: "Project Calls", icon: Icons.Board },
    { href: "/announcements", label: "Announcements", icon: Icons.Announcements },
    { href: "/directory", label: "Team", icon: Icons.Directory },
    ...(isCoreOrAbove(user.role) ? [{ href: "/calendar", label: "Calendar", icon: Icons.Calendar }] : []),
    ...(isWebadmin(user.role) ? [{ href: "/admin/users", label: "Settings", icon: Icons.Admin }] : []),
  ];

  return (
    <>
      {/* 1. Mobile Drawer Backdrop & Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 2. Slide-over Drawer Sheet */}
      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 w-4/5 max-w-xs bg-surface border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ease-out md:hidden shadow-2xl overflow-y-auto custom-scrollbar",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5 font-bold text-lg text-white">
            <div className="bg-accent rounded-md p-1.5 shrink-0">
              <Logo className="h-5 w-5 text-accent-foreground" />
            </div>
            Aperture
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            {Icons.Close}
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-white/15 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 text-accent font-bold flex items-center justify-center text-sm shrink-0">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.name ?? "Member"}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
              <div className="mt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex-1 space-y-1">
          <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Workspace
          </div>

          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/15 text-white font-semibold shadow-sm border border-accent/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className={clsx("shrink-0", active ? "text-accent" : "text-white/50")}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Account & Alerts
          </div>

          <Link
            href="/profile"
            onClick={onClose}
            className={clsx(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname === "/profile"
                ? "bg-accent/15 text-white font-semibold border border-accent/20"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className="shrink-0 text-white/50">{Icons.Profile}</span>
            <span>Profile & Settings</span>
          </Link>

          <div className="pt-2 px-1">
            <EnableNotificationsButton variant="dropdown-item" />
          </div>
        </nav>

        {/* Drawer Footer: Sign Out */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* 3. Mobile Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/90 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        aria-label="Mobile Navigation"
      >
        <Link
          href="/"
          className={clsx(
            "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors min-w-[56px] min-h-[44px]",
            pathname === "/" ? "text-accent font-semibold" : "text-white/50 hover:text-white"
          )}
        >
          <span className="scale-90">{Icons.Dashboard}</span>
          <span className="mt-0.5">Home</span>
        </Link>

        <Link
          href="/coverages"
          className={clsx(
            "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors min-w-[56px] min-h-[44px]",
            pathname.startsWith("/coverages") ? "text-accent font-semibold" : "text-white/50 hover:text-white"
          )}
        >
          <span className="scale-90">{Icons.Board}</span>
          <span className="mt-0.5">Calls</span>
        </Link>

        <Link
          href="/announcements"
          className={clsx(
            "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors min-w-[56px] min-h-[44px]",
            pathname.startsWith("/announcements") ? "text-accent font-semibold" : "text-white/50 hover:text-white"
          )}
        >
          <span className="scale-90">{Icons.Announcements}</span>
          <span className="mt-0.5">Updates</span>
        </Link>

        <Link
          href="/directory"
          className={clsx(
            "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors min-w-[56px] min-h-[44px]",
            pathname.startsWith("/directory") ? "text-accent font-semibold" : "text-white/50 hover:text-white"
          )}
        >
          <span className="scale-90">{Icons.Directory}</span>
          <span className="mt-0.5">Team</span>
        </Link>

        <button
          onClick={onOpen}
          className={clsx(
            "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors min-w-[56px] min-h-[44px]",
            isOpen ? "text-accent font-semibold" : "text-white/50 hover:text-white"
          )}
          aria-label="Open full menu"
        >
          <span className="scale-90">{Icons.Menu}</span>
          <span className="mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
}
