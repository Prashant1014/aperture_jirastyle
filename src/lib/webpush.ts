import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@apertureart.org";

function configureVapid(): boolean {
  if (vapidPublicKey && vapidPrivateKey) {
    try {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
      return true;
    } catch (err) {
      console.error("Failed to configure VAPID details:", err);
      return false;
    }
  }
  return false;
}

export type PushNotificationPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
};

interface WebPushError {
  statusCode?: number;
  message?: string;
}

function isWebPushError(error: unknown): error is WebPushError {
  return typeof error === "object" && error !== null && "statusCode" in error;
}

/**
 * Sends a push notification to all active devices of a specific user.
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
) {
  if (!configureVapid()) {
    console.warn("VAPID keys are missing or invalid. Push notification aborted.");
    return { success: false, sentCount: 0, error: "VAPID keys not configured" };
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return { success: true, sentCount: 0 };
  }

  const stringPayload = JSON.stringify({
    title: payload.title || "New Update 🔔",
    body: payload.body || "You have a new notification!",
    url: payload.url || "/",
    icon: payload.icon || "/icon.png",
    badge: payload.badge || "/icon.png",
    tag: payload.tag || "aperture-notification",
  });

  let sentCount = 0;

  const sendPromises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, stringPayload);
      sentCount++;
    } catch (error: unknown) {
      if (isWebPushError(error) && (error.statusCode === 404 || error.statusCode === 410)) {
        // Subscription has expired or unsubscribed on browser
        console.log(`Push subscription expired for endpoint: ${sub.endpoint}`);
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      } else {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Error sending push notification to subscriber:", errorMsg);
      }
    }
  });

  await Promise.allSettled(sendPromises);
  return { success: true, sentCount };
}

/**
 * Broadcasts a push notification to all registered subscriptions across all users.
 */
export async function broadcastPushNotification(payload: PushNotificationPayload) {
  if (!configureVapid()) {
    console.warn("VAPID keys are missing. Broadcast push notification aborted.");
    return { success: false, sentCount: 0, error: "VAPID keys not configured" };
  }

  const subscriptions = await prisma.pushSubscription.findMany();
  if (subscriptions.length === 0) {
    return { success: true, sentCount: 0 };
  }

  const stringPayload = JSON.stringify({
    title: payload.title || "New Update 🔔",
    body: payload.body || "You have a new notification!",
    url: payload.url || "/",
    icon: payload.icon || "/icon.png",
    badge: payload.badge || "/icon.png",
    tag: payload.tag || "aperture-announcement",
  });

  let sentCount = 0;

  const sendPromises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, stringPayload);
      sentCount++;
    } catch (error: unknown) {
      if (isWebPushError(error) && (error.statusCode === 404 || error.statusCode === 410)) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      } else {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Error sending push notification to subscriber:", errorMsg);
      }
    }
  });

  await Promise.allSettled(sendPromises);
  return { success: true, sentCount };
}
