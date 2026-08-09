import Link from "next/link";
import { NeumorphicCard } from "@/components/ui/surface";

export function ClassCard({
  id,
  name,
  subject,
  section,
  accentColor,
  studentCount,
  ownerName,
}: {
  id: string;
  name: string;
  subject?: string | null;
  section?: string | null;
  accentColor: string;
  studentCount: number;
  ownerName?: string;
}) {
  const subtitle = [subject, section].filter(Boolean).join(" · ");

  return (
    <Link href={`/classes/${id}`}>
      <NeumorphicCard className="flex flex-col gap-3 h-full">
        <div className="h-2 w-10 rounded-full" style={{ background: accentColor }} />
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">{name}</h3>
          {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-auto">
          {ownerName
            ? `Taught by ${ownerName}`
            : `${studentCount} student${studentCount === 1 ? "" : "s"}`}
        </p>
      </NeumorphicCard>
    </Link>
  );
}
