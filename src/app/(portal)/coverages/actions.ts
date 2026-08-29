"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCoreOrAbove } from "@/lib/roles";
import { sendPushNotification, sendPushNotificationToUsers } from "@/lib/webpush";

export type EventFormState = { error?: string } | undefined;

async function requireCoreOrAbove() {
  const session = await auth();
  if (!session?.user || !isCoreOrAbove(session.user.role)) {
    return null;
  }
  return session;
}

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "Assigned",
  SORT_AND_EDIT: "Sorting & Editing",
  UPLOAD_DONE: "Upload Completed",
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/**
 * Creates a new project call and notifies all assigned members immediately.
 */
export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const session = await requireCoreOrAbove();
  if (!session) return { error: "Only Core Members and above can create events." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const driveLink = String(formData.get("driveLink") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "");
  const endsAt = String(formData.get("endsAt") ?? "");
  const assignees = formData.getAll("assignees").map(String).filter(Boolean);

  if (!title || !startsAt) {
    return { error: "Title and start date/time are required." };
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description || null,
      location: location || null,
      driveLink: driveLink || null,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      createdById: session.user.id,
      assignments: {
        create: assignees.map((userId) => ({ userId })),
      },
    },
    include: {
      assignments: true,
    },
  });

  // Notify assigned users (excluding creator)
  const targetUserIds = assignees.filter((id) => id !== session.user.id);
  if (targetUserIds.length > 0) {
    const creatorName = session.user.name || "A team lead";
    const notificationTitle = `🎯 Assigned: ${title}`;
    const notificationMessage = `${creatorName} assigned you to project call "${title}".`;

    // 1. Create in-app notifications
    try {
      await prisma.notification.createMany({
        data: targetUserIds.map((userId) => ({
          recipientId: userId,
          eventId: event.id,
          type: "ASSIGNMENT_COMPLETED" as const,
          title: notificationTitle,
          message: notificationMessage,
        })),
      });
    } catch (e) {
      console.error("Error creating assignment notifications:", e);
    }

    // 2. Dispatch real Web Push notifications to active devices
    sendPushNotificationToUsers(targetUserIds, {
      title: notificationTitle,
      body: notificationMessage,
      url: `/coverages/${event.id}`,
      tag: `assignment-${event.id}`,
    }).catch((err) => console.error("Push delivery error for new call:", err));
  }

  revalidatePath("/coverages");
  redirect(`/coverages/${event.id}`);
}

/**
 * Updates the overall status of a project call and notifies all assigned team members.
 */
export async function updateEventStatusAction(eventId: string, status: string) {
  const session = await requireCoreOrAbove();
  if (!session) return;

  const validStatus = status as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status: validStatus },
    include: {
      assignments: { select: { userId: true } },
    },
  });

  // Notify all assigned members (except the person updating)
  const targetUserIds = event.assignments
    .map((a) => a.userId)
    .filter((id) => id !== session.user.id);

  if (targetUserIds.length > 0) {
    const statusLabel = STATUS_LABELS[status] || status;
    const notificationTitle = `📌 Status: ${event.title}`;
    const notificationMessage = `Project call status was updated to "${statusLabel}".`;

    try {
      await prisma.notification.createMany({
        data: targetUserIds.map((userId) => ({
          recipientId: userId,
          eventId: event.id,
          type: "ASSIGNMENT_COMPLETED" as const,
          title: notificationTitle,
          message: notificationMessage,
        })),
      });
    } catch (e) {
      console.error("Error creating status update notifications:", e);
    }

    sendPushNotificationToUsers(targetUserIds, {
      title: notificationTitle,
      body: notificationMessage,
      url: `/coverages/${event.id}`,
      tag: `event-status-${event.id}`,
    }).catch((err) => console.error("Push error on event status update:", err));
  }

  revalidatePath(`/coverages/${eventId}`);
  revalidatePath("/coverages");
}

export async function deleteEventAction(eventId: string) {
  const session = await requireCoreOrAbove();
  if (!session) return;

  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/coverages");
  redirect("/coverages");
}

/**
 * Assigns a single member to an existing project call and triggers instant notifications.
 */
export async function assignMemberAction(eventId: string, userId: string) {
  const session = await requireCoreOrAbove();
  if (!session) return;
  if (!userId) return;

  const [assignment, event] = await Promise.all([
    prisma.eventAssignment.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId },
      update: {},
    }),
    prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    }),
  ]);

  if (event && userId !== session.user.id) {
    const creatorName = session.user.name || "A team lead";
    const notificationTitle = `🎯 Assigned: ${event.title}`;
    const notificationMessage = `${creatorName} assigned you to "${event.title}".`;

    try {
      await prisma.notification.create({
        data: {
          recipientId: userId,
          eventId: event.id,
          assignmentId: assignment.id,
          type: "ASSIGNMENT_COMPLETED",
          title: notificationTitle,
          message: notificationMessage,
        },
      });
    } catch (e) {
      console.error("Error creating single assignment notification:", e);
    }

    sendPushNotification(userId, {
      title: notificationTitle,
      body: notificationMessage,
      url: `/coverages/${event.id}`,
      tag: `assignment-${event.id}`,
    }).catch((err) => console.error("Push delivery error for assignment:", err));
  }

  revalidatePath(`/coverages/${eventId}`);
}

