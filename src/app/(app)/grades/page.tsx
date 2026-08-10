import Link from "next/link";
import { GraduationCap, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getMyClasses } from "@/lib/queries/classes";
import { getStudentGradesAllClasses } from "@/lib/queries/grades";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/ui/surface";
import { NeumorphicProgress } from "@/components/ui/progress";

export default async function GradesPage() {
  const user = await requireUser();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-7">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">Grades</h1>
      {user.role === "TEACHER" ? <TeacherGrades userId={user.id} /> : <StudentGrades userId={user.id} />}
    </div>
  );
}

async function TeacherGrades({ userId }: { userId: string }) {
  const classes = await getMyClasses(userId, "TEACHER");

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={<GraduationCap size={26} />}
        title="No classes yet"
        description="Create a class to start grading assignments."
      />
    );
  }

  return (
    <Surface variant="raised" className="p-3 flex flex-col neu-divide">
      {classes.map((c) => (
        <Link key={c.id} href={`/classes/${c.id}/grades`} className="flex items-center justify-between gap-4 p-4 group">
          <div className="flex items-center gap-3.5 min-w-0">
            <Surface
              variant="raised"
              depth="sm"
              rounded="control"
              className="h-10 w-10 shrink-0 flex items-center justify-center text-sm font-bold text-white"
              style={{
                background: `linear-gradient(145deg, color-mix(in srgb, ${c.accentColor} 82%, white), ${c.accentColor})`,
                boxShadow: `0 0 16px color-mix(in srgb, ${c.accentColor} 45%, transparent)`,
              }}
            >
              {c.name.charAt(0).toUpperCase()}
            </Surface>
            <div className="min-w-0">
              <p className="font-medium text-[var(--text-primary)] truncate">{c.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {c._count.enrollments} student{c._count.enrollments === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-[var(--accent-text)] font-medium hidden sm:inline">Open gradebook</span>
            <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      ))}
    </Surface>
  );
}

async function StudentGrades({ userId }: { userId: string }) {
  const byClass = await getStudentGradesAllClasses(userId);

  if (byClass.length === 0) {
    return <EmptyState icon={<GraduationCap size={26} />} title="Join a class to see grades here" />;
  }

  return (
    <div className="flex flex-col gap-5">
      {byClass.map(({ class: cls, posts, overallPercent }) => {
        const graded = posts.filter((p) => p.submissions[0]?.grade);

        return (
          <Surface key={cls.id} variant="raised" className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Surface
                  variant="raised"
                  depth="sm"
                  rounded="control"
                  className="h-10 w-10 shrink-0 flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(145deg, color-mix(in srgb, ${cls.accentColor} 82%, white), ${cls.accentColor})`,
                    boxShadow: `0 0 16px color-mix(in srgb, ${cls.accentColor} 45%, transparent)`,
                  }}
                >
                  {cls.name.charAt(0).toUpperCase()}
                </Surface>
                <Link
                  href={`/classes/${cls.id}/grades`}
                  className="font-semibold text-[var(--text-primary)] truncate hover:text-[var(--accent-text)] transition-colors"
                >
                  {cls.name}
                </Link>
              </div>
              <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums shrink-0">
                {overallPercent != null ? `${Math.round(overallPercent)}%` : "—"}
              </span>
            </div>

            {overallPercent != null && (
              <NeumorphicProgress
                value={overallPercent}
                tone={overallPercent >= 80 ? "success" : overallPercent >= 60 ? "warning" : "danger"}
                label={`${cls.name} overall grade`}
              />
            )}

            {graded.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No graded work yet.</p>
            ) : (
              <div className="flex flex-col neu-divide">
                {graded.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="text-sm text-[var(--text-secondary)] truncate">{p.title}</span>
                    <span className="text-sm text-[var(--text-primary)] font-semibold shrink-0 tabular-nums">
                      {p.submissions[0].grade!.score}
                      {p.points != null ? ` / ${p.points}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Surface>
        );
      })}
    </div>
  );
}
