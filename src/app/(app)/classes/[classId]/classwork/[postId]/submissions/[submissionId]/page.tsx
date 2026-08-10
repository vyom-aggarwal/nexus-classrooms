import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { prisma } from "@/lib/prisma";
import { Surface } from "@/components/ui/surface";
import { AttachmentList } from "@/components/classwork/attachment-list";
import { StatusBadge } from "@/components/classwork/status-badge";
import { GradeForm } from "@/components/classwork/grade-form";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ classId: string; postId: string; submissionId: string }>;
}) {
  const { classId, postId, submissionId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);
  if (cls.ownerId !== user.id) notFound();

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: { select: { name: true, email: true } },
      post: { select: { title: true, points: true, classId: true } },
      attachments: { include: { attachment: true } },
      grade: true,
    },
  });

  if (!submission || submission.post.classId !== classId) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Surface variant="raised" className="p-6 md:p-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Surface
              variant="pressed"
              depth="sm"
              rounded="full"
              className="h-12 w-12 shrink-0 flex items-center justify-center text-sm font-bold text-[var(--accent-text)]"
            >
              {submission.student.name.charAt(0).toUpperCase()}
            </Surface>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[var(--text-primary)] truncate">
                {submission.student.name}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] truncate">{submission.post.title}</p>
            </div>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        {submission.submittedAt && (
          <p className="text-xs text-[var(--text-muted)]">
            Submitted {format(submission.submittedAt, "MMM d, yyyy 'at' h:mm a")}
          </p>
        )}

        {submission.content && (
          <Surface variant="pressed" rounded="control" className="p-5">
            <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
              {submission.content}
            </p>
          </Surface>
        )}

        <AttachmentList attachments={submission.attachments.map((a) => a.attachment)} />

        {!submission.content && submission.attachments.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No work submitted yet.</p>
        )}
      </Surface>

      <Surface variant="raised" className="p-6 md:p-7 flex flex-col gap-4">
        <h2 className="font-semibold text-[var(--text-primary)] text-lg">Grade</h2>
        <GradeForm
          classId={classId}
          postId={postId}
          submissionId={submission.id}
          points={submission.post.points}
          initial={{ score: submission.grade?.score ?? null, feedback: submission.grade?.feedback ?? null }}
        />
      </Surface>
    </div>
  );
}
