import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { RoleBadge } from "@/components/ui/badge";
import { EditProfileForm } from "./edit-profile-form";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { event: true },
        orderBy: { event: { startsAt: "desc" } },
        take: 5,
      },
    },
  });

  if (!member) notFound();

  const isOwnProfile = session?.user.id === member.id;

  return (
    <div className="max-w-2xl space-y-4 sm:space-y-6 animate-slide-up pb-12">
      <Card className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-6">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt="" className="h-16 w-16 sm:h-14 sm:w-14 shrink-0 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="flex h-16 w-16 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-accent/15 text-lg font-bold text-accent border border-accent/20">
            {initials(member.name)}
          </div>
        )}
        <div className="min-w-0 flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold text-white">{member.name}</h1>
            <RoleBadge role={member.role} />
            {!member.isActive && (
              <span className="text-xs text-danger font-semibold bg-danger/10 px-2 py-0.5 rounded-full">Deactivated</span>
            )}
          </div>
          {member.title && <p className="text-xs sm:text-sm text-white/70 mt-0.5">{member.title}</p>}
          <p className="mt-1 text-xs sm:text-sm text-white/40">{member.email}</p>
          {member.contactNumber && <p className="text-xs sm:text-sm text-white/40 mt-0.5">{member.contactNumber}</p>}
          {member.bio && <p className="mt-3 whitespace-pre-wrap text-xs sm:text-sm text-white/80 p-3 rounded-lg bg-white/[0.02] border border-white/5">{member.bio}</p>}
        </div>
      </Card>

      {member.assignments.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h2 className="font-semibold text-sm sm:text-base text-white">Recent Project Calls</h2>
          <ul className="mt-3 divide-y divide-white/5">
            {member.assignments.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-xs sm:text-sm py-2.5">
                <span className="text-white/80 font-medium truncate pr-2">{a.event.title}</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded shrink-0">{a.status.replaceAll("_", " ")}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {isOwnProfile && (
        <Card className="p-4 sm:p-6">
          <h2 className="font-semibold text-sm sm:text-base text-white">Edit your profile</h2>
          <p className="mb-4 text-xs sm:text-sm text-white/40">
            Role and account permissions are managed by a Webadmin.
          </p>
          <EditProfileForm user={member} />
        </Card>
      )}
    </div>
  );
}
