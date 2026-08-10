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
      <Surface variant="raised" className="p-6 md:p-7 flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <Surface
              variant="raised"
              depth="sm"
              rounded="control"
              className="h-14 w-14 shrink-0 flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: `linear-gradient(145deg, color-mix(in srgb, ${cls.accentColor} 82%, white), ${cls.accentColor})`,
                boxShadow: `0 0 22px color-mix(in srgb, ${cls.accentColor} 45%, transparent)`,
              }}
            >
              {cls.name.charAt(0).toUpperCase()}
            </Surface>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight truncate">
                {cls.name}
              </h1>
              {subtitle && <p className="text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {isOwner && (
            <Surface
              variant="pressed"
              rounded="control"
              className="px-4 py-2.5 flex flex-col gap-0.5 shrink-0"
            >
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Invite code
              </span>
              <span className="font-mono font-bold text-[var(--text-primary)] tracking-widest">
                {cls.inviteCode}
              </span>
            </Surface>
          )}
        </div>

        <ClassTabs classId={classId} />
      </Surface>

      {children}
    </div>
  );
}
