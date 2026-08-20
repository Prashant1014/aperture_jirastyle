import { HTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";
import type { Role } from "@/generated/prisma/client";
import { ROLE_LABELS } from "@/lib/roles";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-foreground",
        className
      )}
      {...props}
    />
  );
}

const ROLE_COLORS: Record<Role, string> = {
  WEBADMIN: "border-accent/50 bg-accent/15 text-accent",
  CORE_MEMBER: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  TEAM_APERTURE: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  WORKING_TEAM: "border-border bg-surface-2 text-muted",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge className={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Badge>;
}
