import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { Surface } from "@/components/ui/surface";
import { EmptyState } from "@/components/empty-state";

export default async function ClassPeoplePage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);

  const [owner, enrollments] = await Promise.all([
    prisma.user.findUnique({ where: { id: cls.ownerId }, select: { id: true, name: true, email: true } }),
    prisma.enrollment.findMany({
      where: { classId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Teacher</h2>
        {owner && (
          <Surface variant="raised" className="p-3">
            <PersonRow name={owner.name} email={owner.email} accent />
          </Surface>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Students{" "}
          <span className="text-[var(--text-muted)] font-normal">({enrollments.length})</span>
        </h2>
        {enrollments.length === 0 ? (
          <EmptyState
            icon={<Users size={26} />}
            title="No students yet"
            description="Share the invite code to get students enrolled."
          />
        ) : (
          <Surface variant="raised" className="p-3 flex flex-col neu-divide">
            {enrollments.map((e) => (
              <PersonRow key={e.id} name={e.user.name} email={e.user.email} />
            ))}
          </Surface>
        )}
      </section>
    </div>
  );
}

function PersonRow({ name, email, accent }: { name: string; email: string; accent?: boolean }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-3.5 p-3">
      <Surface
        variant={accent ? "raised" : "pressed"}
        depth="sm"
        rounded="full"
        className="h-11 w-11 shrink-0 flex items-center justify-center text-sm font-bold"
        style={
          accent
            ? {
                background: "linear-gradient(145deg,var(--accent-hover),var(--accent))",
                color: "var(--accent-foreground)",
                boxShadow: "var(--glow-accent)",
              }
            : { color: "var(--accent-text)" }
        }
      >
        {initials}
      </Surface>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{name}</p>
        <p className="text-xs text-[var(--text-muted)] truncate">{email}</p>
      </div>
    </div>
  );
}
