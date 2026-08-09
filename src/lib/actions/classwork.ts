"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { storage } from "@/lib/storage";
import type { FormState } from "@/lib/actions/auth";

const LINK_MIME_TYPE = "text/uri-list";

function filesFromFormData(formData: FormData, field: string): File[] {
  return formData
    .getAll(field)
    .filter((f): f is File => f instanceof File && f.size > 0);
}

const postSchema = z.object({
  type: z.enum(["ASSIGNMENT", "MATERIAL"]),
  title: z.string().trim().min(1, "Title is required").max(200),
  body: z.string().trim().max(10_000).optional(),
  topicId: z.string().optional(),
  dueAt: z.string().optional(),
  points: z.string().optional(),
  intent: z.enum(["draft", "publish"]),
});

export async function savePostAction(
  classId: string,
  postId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const cls = await prisma.class.findUnique({ where: { id: classId }, select: { ownerId: true } });
  if (!cls || cls.ownerId !== user.id) return { error: "You can't post classwork to this class." };

  const parsed = postSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    body: formData.get("body") || undefined,
    topicId: formData.get("topicId") || undefined,
    dueAt: formData.get("dueAt") || undefined,
    points: formData.get("points") || undefined,
    intent: formData.get("intent"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { type, title, body, topicId, intent } = parsed.data;
  const dueAt = type === "ASSIGNMENT" && parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  const points = type === "ASSIGNMENT" && parsed.data.points ? Number(parsed.data.points) : null;
  const status: "PUBLISHED" | "DRAFT" = intent === "publish" ? "PUBLISHED" : "DRAFT";

  const data = {
    type,
    title,
    body: body ?? null,
    topicId: topicId || null,
    dueAt,
    points: points != null && !Number.isNaN(points) ? points : null,
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  };

  const post = postId
    ? await prisma.post.update({ where: { id: postId }, data })
    : await prisma.post.create({ data: { ...data, classId, authorId: user.id } });

  const files = filesFromFormData(formData, "attachments");
  for (const file of files) {
    const stored = await storage.put(file);
    await prisma.attachment.create({
      data: { postId: post.id, filename: stored.filename, url: stored.key, mimeType: stored.mimeType, size: stored.size },
    });
  }

  const linkUrl = formData.get("linkUrl");
  if (typeof linkUrl === "string" && linkUrl.trim()) {
    await prisma.attachment.create({
      data: {
        postId: post.id,
        filename: (formData.get("linkLabel") as string) || linkUrl,
        url: linkUrl.trim(),
        mimeType: LINK_MIME_TYPE,
        size: 0,
      },
    });
  }

  revalidatePath(`/classes/${classId}/classwork`);
  redirect(`/classes/${classId}/classwork/${post.id}`);
}

const topicSchema = z.object({ title: z.string().trim().min(1).max(100) });

export async function createTopicAction(classId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const cls = await prisma.class.findUnique({ where: { id: classId }, select: { ownerId: true } });
  if (!cls || cls.ownerId !== user.id) return { error: "You can't add topics to this class." };

  const parsed = topicSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: "Enter a topic name" };

  const count = await prisma.topic.count({ where: { classId } });
  await prisma.topic.create({ data: { classId, title: parsed.data.title, order: count } });

  revalidatePath(`/classes/${classId}/classwork`);
  return null;
}

export async function submitWorkAction(postId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "STUDENT") return { error: "Only students can submit work." };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, classId: true, type: true, status: true },
  });
  if (!post || post.type !== "ASSIGNMENT" || post.status !== "PUBLISHED") {
    return { error: "This assignment isn't available." };
  }

  const enrolled = await prisma.enrollment.findUnique({
    where: { classId_userId: { classId: post.classId, userId: user.id } },
  });
  if (!enrolled) return { error: "You're not enrolled in this class." };

  const content = (formData.get("content") as string | null)?.trim() || null;
  const files = filesFromFormData(formData, "files");

  const submission = await prisma.submission.upsert({
    where: { postId_studentId: { postId, studentId: user.id } },
    update: { content, status: "TURNED_IN", submittedAt: new Date() },
    create: { postId, studentId: user.id, content, status: "TURNED_IN", submittedAt: new Date() },
  });

  for (const file of files) {
    const stored = await storage.put(file);
    const attachment = await prisma.attachment.create({
      data: { filename: stored.filename, url: stored.key, mimeType: stored.mimeType, size: stored.size },
    });
    await prisma.submissionAttachment.create({
      data: { submissionId: submission.id, attachmentId: attachment.id },
    });
  }

  revalidatePath(`/classes/${post.classId}/classwork/${postId}`);
  return null;
}
