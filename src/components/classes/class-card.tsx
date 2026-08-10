import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NeumorphicCard, Surface } from "@/components/ui/surface";

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
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link href={`/classes/${id}`} className="group block h-full">
      <NeumorphicCard className="flex flex-col gap-4 h-full transition-transform duration-200 group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          {/* The class accent is carried by a lit token rather than a flat bar,
              so each class stays identifiable without breaking the palette. */}
          <Surface
            variant="raised"
            depth="sm"
            rounded="control"
            className="h-11 w-11 shrink-0 flex items-center justify-center text-lg font-bold text-white"
            style={{
              background: `linear-gradient(145deg, color-mix(in srgb, ${accentColor} 82%, white), ${accentColor})`,
              boxShadow: `0 0 18px color-mix(in srgb, ${accentColor} 45%, transparent)`,
            }}
          >
            {initial}
          </Surface>
          <ArrowUpRight
            size={18}
            className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          />
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--text-primary)] truncate">{name}</h3>
          {subtitle && <p className="text-sm text-[var(--text-secondary)] truncate">{subtitle}</p>}
        </div>

        <Surface variant="pressed" rounded="control" depth="sm" className="px-3 py-2 mt-auto">
          <p className="text-xs text-[var(--text-muted)] truncate">
            {ownerName ? `Taught by ${ownerName}` : `${studentCount} student${studentCount === 1 ? "" : "s"}`}
          </p>
        </Surface>
      </NeumorphicCard>
    </Link>
  );
}
