"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/webpush";
import { revalidatePath } from "next/cache";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function getVapidPublicKeyAction(): Promise<string | undefined> {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || undefined;
}

export async function subscribeUserToPushAction(subscription: PushSubscriptionInput) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { endpoint, keys } = subscription;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("Invalid subscription object");
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint: endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      userId: session.user.id,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function unsubscribeUserFromPushAction(endpoint: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.pushSubscription.deleteMany({
    where: {
      userId: session.user.id,
      endpoint: endpoint,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function sendSelfTestPushAction() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await sendPushNotification(session.user.id, {
    title: "New Update 🔔",
    body: "You have a new notification! Aperture web push is live.",
    url: "/",
  });
}
