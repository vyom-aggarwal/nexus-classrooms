"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { FormState } from "@/lib/actions/auth";

async function assertOwnsPost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, classId: true, points: true, class: { select: { ownerId: true } } },
  });
  if (!post || post.class.ownerId !== userId) return null;
  return post;
}

const gradeSchema = z.object({
  score: z.coerce.number().min(0, "Score can't be negative"),
  feedback: z.string().trim().max(5000).optional(),
});

export async function gradeSubmissionAction(
  classId: string,
  postId: string,
  submissionId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const post = await assertOwnsPost(postId, user.id);
  if (!post) return { error: "You can't grade this submission." };

  const parsed = gradeSchema.safeParse({
    score: formData.get("score"),
    feedback: formData.get("feedback") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.$transaction([
    prisma.grade.upsert({
      where: { submissionId },
      update: { score: parsed.data.score, feedback: parsed.data.feedback ?? null, gradedById: user.id, gradedAt: new Date() },
      create: {
        submissionId,
        score: parsed.data.score,
        feedback: parsed.data.feedback ?? null,
        gradedById: user.id,
      },
    }),
    prisma.submission.update({ where: { id: submissionId }, data: { status: "RETURNED" } }),
  ]);

  revalidatePath(`/classes/${classId}/classwork/${postId}/submissions`);
  revalidatePath(`/classes/${classId}/grades`);
  revalidatePath(`/grades`);
  return null;
}

export async function updateGridScoreAction(
  classId: string,
  postId: string,
  studentId: string,
  scoreInput: string,
) {
  const user = await requireUser();
  const post = await assertOwnsPost(postId, user.id);
  if (!post) throw new Error("Not authorized to grade this class.");

  const trimmed = scoreInput.trim();
  const submission = await prisma.submission.upsert({
    where: { postId_studentId: { postId, studentId } },
    update: {},
    create: { postId, studentId, status: "ASSIGNED" },
  });

  if (trimmed === "") {
    await prisma.grade.deleteMany({ where: { submissionId: submission.id } });
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: submission.submittedAt ? "TURNED_IN" : "ASSIGNED" },
    });
  } else {
    const score = Number(trimmed);
    if (Number.isNaN(score) || score < 0) throw new Error("Enter a valid non-negative score.");

    await prisma.$transaction([
      prisma.grade.upsert({
        where: { submissionId: submission.id },
        update: { score, gradedById: user.id, gradedAt: new Date() },
        create: { submissionId: submission.id, score, gradedById: user.id },
      }),
      prisma.submission.update({ where: { id: submission.id }, data: { status: "RETURNED" } }),
    ]);
  }

  revalidatePath(`/classes/${classId}/grades`);
  revalidatePath(`/grades`);
}
