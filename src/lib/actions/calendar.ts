"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { buildRecurrenceRule, type RecurrenceFreq } from "@/lib/calendar/recurrence";
import type { FormState } from "@/lib/actions/auth";

const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional(),
  scope: z.enum(["PERSONAL", "CLASS", "GLOBAL"]),
  classId: z.string().optional(),
  startAt: z.string().min(1, "Start time is required"),
  endAt: z.string().min(1, "End time is required"),
  allDay: z.string().optional(),
  location: z.string().trim().max(200).optional(),
  isVirtual: z.string().optional(),
  freq: z.enum(["NONE", "DAILY", "WEEKLY"]),
  weekdays: z.array(z.string()).optional(),
  until: z.string().optional(),
});

export async function saveEventAction(eventId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    scope: formData.get("scope"),
    classId: formData.get("classId") || undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    allDay: formData.get("allDay") || undefined,
    location: formData.get("location") || undefined,
    isVirtual: formData.get("isVirtual") || undefined,
    freq: formData.get("freq") || "NONE",
    weekdays: formData.getAll("weekdays") as string[],
    until: formData.get("until") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const data = parsed.data;

  if (data.scope !== "PERSONAL" && user.role !== "TEACHER") {
    return { error: "Only teachers can create class or school-wide events." };
  }

  let classId: string | null = null;
  if (data.scope === "CLASS") {
    if (!data.classId) return { error: "Choose a class for this event." };
    const cls = await prisma.class.findUnique({ where: { id: data.classId }, select: { ownerId: true } });
    if (!cls || cls.ownerId !== user.id) return { error: "You don't own that class." };
    classId = data.classId;
  }

  const startAt = new Date(data.startAt);
  const endAt = new Date(data.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt < startAt) {
    return { error: "Enter a valid start and end time." };
  }

  const recurrenceRule = buildRecurrenceRule(
    {
      freq: data.freq as RecurrenceFreq,
      weekdays: data.weekdays?.map(Number),
      until: data.until ? new Date(data.until) : null,
    },
    startAt,
  );

  const payload = {
    title: data.title,
    description: data.description ?? null,
    scope: data.scope,
    classId,
    startAt,
    endAt,
    allDay: data.allDay === "on",
    location: data.location ?? null,
    isVirtual: data.isVirtual === "on",
    recurrenceRule,
  };

  if (eventId) {
    const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId }, select: { creatorId: true } });
    if (!existing || existing.creatorId !== user.id) return { error: "You can't edit this event." };
    await prisma.calendarEvent.update({ where: { id: eventId }, data: payload });
  } else {
    await prisma.calendarEvent.create({ data: { ...payload, creatorId: user.id } });
  }

  revalidatePath("/calendar");
  redirect("/calendar");
}

export async function deleteEventAction(eventId: string) {
  const user = await requireUser();
  const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId }, select: { creatorId: true } });
  if (!existing || existing.creatorId !== user.id) throw new Error("You can't delete this event.");

  await prisma.calendarEvent.delete({ where: { id: eventId } });
  revalidatePath("/calendar");
}
