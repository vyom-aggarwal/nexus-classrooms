import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getMyClasses } from "@/lib/queries/classes";
import { getStudentGradesAllClasses } from "@/lib/queries/grades";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/ui/surface";

export default async function GradesPage() {
  const user = await requireUser();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Grades</h1>
      {user.role === "TEACHER" ? <TeacherGrades userId={user.id} /> : <StudentGrades userId={user.id} />}
    </div>
  );
}

async function TeacherGrades({ userId }: { userId: string }) {
  const classes = await getMyClasses(userId, "TEACHER");

  if (classes.length === 0) {
    return <EmptyState icon={<GraduationCap size={28} />} title="No classes yet" description="Create a class to start grading assignments." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {classes.map((c) => (
        <Link key={c.id} href={`/classes/${c.id}/grades`}>
          <Surface variant="raised" className="p-4 flex items-center justify-between">
            <span className="font-medium text-[var(--text-primary)]">{c.name}</span>
            <span className="text-sm text-[var(--accent)] font-medium">Open gradebook →</span>
          </Surface>
        </Link>
      ))}
    </div>
  );
}

async function StudentGrades({ userId }: { userId: string }) {
  const byClass = await getStudentGradesAllClasses(userId);

  if (byClass.length === 0) {
    return <EmptyState icon={<GraduationCap size={28} />} title="Join a class to see grades here" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {byClass.map(({ class: cls, posts, overallPercent }) => (
        <Surface key={cls.id} variant="raised" className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-8 rounded-full" style={{ background: cls.accentColor }} />
              <Link href={`/classes/${cls.id}/grades`} className="font-semibold text-[var(--text-primary)]">
                {cls.name}
              </Link>
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {overallPercent != null ? `${Math.round(overallPercent)}%` : "—"}
            </span>
          </div>
          {posts.filter((p) => p.submissions[0]?.grade).length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No graded work yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {posts
                .filter((p) => p.submissions[0]?.grade)
                .map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{p.title}</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {p.submissions[0].grade!.score}
                      {p.points != null ? ` / ${p.points}` : ""}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Surface>
      ))}
    </div>
  );
}
