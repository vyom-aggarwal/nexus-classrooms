import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ attachmentId: string }> }) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const { attachmentId } = await params;
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: {
      post: { select: { classId: true, class: { select: { ownerId: true } } } },
      submissionAttachments: {
        include: {
          submission: { select: { studentId: true, post: { select: { class: { select: { ownerId: true } } } } } },
        },
      },
    },
  });
  if (!attachment) return new NextResponse("Not found", { status: 404 });

  const allowed = await canAccessAttachment(attachment, userId);
  if (!allowed) return new NextResponse("Forbidden", { status: 403 });

  const file = await storage.get(attachment.url);
  if (!file) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.filename)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

async function canAccessAttachment(
  attachment: {
    post: { classId: string; class: { ownerId: string } } | null;
    submissionAttachments: Array<{
      submission: { studentId: string; post: { class: { ownerId: string } } };
    }>;
  },
  userId: string,
) {
  if (attachment.post) {
    if (attachment.post.class.ownerId === userId) return true;
    const enrolled = await prisma.enrollment.findUnique({
      where: { classId_userId: { classId: attachment.post.classId, userId } },
    });
    return !!enrolled;
  }

  for (const sa of attachment.submissionAttachments) {
    if (sa.submission.studentId === userId) return true;
    if (sa.submission.post.class.ownerId === userId) return true;
  }

  return false;
}
