import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Users, Clock, Award, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { getPostDetail } from "@/lib/queries/classwork";
import { Surface } from "@/components/ui/surface";
import { neumorphicButtonClasses } from "@/components/ui/button";
import { AttachmentList } from "@/components/classwork/attachment-list";
import { SubmissionComposer } from "@/components/classwork/submission-composer";
import { StatusBadge } from "@/components/classwork/status-badge";

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
      <Surface variant="raised" className="p-6 md:p-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {post.topic && (
                <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  {post.topic.title}
                </span>
              )}
              {post.status === "DRAFT" && <StatusBadge status="DRAFT" />}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{post.title}</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Posted by {post.author.name} · {format(post.createdAt, "MMM d, yyyy")}
            </p>
          </div>
          {isOwner && (
            <Link
              href={`/classes/${classId}/classwork/${post.id}/edit`}
              className={neumorphicButtonClasses({ size: "sm", className: "shrink-0" })}
            >
              <Pencil size={15} />
              Edit
            </Link>
          )}
        </div>

        {(post.dueAt || post.points != null) && (
          <div className="flex flex-wrap gap-2.5">
            {post.dueAt && (
              <Surface
                variant="pressed"
                depth="sm"
                rounded="full"
                className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] inline-flex items-center gap-2"
              >
                <Clock size={13} />
                Due {format(post.dueAt, "MMM d, yyyy 'at' h:mm a")}
              </Surface>
            )}
            {post.points != null && (
              <Surface
                variant="pressed"
                depth="sm"
                rounded="full"
                className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] inline-flex items-center gap-2"
              >
                <Award size={13} />
                {post.points} points
              </Surface>
            )}
          </div>
        )}

        {post.body && (
          <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{post.body}</p>
        )}

        <AttachmentList attachments={post.attachments} />

        {isOwner && post.type === "ASSIGNMENT" && (
          <Link href={`/classes/${classId}/classwork/${post.id}/submissions`} className="block group">
            <Surface
              variant="pressed"
              rounded="control"
              className="p-4 flex items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium text-[var(--text-primary)]">
                <Users size={17} className="text-[var(--accent-text)]" />
                View submissions
              </span>
              <span className="flex items-center gap-1 text-sm text-[var(--accent-text)] font-medium">
                Open
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
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
