import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getClassForMember(classId: string, userId: string) {
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      enrollments: { where: { userId }, select: { id: true } },
    },
  });

  if (!cls) notFound();
  const isMember = cls.ownerId === userId || cls.enrollments.length > 0;
  if (!isMember) notFound();

  return cls;
}

export async function getMyClasses(userId: string, role: "TEACHER" | "STUDENT") {
  const where =
    role === "TEACHER"
      ? { ownerId: userId, archivedAt: null }
      : { enrollments: { some: { userId } }, archivedAt: null };

  return prisma.class.findMany({
    where,
    include: { _count: { select: { enrollments: true } }, owner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}
