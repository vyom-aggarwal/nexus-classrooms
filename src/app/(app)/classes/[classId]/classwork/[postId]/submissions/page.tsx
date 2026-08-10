import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { getSubmissionsForPost } from "@/lib/queries/classwork";
import { prisma } from "@/lib/prisma";
import { Surface } from "@/components/ui/surface";
import { NeumorphicProgress } from "@/components/ui/progress";
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
  const turnedIn = rows.filter(
    (r) => r.submission?.status === "TURNED_IN" || r.submission?.status === "RETURNED",
  ).length;
  const graded = rows.filter((r) => r.submission?.grade).length;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Surface variant="raised" className="p-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{post.title}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {turnedIn} of {rows.length} turned in · {graded} graded
          </p>
        </div>
        <NeumorphicProgress
          value={turnedIn}
          max={rows.length || 1}
          tone="success"
          label="Submissions turned in"
        />
      </Surface>

      <Surface variant="raised" className="p-3 flex flex-col neu-divide">
        {rows.map(({ student, submission }) => {
          const status = submission?.status ?? "MISSING";
          const inner = (
            <div className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-3 min-w-0">
                <Surface
                  variant="pressed"
                  depth="sm"
                  rounded="full"
                  className="h-9 w-9 shrink-0 flex items-center justify-center text-xs font-bold text-[var(--accent-text)]"
                >
                  {student.name.charAt(0).toUpperCase()}
                </Surface>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{student.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {submission?.grade
                      ? `Scored ${submission.grade.score}${post.points != null ? ` / ${post.points}` : ""}`
                      : student.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={status} />
                {submission && <ChevronRight size={16} className="text-[var(--text-muted)]" />}
              </div>
            </div>
          );

          return submission ? (
            <Link
              key={student.id}
              href={`/classes/${classId}/classwork/${postId}/submissions/${submission.id}`}
              className="group"
            >
              {inner}
            </Link>
          ) : (
            <div key={student.id}>{inner}</div>
          );
        })}
      </Surface>
    </div>
  );
}
