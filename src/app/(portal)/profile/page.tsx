import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { PushSettings } from "./push-settings";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-slide-up">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your Profile</h1>
      </div>

      <Card className="p-6">
        <ProfileForm 
          initialName={user.name || ""} 
          email={user.email} 
          initialTitle={user.title}
          initialBio={user.bio}
          initialAvatarUrl={user.avatarUrl}
          initialContactNumber={user.contactNumber}
        />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Push Notifications</h2>
        <p className="text-xs text-white/50 mb-4">
          Receive real-time alerts on your phone or desktop even when the portal is closed.
        </p>
        <PushSettings />
      </Card>
    </div>
  );
}
