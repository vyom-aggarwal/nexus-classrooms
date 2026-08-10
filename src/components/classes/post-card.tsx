import { format } from "date-fns";
import { FileText, ClipboardList, Megaphone, Clock, Award } from "lucide-react";
import { NeumorphicCard, Surface } from "@/components/ui/surface";

const TYPE_META = {
  ANNOUNCEMENT: { icon: Megaphone, label: "Announcement", tone: "var(--accent)" },
  ASSIGNMENT: { icon: ClipboardList, label: "Assignment", tone: "var(--warning)" },
  MATERIAL: { icon: FileText, label: "Material", tone: "var(--success)" },
} as const;

export function PostCard({
  type,
  title,
  body,
  authorName,
  createdAt,
  dueAt,
  points,
}: {
  type: "ANNOUNCEMENT" | "ASSIGNMENT" | "MATERIAL";
  title: string;
  body?: string | null;
  authorName: string;
  createdAt: Date;
  dueAt?: Date | null;
  points?: number | null;
}) {
  const { icon: Icon, label, tone } = TYPE_META[type];

  return (
    <NeumorphicCard className="flex gap-4">
      <Surface
        variant="pressed"
        depth="sm"
        rounded="control"
        className="h-11 w-11 shrink-0 flex items-center justify-center"
        style={{ color: tone }}
      >
        <Icon size={19} />
      </Surface>

      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
          <span className="font-semibold uppercase tracking-wide" style={{ color: tone }}>
            {label}
          </span>
          <span aria-hidden>·</span>
          <span>{authorName}</span>
          <span aria-hidden>·</span>
          <span>{format(createdAt, "MMM d, h:mm a")}</span>
        </div>

        {type !== "ANNOUNCEMENT" && (
          <h3 className="font-semibold text-[var(--text-primary)] text-lg leading-snug">{title}</h3>
        )}
        {body && (
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{body}</p>
        )}

        {(dueAt || points != null) && (
          <div className="flex flex-wrap gap-2 mt-1">
            {dueAt && (
              <Surface
                variant="pressed"
                depth="sm"
                rounded="full"
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] inline-flex items-center gap-1.5"
              >
                <Clock size={12} />
                Due {format(dueAt, "MMM d, h:mm a")}
              </Surface>
            )}
            {points != null && (
              <Surface
                variant="pressed"
                depth="sm"
                rounded="full"
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] inline-flex items-center gap-1.5"
              >
                <Award size={12} />
                {points} pts
              </Surface>
            )}
          </div>
        )}
      </div>
    </NeumorphicCard>
  );
}
