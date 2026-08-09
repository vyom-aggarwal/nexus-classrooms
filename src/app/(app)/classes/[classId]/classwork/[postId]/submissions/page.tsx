import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { getSubmissionsForPost } from "@/lib/queries/classwork";
import { prisma } from "@/lib/prisma";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/classwork/status-badge";

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ classId: string; postId: string }>;
}) {
  const { classId, postId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);
  if (cls.ownerId !== user.id) notFound();

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { title: true, points: true } });
  if (!post) notFound();

  const rows = await getSubmissionsForPost(classId, postId);
  const turnedIn = rows.filter((r) => r.submission?.status === "TURNED_IN" || r.submission?.status === "RETURNED").length;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{post.title}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {turnedIn} of {rows.length} turned in
        </p>
      </div>

      <Surface variant="raised" className="p-2 flex flex-col divide-y divide-[var(--surface-shadow)]/20">
        {rows.map(({ student, submission }) => {
          const status = submission?.status ?? "MISSING";
          const content = (
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{student.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {submission?.grade ? `Scored ${submission.grade.score}${post.points != null ? ` / ${post.points}` : ""}` : student.email}
                </p>
              </div>
              <StatusBadge status={status} />
            </div>
          );

          return submission ? (
            <Link key={student.id} href={`/classes/${classId}/classwork/${postId}/submissions/${submission.id}`}>
              {content}
            </Link>
          ) : (
            <div key={student.id}>{content}</div>
          );
        })}
      </Surface>
    </div>
  );
}
