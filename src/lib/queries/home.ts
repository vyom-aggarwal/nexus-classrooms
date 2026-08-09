import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { getCalendarItems } from "@/lib/queries/calendar";

export async function getTeacherHomeData(userId: string) {
  const now = new Date();

  const [classes, todaysEvents, pendingGrading] = await Promise.all([
    prisma.class.findMany({
      where: { ownerId: userId, archivedAt: null },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getCalendarItems(userId, startOfDay(now), endOfDay(now)).then((items) => items.filter((i) => i.kind === "EVENT")),
    prisma.submission.findMany({
      where: {
        status: "TURNED_IN",
        grade: null,
        post: { class: { ownerId: userId } },
      },
      include: { post: { include: { class: true } }, student: true },
      orderBy: { submittedAt: "asc" },
      take: 10,
    }),
  ]);

  return { classes, todaysEvents, pendingGrading };
}

export async function getStudentHomeData(userId: string) {
  const now = new Date();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const [classes, todaysEvents, upcomingWork] = await Promise.all([
    prisma.class.findMany({
      where: { id: { in: classIds }, archivedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    getCalendarItems(userId, startOfDay(now), endOfDay(now)).then((items) => items.filter((i) => i.kind === "EVENT")),
    prisma.post.findMany({
      where: {
        type: "ASSIGNMENT",
        status: "PUBLISHED",
        classId: { in: classIds },
        submissions: {
          none: { studentId: userId, status: { in: ["TURNED_IN", "RETURNED"] } },
        },
      },
      include: { class: true },
      orderBy: { dueAt: "asc" },
      take: 10,
    }),
  ]);

  return { classes, todaysEvents, upcomingWork };
}
