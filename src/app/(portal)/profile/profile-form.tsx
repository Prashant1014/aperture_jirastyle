"use client";

import { useActionState } from "react";
import { updateProfileAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({ 
  initialName, 
  email,
  initialBio,
  initialAvatarUrl,
  initialContactNumber
}: { 
  initialName: string; 
  email: string;
  initialTitle?: string | null;
  initialBio?: string | null;
  initialAvatarUrl?: string | null;
  initialContactNumber?: string | null;
}) {
  const [state, action, isPending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-danger/15 p-3 text-xs sm:text-sm text-danger border border-danger/30">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-green-500/15 p-3 text-xs sm:text-sm text-green-400 border border-green-500/30">
          Profile updated successfully!
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-medium text-white/80">Email (Cannot be changed)</label>
        <Input name="email" type="email" defaultValue={email} disabled className="opacity-50 min-h-[42px]" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-medium text-white/80">Display Name</label>
        <Input name="name" type="text" defaultValue={initialName} required className="min-h-[42px]" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-medium text-white/80">Contact Number</label>
        <Input name="contactNumber" type="tel" defaultValue={initialContactNumber || ""} placeholder="+91 9876543210" className="min-h-[42px]" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-medium text-white/80">Bio</label>
        <textarea
          name="bio"
          defaultValue={initialBio || ""}
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-medium text-white/80">Profile Picture</label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {initialAvatarUrl && (
            <img src={initialAvatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" />
          )}
          <Input name="avatar" type="file" accept="image/*" className="file:bg-transparent file:text-white file:border-none file:mr-3 file:font-medium text-xs sm:text-sm text-white/60 min-h-[42px]" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs sm:text-sm font-medium text-white/80">New Password (Optional)</label>
        <Input name="password" type="password" placeholder="Leave blank to keep current password" className="min-h-[42px]" />
        <p className="text-[11px] text-white/40">Must be at least 8 characters if changing.</p>
      </div>

      <Button type="submit" disabled={isPending} className="w-full mt-3 min-h-[44px] text-sm font-semibold">
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
