import { auth } from "@/auth";
import { PortalShell } from "@/components/portal-shell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <PortalShell user={session.user}>
      {children}
    </PortalShell>
  );
}
