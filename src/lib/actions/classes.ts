"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { generateInviteCode } from "@/lib/invite-code";
import type { FormState } from "@/lib/actions/auth";

const ACCENT_COLORS = ["#6a63f1", "#e0507a", "#1f9d6c", "#c98a1f", "#3b82c4", "#a5548d"];

const createClassSchema = z.object({
  name: z.string().trim().min(1, "Class name is required").max(100),
  subject: z.string().trim().max(100).optional(),
  section: z.string().trim().max(100).optional(),
});

export async function createClassAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "TEACHER") return { error: "Only teachers can create classes." };

  const parsed = createClassSchema.safeParse({
    name: formData.get("name"),
    subject: formData.get("subject") || undefined,
    section: formData.get("section") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  let created: { id: string } | null = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    try {
      created = await prisma.class.create({
        data: {
          ...parsed.data,
          ownerId: user.id,
          inviteCode: generateInviteCode(),
          accentColor: ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)],
        },
        select: { id: true },
      });
    } catch (err: unknown) {
      const isUniqueViolation =
        typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002";
      if (!isUniqueViolation) throw err;
    }
  }

  if (!created) return { error: "Couldn't generate a unique invite code. Try again." };

  revalidatePath("/classes");
  redirect(`/classes/${created.id}`);
}

const joinClassSchema = z.object({
  inviteCode: z.string().trim().min(1, "Enter an invite code"),
});

export async function joinClassAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "STUDENT") return { error: "Only students can join classes with a code." };

  const parsed = joinClassSchema.safeParse({ inviteCode: formData.get("inviteCode") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const code = parsed.data.inviteCode.toUpperCase();
  const cls = await prisma.class.findUnique({ where: { inviteCode: code } });
  if (!cls || cls.archivedAt) return { error: "No class found with that invite code." };

  const existing = await prisma.enrollment.findUnique({
    where: { classId_userId: { classId: cls.id, userId: user.id } },
  });
  if (existing) redirect(`/classes/${cls.id}`);

  await prisma.enrollment.create({ data: { classId: cls.id, userId: user.id } });

  revalidatePath("/classes");
  redirect(`/classes/${cls.id}`);
}

const postAnnouncementSchema = z.object({
  body: z.string().trim().min(1, "Write something to post"),
});

export async function postAnnouncementAction(
  classId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const cls = await prisma.class.findUnique({ where: { id: classId }, select: { ownerId: true } });
  if (!cls || cls.ownerId !== user.id) return { error: "You can't post to this class." };

  const parsed = postAnnouncementSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.post.create({
    data: {
      classId,
      authorId: user.id,
      type: "ANNOUNCEMENT",
      status: "PUBLISHED",
      title: "Announcement",
      body: parsed.data.body,
      publishedAt: new Date(),
    },
  });

  revalidatePath(`/classes/${classId}`);
  return null;
}