/**
 * Unassigns a member from an event and sends a notification.
 */
export async function unassignMemberAction(eventId: string, userId: string) {
  const session = await requireCoreOrAbove();
  if (!session) return;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { title: true },
  });

  await prisma.eventAssignment.delete({
    where: { eventId_userId: { eventId, userId } },
  });

  if (event && userId !== session.user.id) {
    const notificationTitle = `Project Call Update`;
    const notificationMessage = `You were unassigned from "${event.title}".`;

    sendPushNotification(userId, {
      title: notificationTitle,
      body: notificationMessage,
      url: `/coverages`,
      tag: `unassign-${eventId}`,
    }).catch((err) => console.error("Push error for unassign:", err));
  }

  revalidatePath(`/coverages/${eventId}`);
}

/**
 * When an assigned user updates their task status, notify the event creator (vice-versa).
 */
export async function updateMyAssignmentStatusAction(
  eventId: string,
  status: string
) {
  const session = await auth();
  if (!session?.user) return;

  const newStatus = status as "ASSIGNED" | "SORT_AND_EDIT" | "UPLOAD_DONE";
  const statusLabel = STATUS_LABELS[newStatus] || newStatus;

  const existingAssignment = await prisma.eventAssignment.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          createdById: true,
        },
      },
    },
  });

  if (!existingAssignment) return;

  await prisma.eventAssignment.update({
    where: { id: existingAssignment.id },
    data: { status: newStatus },
  });

  // Notify the event creator if it's someone else
  const creatorId = existingAssignment.event.createdById;
  if (creatorId && creatorId !== session.user.id) {
    const userName = session.user.name || "A team member";
    const notificationTitle = newStatus === "UPLOAD_DONE" 
      ? `✅ Work Completed: ${existingAssignment.event.title}`
      : `📋 Task Update: ${existingAssignment.event.title}`;
    const notificationMessage = `${userName} updated task to "${statusLabel}" on "${existingAssignment.event.title}".`;

    try {
      await prisma.notification.create({
        data: {
          recipientId: creatorId,
          eventId: eventId,
          assignmentId: existingAssignment.id,
          type: "ASSIGNMENT_COMPLETED",
          title: notificationTitle,
          message: notificationMessage,
        },
      });
    } catch (e) {
      console.error("Error creating assignment status update notification:", e);
    }

    sendPushNotification(creatorId, {
      title: notificationTitle,
      body: notificationMessage,
      url: `/coverages/${eventId}`,
      tag: `assignment-status-${eventId}`,
    }).catch((err) => console.error("Push delivery error for assignment status update:", err));
  }

  revalidatePath(`/coverages/${eventId}`);
}

/**
 * Updates the Drive link for a project call and notifies all assigned team members.
 */
export async function updateDriveLinkAction(eventId: string, formData: FormData) {
  const session = await requireCoreOrAbove();
  if (!session) return;
  const driveLink = String(formData.get("driveLink") ?? "").trim();

  const event = await prisma.event.update({
    where: { id: eventId },
    data: { driveLink: driveLink || null },
    include: {
      assignments: { select: { userId: true } },
    },
  });

  if (driveLink) {
    const targetUserIds = event.assignments
      .map((a) => a.userId)
      .filter((id) => id !== session.user.id);

    if (targetUserIds.length > 0) {
      const notificationTitle = `📁 Drive Link: ${event.title}`;
      const notificationMessage = `${session.user.name || "A lead"} added a Drive link for "${event.title}".`;

      try {
        await prisma.notification.createMany({
          data: targetUserIds.map((userId) => ({
            recipientId: userId,
            eventId: event.id,
            type: "ASSIGNMENT_COMPLETED" as const,
            title: notificationTitle,
            message: notificationMessage,
          })),
        });
      } catch (e) {
        console.error("Error creating drive link notifications:", e);
      }

      sendPushNotificationToUsers(targetUserIds, {
        title: notificationTitle,
        body: notificationMessage,
        url: `/coverages/${event.id}`,
        tag: `drive-link-${event.id}`,
      }).catch((err) => console.error("Push error on drive link update:", err));
    }
  }

  revalidatePath(`/coverages/${eventId}`);
}
