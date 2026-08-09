import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Users } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { getPostDetail } from "@/lib/queries/classwork";
import { Surface } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { AttachmentList } from "@/components/classwork/attachment-list";
import { SubmissionComposer } from "@/components/classwork/submission-composer";

export default async function ClassworkDetailPage({
  params,
}: {
  params: Promise<{ classId: string; postId: string }>;
}) {
  const { classId, postId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);
  const isOwner = cls.ownerId === user.id;

  const post = await getPostDetail(postId, user.id, isOwner);
  const mySubmission = !isOwner ? post.submissions[0] : undefined;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Surface variant="raised" className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            {post.topic && (
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">{post.topic.title}</p>
            )}
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{post.title}</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Posted by {post.author.name} · {format(post.createdAt, "MMM d, yyyy")}
              {post.status === "DRAFT" && " · Draft"}
            </p>
          </div>
          {isOwner && (
            <Link href={`/classes/${classId}/classwork/${post.id}/edit`}>
              <NeumorphicButton variant="flat" size="sm">
                <Pencil size={16} />
                Edit
              </NeumorphicButton>
            </Link>
          )}
        </div>

        {(post.dueAt || post.points != null) && (
          <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
            {post.dueAt && <span>Due {format(post.dueAt, "MMM d, yyyy 'at' h:mm a")}</span>}
            {post.points != null && <span>{post.points} points</span>}
          </div>
        )}

        {post.body && <p className="text-[var(--text-primary)] whitespace-pre-wrap">{post.body}</p>}

        <AttachmentList attachments={post.attachments} />

        {isOwner && post.type === "ASSIGNMENT" && (
          <Link href={`/classes/${classId}/classwork/${post.id}/submissions`}>
            <Surface variant="pressed" className="p-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <Users size={16} />
                View submissions
              </span>
              <span className="text-sm text-[var(--accent)] font-medium">Open →</span>
            </Surface>
          </Link>
        )}
      </Surface>

      {!isOwner && post.type === "ASSIGNMENT" && (
        <SubmissionComposer
          postId={post.id}
          points={post.points}
          submission={
            mySubmission
              ? {
                  status: mySubmission.status,
                  content: mySubmission.content,
                  attachments: mySubmission.attachments,
                  grade: mySubmission.grade,
                }
              : null
          }
        />
      )}
    </div>
  );
}
