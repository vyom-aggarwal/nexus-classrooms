import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { notFound } from "next/navigation";
import { addMinutes } from "date-fns";

const JOIN_WINDOW_MINUTES = 15;

export async function ensureMeetingForEvent(eventId: string) {
  const existing = await prisma.meeting.findUnique({ where: { calendarEventId: eventId } });
  if (existing) return existing;

  return prisma.meeting.create({
    data: { calendarEventId: eventId, roomName: `event-${eventId}-${randomUUID().slice(0, 8)}` },
  });
}

export async function getMeetingAccess(eventId: string, userId: string) {
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    include: { class: { select: { id: true, name: true, ownerId: true } }, meeting: true },
  });

  if (!event || !event.isVirtual) notFound();

  const isHost = event.creatorId === userId || event.class?.ownerId === userId;
  let allowed = isHost || event.scope === "GLOBAL";
  if (!allowed && event.scope === "CLASS" && event.classId) {
    const enrolled = await prisma.enrollment.findUnique({
      where: { classId_userId: { classId: event.classId, userId } },
    });
    allowed = !!enrolled;
  }
  if (!allowed) notFound();

  return { event, isHost };
}

export function isJoinable(event: { startAt: Date; endAt: Date }) {
  const now = new Date();
  return addMinutes(event.startAt, -JOIN_WINDOW_MINUTES) <= now && now <= event.endAt;
}

/** Finds a virtual event that's live or starting soon, visible to the user — for the sidebar's "Join Meeting" affordance and the class Stream banner. */
export async function getJoinableMeeting(userId: string, classId?: string) {
  const now = new Date();

  const [owned, enrolled] = await Promise.all([
    prisma.class.findMany({ where: { ownerId: userId }, select: { id: true } }),
    prisma.enrollment.findMany({ where: { userId }, select: { classId: true } }),
  ]);
  const classIds = classId ? [classId] : [...owned.map((c) => c.id), ...enrolled.map((e) => e.classId)];

  const event = await prisma.calendarEvent.findFirst({
    where: {
      isVirtual: true,
      startAt: { lte: addMinutes(now, JOIN_WINDOW_MINUTES) },
      endAt: { gte: now },
      OR: [
        { scope: "PERSONAL", creatorId: userId },
        { scope: "GLOBAL" },
        { scope: "CLASS", classId: { in: classIds } },
      ],
    },
    include: { class: { select: { name: true } } },
    orderBy: { startAt: "asc" },
  });

  return event;
}
