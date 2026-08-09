import { requireUser } from "@/lib/session";
import { getClassForMember } from "@/lib/queries/classes";
import { Surface } from "@/components/ui/surface";
import { ClassTabs } from "@/components/classes/class-tabs";

export default async function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const user = await requireUser();
  const cls = await getClassForMember(classId, user.id);
  const isOwner = cls.ownerId === user.id;

  const subtitle = [cls.subject, cls.section].filter(Boolean).join(" · ");

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <Surface variant="raised" className="p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="h-2 w-12 rounded-full mb-3" style={{ background: cls.accentColor }} />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{cls.name}</h1>
            {subtitle && <p className="text-[var(--text-secondary)] mt-1">{subtitle}</p>}
          </div>
          {isOwner && (
            <Surface variant="pressed" className="px-4 py-2 text-sm text-[var(--text-secondary)]">
              Invite code: <span className="font-mono font-semibold text-[var(--text-primary)]">{cls.inviteCode}</span>
            </Surface>
          )}
        </div>
        <ClassTabs classId={classId} />
      </Surface>

      {children}
    </div>
  );
}
