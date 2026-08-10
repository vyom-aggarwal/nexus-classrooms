import { BookOpen } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getMyClasses } from "@/lib/queries/classes";
import { EmptyState } from "@/components/empty-state";
import { ClassCard } from "@/components/classes/class-card";
import { ClassActionPanel } from "@/components/classes/class-action-panel";

export default async function ClassesPage() {
  const user = await requireUser();
  const classes = await getMyClasses(user.id, user.role);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">Classes</h1>
          <p className="text-[var(--text-secondary)] mt-1.5">
            {classes.length === 0
              ? user.role === "TEACHER"
                ? "Create your first class to get started."
                : "Join a class with an invite code."
              : `${classes.length} active ${classes.length === 1 ? "class" : "classes"}`}
          </p>
        </div>
      </div>

      <ClassActionPanel role={user.role} />

      {classes.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={26} />}
          title={user.role === "TEACHER" ? "No classes yet" : "You haven't joined a class yet"}
          description={
            user.role === "TEACHER"
              ? "Create your first class to start posting assignments and inviting students."
              : "Ask your teacher for an invite code, then join above."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              id={c.id}
              name={c.name}
              subject={c.subject}
              section={c.section}
              accentColor={c.accentColor}
              studentCount={c._count.enrollments}
              ownerName={user.role === "STUDENT" ? c.owner.name : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
