import { prisma } from "@/lib/prisma";
import { expandOccurrences } from "@/lib/calendar/recurrence";

export interface CalendarItem {
  id: string;
  kind: "EVENT" | "DEADLINE";
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  isVirtual: boolean;
  location: string | null;
  classId: string | null;
  className: string | null;
  accentColor: string | null;
  editable: boolean;
  eventId?: string;
  postId?: string;
}

async function getAccessibleClassIds(userId: string) {
  const [owned, enrolled] = await Promise.all([
    prisma.class.findMany({ where: { ownerId: userId }, select: { id: true } }),
    prisma.enrollment.findMany({ where: { userId }, select: { classId: true } }),
  ]);
  return [...owned.map((c) => c.id), ...enrolled.map((e) => e.classId)];
}

export async function getCalendarItems(userId: string, rangeStart: Date, rangeEnd: Date): Promise<CalendarItem[]> {
  const classIds = await getAccessibleClassIds(userId);

  const events = await prisma.calendarEvent.findMany({
    where: {
      OR: [
        { scope: "PERSONAL", creatorId: userId },
        { scope: "GLOBAL" },
        { scope: "CLASS", classId: { in: classIds } },
      ],
    },
    include: { class: { select: { id: true, name: true, accentColor: true } } },
  });

  const items: CalendarItem[] = [];

  for (const event of events) {
    const durationMs = event.endAt.getTime() - event.startAt.getTime();

    if (event.recurrenceRule) {
      const occurrences = expandOccurrences(event.recurrenceRule, rangeStart, rangeEnd);
      for (const start of occurrences) {
        items.push({
          id: `${event.id}:${start.toISOString()}`,
          kind: "EVENT",
          title: event.title,
          start,
          end: new Date(start.getTime() + durationMs),
          allDay: event.allDay,
          isVirtual: event.isVirtual,
          location: event.location,
          classId: event.classId,
          className: event.class?.name ?? null,
          accentColor: event.class?.accentColor ?? null,
          editable: event.creatorId === userId,
          eventId: event.id,
        });
      }
    } else if (event.startAt <= rangeEnd && event.endAt >= rangeStart) {
      items.push({
        id: event.id,
        kind: "EVENT",
        title: event.title,
        start: event.startAt,
        end: event.endAt,
        allDay: event.allDay,
        isVirtual: event.isVirtual,
        location: event.location,
        classId: event.classId,
        className: event.class?.name ?? null,
        accentColor: event.class?.accentColor ?? null,
        editable: event.creatorId === userId,
        eventId: event.id,
      });
    }
  }

  const deadlines = await prisma.post.findMany({
    where: {
      type: "ASSIGNMENT",
      status: "PUBLISHED",
      classId: { in: classIds },
      dueAt: { gte: rangeStart, lte: rangeEnd },
    },
    include: { class: { select: { id: true, name: true, accentColor: true } } },
  });

  for (const post of deadlines) {
    if (!post.dueAt) continue;
    items.push({
      id: `deadline:${post.id}`,
      kind: "DEADLINE",
      title: post.title,
      start: post.dueAt,
      end: post.dueAt,
      allDay: false,
      isVirtual: false,
      location: null,
      classId: post.classId,
      className: post.class.name,
      accentColor: post.class.accentColor,
      editable: false,
      postId: post.id,
    });
  }

  return items.sort((a, b) => a.start.getTime() - b.start.getTime());
}
