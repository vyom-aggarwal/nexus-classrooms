import { GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { getGradebook, getStudentGradesForClass } from "@/lib/queries/grades";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/ui/surface";
import { NeumorphicProgress } from "@/components/ui/progress";
import { GradebookGrid } from "@/components/classwork/gradebook-grid";

export default async function ClassGradesPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);
  const isOwner = cls.ownerId === user.id;

  if (isOwner) {
    const { assignments, students, cells, studentAverages, assignmentAverages } = await getGradebook(classId);

    if (assignments.length === 0 || students.length === 0) {
      return (
        <EmptyState
          icon={<GraduationCap size={28} />}
          title="Nothing to grade yet"
          description="Publish an assignment and enroll students to see the gradebook."
        />
      );
    }

    const scores: Record<string, Record<string, number | undefined>> = {};
    for (const a of assignments) {
      scores[a.id] = {};
      for (const s of students) {
        scores[a.id][s.id] = cells.get(`${a.id}:${s.id}`)?.grade?.score;
      }
    }

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--text-secondary)]">Click any cell to enter or edit a score.</p>
        <GradebookGrid
          classId={classId}
          assignments={assignments}
          students={students}
          scores={scores}
          studentAverages={Object.fromEntries(studentAverages)}
          assignmentAverages={Object.fromEntries(assignmentAverages)}
        />
      </div>
    );
  }

  const { posts, overallPercent } = await getStudentGradesForClass(classId, user.id);

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <Surface variant="raised" className="p-6 flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <span className="text-sm text-[var(--text-secondary)]">Overall grade</span>
          <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums leading-none">
            {overallPercent != null ? `${Math.round(overallPercent)}%` : "—"}
          </span>
        </div>
        {overallPercent != null && (
          <NeumorphicProgress
            value={overallPercent}
            tone={overallPercent >= 80 ? "success" : overallPercent >= 60 ? "warning" : "danger"}
            label="Overall grade"
          />
        )}
      </Surface>

      {posts.length === 0 ? (
        <EmptyState icon={<GraduationCap size={26} />} title="No graded work yet" />
      ) : (
        <Surface variant="raised" className="p-3 flex flex-col neu-divide">
          {posts.map((post) => {
            const grade = post.submissions[0]?.grade;
            return (
              <div key={post.id} className="p-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                  {post.dueAt && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Due {format(post.dueAt, "MMM d")}</p>
                  )}
                  {grade?.feedback && (
                    <Surface
                      variant="pressed"
                      depth="sm"
                      rounded="control"
                      className="mt-2 px-3 py-2 text-xs text-[var(--text-secondary)] leading-relaxed"
                    >
                      {grade.feedback}
                    </Surface>
                  )}
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)] shrink-0 tabular-nums">
                  {grade ? `${grade.score}${post.points != null ? ` / ${post.points}` : ""}` : "—"}
                </span>
              </div>
            );
          })}
        </Surface>
      )}
    </div>
  );
}
