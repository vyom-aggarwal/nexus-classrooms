import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { Surface } from "@/components/ui/surface";
import { EmptyState } from "@/components/empty-state";
import { Users } from "lucide-react";

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
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Teacher</h2>
        {owner && <PersonRow name={owner.name} email={owner.email} />}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Students ({enrollments.length})
        </h2>
        {enrollments.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="No students yet" description="Share the invite code to get students enrolled." />
        ) : (
          <Surface variant="raised" className="p-2 flex flex-col divide-y divide-[var(--surface-shadow)]/20">
            {enrollments.map((e) => (
              <PersonRow key={e.id} name={e.user.name} email={e.user.email} />
            ))}
          </Surface>
        )}
      </section>
    </div>
  );
}

function PersonRow({ name, email }: { name: string; email: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-3 p-3">
      <Surface variant="pressed" rounded="full" className="h-9 w-9 flex items-center justify-center font-semibold text-[var(--accent)] shrink-0">
        {initial}
      </Surface>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{name}</p>
        <p className="text-xs text-[var(--text-muted)] truncate">{email}</p>
      </div>
    </div>
  );
}
