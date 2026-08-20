import type { Role } from "@/generated/prisma/client";

// Descending priority order: index 0 is highest authority.
export const ROLE_ORDER: Role[] = [
  "WEBADMIN",
  "CORE_MEMBER",
  "TEAM_APERTURE",
  "WORKING_TEAM",
];

export const ROLE_LABELS: Record<Role, string> = {
  WEBADMIN: "Webadmin",
  CORE_MEMBER: "Core Member",
  TEAM_APERTURE: "Team Aperture",
  WORKING_TEAM: "Working Team",
};

function rank(role: Role): number {
  return ROLE_ORDER.indexOf(role);
}

/** True if `role` has priority at least as high as `minRole` (lower rank number = higher priority). */
export function hasRole(role: Role | undefined | null, minRole: Role): boolean {
  if (!role) return false;
  return rank(role) <= rank(minRole);
}

export const isWebadmin = (role: Role | undefined | null) => hasRole(role, "WEBADMIN");
export const isCoreOrAbove = (role: Role | undefined | null) => hasRole(role, "CORE_MEMBER");
