"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isCoreOrAbove } from "@/lib/roles";

export type EventFormState = { error?: string } | undefined;

async function requireCoreOrAbove() {
  const session = await auth();
  if (!session?.user || !isCoreOrAbove(session.user.role)) {
    return null;
  }
  return session;
}

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
        create: assignees.map(userId => ({ userId }))
      }
    },
  });

  revalidatePath("/coverages");
  redirect(`/coverages/${event.id}`);
}

export async function updateEventStatusAction(eventId: string, status: string) {
  const session = await requireCoreOrAbove();
  if (!session) return;

  await prisma.event.update({
    where: { id: eventId },
    data: { status: status as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" },
  });
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

export async function assignMemberAction(eventId: string, userId: string) {
  const session = await requireCoreOrAbove();
  if (!session) return;
  if (!userId) return;

  await prisma.eventAssignment.upsert({
    where: { eventId_userId: { eventId, userId } },
    create: { eventId, userId },
    update: {},
  });
  revalidatePath(`/coverages/${eventId}`);
}

export async function unassignMemberAction(eventId: string, userId: string) {
  const session = await requireCoreOrAbove();
  if (!session) return;

  await prisma.eventAssignment.delete({
    where: { eventId_userId: { eventId, userId } },
  });
  revalidatePath(`/coverages/${eventId}`);
}

export async function updateMyAssignmentStatusAction(
  eventId: string,
  status: string
) {
  const session = await auth();
  if (!session?.user) return;

  await prisma.eventAssignment.update({
    where: { eventId_userId: { eventId, userId: session.user.id } },
    data: { status: status as "ASSIGNED" | "SORT_AND_EDIT" | "UPLOAD_DONE" },
  });
  revalidatePath(`/coverages/${eventId}`);
}

export async function updateDriveLinkAction(eventId: string, formData: FormData) {
  const session = await requireCoreOrAbove();
  if (!session) return;
  const driveLink = String(formData.get("driveLink") ?? "").trim();

  await prisma.event.update({
    where: { id: eventId },
    data: { driveLink: driveLink || null },
  });
  revalidatePath(`/coverages/${eventId}`);
}
