import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getClasswork(classId: string, isOwner: boolean, userId: string) {
  const [topics, posts] = await Promise.all([
    prisma.topic.findMany({ where: { classId }, orderBy: { order: "asc" } }),
    prisma.post.findMany({
      where: {
        classId,
        type: { in: ["ASSIGNMENT", "MATERIAL"] },
        ...(isOwner ? {} : { status: "PUBLISHED" }),
      },
      include: {
        submissions: { where: { studentId: userId }, select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { topics, posts };
}

export async function getPostDetail(postId: string, userId: string, isOwner: boolean) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      attachments: true,
      author: { select: { name: true } },
      topic: true,
      submissions: {
        where: isOwner ? {} : { studentId: userId },
        include: { grade: true, attachments: { include: { attachment: true } } },
      },
    },
  });

  if (!post) notFound();
  if (post.status === "DRAFT" && !isOwner) notFound();

  return post;
}

export async function getSubmissionsForPost(classId: string, postId: string) {
  const [roster, submissions] = await Promise.all([
    prisma.enrollment.findMany({
      where: { classId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.submission.findMany({
      where: { postId },
      include: { grade: true },
    }),
  ]);

  const byStudentId = new Map(submissions.map((s) => [s.studentId, s]));

  return roster.map((e) => ({
    student: e.user,
    submission: byStudentId.get(e.user.id) ?? null,
  }));
}
